import type { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { DataKeluarga, PermohonanSurat } from '../data/citizenData';
import { GANG_LIST, type GangName } from '../data/gangList';
import { INITIAL_PROGRAM_KERJA, type ProgramKerjaItem } from '../data/programKerja';

export const BOOTSTRAPPED_ADMIN_EMAILS = [
  'rt05perumahanbsi@gmail.com',
];

export interface CitizenStatsSummary {
  totalKk: number;
  totalJiwa: number;
  totalLaki: number;
  totalPerempuan: number;
  totalKtpRt05: number;
  totalDomisili: number;
  gangCounts: Record<string, { kkCount: number; jiwaCount: number }>;
}

export function sanitizeDocId(rawId: string): string {
  const cleaned = String(rawId || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 128);
  return cleaned || `doc-${Date.now()}`;
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val.trim() : fallback;
  return str.slice(0, maxLen);
}

function normalizeGang(gang: unknown): GangName {
  if (typeof gang === 'string' && (GANG_LIST as readonly string[]).includes(gang)) {
    return gang as GangName;
  }
  return GANG_LIST[0];
}

async function ensureCompactAttachmentDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl || dataUrl.length <= 530_000) {
    return dataUrl;
  }

  if (typeof document === 'undefined' || !dataUrl.startsWith('data:image/')) {
    return dataUrl.slice(0, 530_000);
  }

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image load failed'));
      image.src = dataUrl;
    });

    for (const [maxDim, quality] of [
      [1024, 0.65],
      [900, 0.55],
      [760, 0.45],
    ] as const) {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const result = canvas.toDataURL('image/jpeg', quality);
      if (result.length <= 530_000) {
        return result;
      }
    }
  } catch {
    // fallback
  }
  return dataUrl.slice(0, 530_000);
}

export async function checkUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email && BOOTSTRAPPED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return true;
  }

  const adminPath = `admins/${sanitizeDocId(user.uid)}`;
  try {
    const snap = await getDoc(doc(db, 'admins', sanitizeDocId(user.uid)));
    return snap.exists();
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
      return false;
    }
    handleFirestoreError(error, OperationType.GET, adminPath);
  }
}

export async function saveCitizenToFirestore(
  citizen: DataKeluarga,
  user: User,
  isAdmin: boolean
): Promise<void> {
  if (!user.emailVerified) {
    throw new Error('Akun Google belum terverifikasi.');
  }

  const citizenId = sanitizeDocId(citizen.id);
  const ownerUid = sanitizeDocId(user.uid);
  const docPath = `citizens/${citizenId}`;
  const docRef = doc(db, 'citizens', citizenId);

  const sanitizedMembers = (Array.isArray(citizen.anggotaKeluarga) ? citizen.anggotaKeluarga : [])
    .slice(0, 20)
    .map((m) => ({
      id: sanitizeDocId(m.id || `ak-${Date.now()}`),
      namaLengkap: clampString(m.namaLengkap, 120, 'Warga'),
      nik: clampString(m.nik, 32),
      hubunganKeluarga: m.hubunganKeluarga || 'Kepala Keluarga',
      jenisKelamin: m.jenisKelamin === 'P' ? 'P' : 'L',
      tempatLahir: clampString(m.tempatLahir, 80),
      tanggalLahir: clampString(m.tanggalLahir, 32),
      usia: Math.max(0, Math.min(130, Math.trunc(Number(m.usia) || 0))),
      agama: m.agama || 'Islam',
      pendidikanTerakhir: clampString(m.pendidikanTerakhir, 60),
      pekerjaan: clampString(m.pekerjaan, 80),
      golonganDarah: m.golonganDarah || 'Belum Tahu',
      statusBpjs: m.statusBpjs || 'Belum Ada',
      statusPernikahan: m.statusPernikahan || 'Belum Menikah',
      kategoriKhusus: Array.isArray(m.kategoriKhusus) ? m.kategoriKhusus.slice(0, 4) : [],
    }));

  const hasFotoKtp = Boolean(citizen.fotoKtp && citizen.fotoKtp.length >= 10);
  const hasFotoKk = Boolean(citizen.fotoKk && citizen.fotoKk.length >= 10);

  const baseData: Record<string, unknown> = {
    id: citizenId,
    nomorKk: clampString(citizen.nomorKk, 32, '-'),
    namaKepalaKeluarga: clampString(citizen.namaKepalaKeluarga, 120, 'Kepala Keluarga'),
    nomorHp: clampString(citizen.nomorHp, 32, ''),
    gang: normalizeGang(citizen.gang),
    nomorRumah: clampString(citizen.nomorRumah, 64, '-'),
    statusHunian: ['Milik Sendiri', 'Kontrak / Sewa', 'Rumah Singgah / Kerabat'].includes(
      citizen.statusHunian
    )
      ? citizen.statusHunian
      : 'Milik Sendiri',
    statusKtp: ['KTP RT 05 (Warga Tetap)', 'KTP Luar (Warga Domisili)'].includes(citizen.statusKtp)
      ? citizen.statusKtp
      : 'KTP RT 05 (Warga Tetap)',
    tahunTinggal: clampString(citizen.tahunTinggal, 40, String(new Date().getFullYear())),
    jumlahKendaraan: {
      motor: Math.max(0, Math.min(50, Math.trunc(Number(citizen.jumlahKendaraan?.motor) || 0))),
      mobil: Math.max(0, Math.min(50, Math.trunc(Number(citizen.jumlahKendaraan?.mobil) || 0))),
    },
    anggotaKeluarga: sanitizedMembers,
    hasFotoKtp,
    hasFotoKk,
    tanggalUpdate: clampString(citizen.tanggalUpdate, 32, new Date().toISOString().slice(0, 10)),
  };

  if (citizen.email && citizen.email.trim()) {
    baseData.email = clampString(citizen.email, 200);
  }
  if (citizen.catatanKhusus && citizen.catatanKhusus.trim()) {
    baseData.catatanKhusus = clampString(citizen.catatanKhusus, 500);
  }

  let effectiveOwnerUid = ownerUid;

  try {
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        ...baseData,
        ownerUid,
        diverifikasiRt: isAdmin ? Boolean(citizen.diverifikasiRt) : false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = existingSnap.data();
      effectiveOwnerUid = sanitizeDocId(String(existingData.ownerUid || ownerUid));
      const updatePayload: Record<string, unknown> = {
        ...baseData,
        diverifikasiRt: isAdmin
          ? Boolean(citizen.diverifikasiRt)
          : Boolean(existingData.diverifikasiRt),
        updatedAt: serverTimestamp(),
      };
      delete updatePayload.id;
      await updateDoc(docRef, updatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }

  // Save KTP & KK attachments in split subcollection so documents stay well below 1MB
  if (hasFotoKtp && citizen.fotoKtp) {
    const ktpPath = `citizens/${citizenId}/attachments/ktp`;
    try {
      const compactKtp = await ensureCompactAttachmentDataUrl(citizen.fotoKtp);
      await setDoc(doc(db, 'citizens', citizenId, 'attachments', 'ktp'), {
        citizenId,
        ownerUid: effectiveOwnerUid,
        kind: 'ktp',
        dataUrl: compactKtp,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, ktpPath);
    }
  }

  if (hasFotoKk && citizen.fotoKk) {
    const kkPath = `citizens/${citizenId}/attachments/kk`;
    try {
      const compactKk = await ensureCompactAttachmentDataUrl(citizen.fotoKk);
      await setDoc(doc(db, 'citizens', citizenId, 'attachments', 'kk'), {
        citizenId,
        ownerUid: effectiveOwnerUid,
        kind: 'kk',
        dataUrl: compactKk,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, kkPath);
    }
  }
}

export async function loadCitizensFromFirestore(
  user: User,
  isAdmin: boolean
): Promise<DataKeluarga[]> {
  if (!user.emailVerified) return [];

  const path = 'citizens';
  try {
    const q = isAdmin
      ? collection(db, 'citizens')
      : query(collection(db, 'citizens'), where('ownerUid', '==', sanitizeDocId(user.uid)));

    const snap = await getDocs(q);
    const items = await Promise.all(
      snap.docs.map(async (d) => {
        const raw = d.data();
        const citizenId = sanitizeDocId(String(raw.id || d.id));
        let fotoKtp: string | undefined;
        let fotoKk: string | undefined;

        const attachTasks: Promise<void>[] = [];
        if (raw.hasFotoKtp) {
          attachTasks.push(
            getDoc(doc(db, 'citizens', citizenId, 'attachments', 'ktp'))
              .then((attSnap) => {
                if (attSnap.exists()) {
                  const url = attSnap.data().dataUrl;
                  if (typeof url === 'string') fotoKtp = url;
                }
              })
              .catch(() => undefined)
          );
        }
        if (raw.hasFotoKk) {
          attachTasks.push(
            getDoc(doc(db, 'citizens', citizenId, 'attachments', 'kk'))
              .then((attSnap) => {
                if (attSnap.exists()) {
                  const url = attSnap.data().dataUrl;
                  if (typeof url === 'string') fotoKk = url;
                }
              })
              .catch(() => undefined)
          );
        }
        await Promise.all(attachTasks);

        return {
          id: citizenId,
          nomorKk: String(raw.nomorKk || '-'),
          namaKepalaKeluarga: String(raw.namaKepalaKeluarga || ''),
          nomorHp: String(raw.nomorHp || ''),
          email: typeof raw.email === 'string' ? raw.email : undefined,
          gang: normalizeGang(raw.gang),
          nomorRumah: String(raw.nomorRumah || ''),
          statusHunian: raw.statusHunian || 'Milik Sendiri',
          statusKtp: raw.statusKtp || 'KTP RT 05 (Warga Tetap)',
          tahunTinggal: String(raw.tahunTinggal || ''),
          jumlahKendaraan: {
            motor: Number(raw.jumlahKendaraan?.motor || 0),
            mobil: Number(raw.jumlahKendaraan?.mobil || 0),
          },
          anggotaKeluarga: Array.isArray(raw.anggotaKeluarga) ? raw.anggotaKeluarga : [],
          fotoKtp,
          fotoKk,
          diverifikasiRt: Boolean(raw.diverifikasiRt),
          tanggalUpdate: String(raw.tanggalUpdate || ''),
          catatanKhusus: typeof raw.catatanKhusus === 'string' ? raw.catatanKhusus : undefined,
        } as DataKeluarga;
      })
    );

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteCitizenFromFirestore(citizenId: string): Promise<void> {
  const safeId = sanitizeDocId(citizenId);
  const path = `citizens/${safeId}`;
  try {
    await Promise.all([
      deleteDoc(doc(db, 'citizens', safeId, 'attachments', 'ktp')).catch(() => undefined),
      deleteDoc(doc(db, 'citizens', safeId, 'attachments', 'kk')).catch(() => undefined),
    ]);
    await deleteDoc(doc(db, 'citizens', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function computeCitizenStatsSummary(citizens: DataKeluarga[]): CitizenStatsSummary {
  const gangCounts: Record<string, { kkCount: number; jiwaCount: number }> = {};
  for (const g of GANG_LIST) {
    const kk = citizens.filter((c) => c.gang === g);
    gangCounts[g] = {
      kkCount: kk.length,
      jiwaCount: kk.reduce((acc, c) => acc + c.anggotaKeluarga.length, 0),
    };
  }

  return {
    totalKk: citizens.length,
    totalJiwa: citizens.reduce((acc, c) => acc + c.anggotaKeluarga.length, 0),
    totalLaki: citizens.reduce(
      (acc, c) => acc + c.anggotaKeluarga.filter((a) => a.jenisKelamin === 'L').length,
      0
    ),
    totalPerempuan: citizens.reduce(
      (acc, c) => acc + c.anggotaKeluarga.filter((a) => a.jenisKelamin === 'P').length,
      0
    ),
    totalKtpRt05: citizens.filter((c) => c.statusKtp.includes('Warga Tetap')).length,
    totalDomisili: citizens.filter((c) => c.statusKtp.includes('Domisili')).length,
    gangCounts,
  };
}

export async function saveCitizenStatsSummary(citizens: DataKeluarga[]): Promise<void> {
  const summary = computeCitizenStatsSummary(citizens);
  const path = 'citizenStats/summary';
  try {
    await setDoc(doc(db, 'citizenStats', 'summary'), {
      ...summary,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadCitizenStatsSummary(): Promise<CitizenStatsSummary | null> {
  const path = 'citizenStats/summary';
  try {
    const snap = await getDoc(doc(db, 'citizenStats', 'summary'));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      totalKk: Number(d.totalKk || 0),
      totalJiwa: Number(d.totalJiwa || 0),
      totalLaki: Number(d.totalLaki || 0),
      totalPerempuan: Number(d.totalPerempuan || 0),
      totalKtpRt05: Number(d.totalKtpRt05 || 0),
      totalDomisili: Number(d.totalDomisili || 0),
      gangCounts: (d.gangCounts as Record<string, { kkCount: number; jiwaCount: number }>) || {},
    };
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveLetterToFirestore(
  letter: PermohonanSurat,
  user: User,
  isAdmin: boolean
): Promise<void> {
  if (!user.emailVerified) {
    throw new Error('Akun Google belum terverifikasi.');
  }

  const letterId = sanitizeDocId(letter.id);
  const ownerUid = sanitizeDocId(user.uid);
  const path = `letters/${letterId}`;
  const docRef = doc(db, 'letters', letterId);

  const payload: Record<string, unknown> = {
    id: letterId,
    ownerUid,
    keluargaId: clampString(letter.keluargaId, 128, 'umum'),
    namaPemohon: clampString(letter.namaPemohon, 120, 'Warga'),
    gang: normalizeGang(letter.gang),
    nomorRumah: clampString(letter.nomorRumah, 64, '-'),
    keperluan: clampString(letter.keperluan, 300, 'Administrasi'),
    jenisSurat: letter.jenisSurat || 'Lainnya',
    tanggalPengajuan: clampString(letter.tanggalPengajuan, 32, new Date().toISOString().slice(0, 10)),
    status: isAdmin ? letter.status || 'Menunggu Verifikasi' : 'Menunggu Verifikasi',
  };

  if (letter.nomorSurat && letter.nomorSurat.trim()) {
    payload.nomorSurat = clampString(letter.nomorSurat, 80);
  }
  if (letter.nikPemohon && letter.nikPemohon.trim()) {
    payload.nikPemohon = clampString(letter.nikPemohon, 32);
  }
  if (letter.nomorHpPemohon && letter.nomorHpPemohon.trim()) {
    payload.nomorHpPemohon = clampString(letter.nomorHpPemohon, 32);
  }
  if (letter.whatsappNotifiedAt && letter.whatsappNotifiedAt.trim()) {
    payload.whatsappNotifiedAt = clampString(letter.whatsappNotifiedAt, 64);
  }
  if (letter.whatsappNotificationStatus && letter.whatsappNotificationStatus.trim()) {
    payload.whatsappNotificationStatus = clampString(letter.whatsappNotificationStatus, 80);
  }
  if (letter.keteranganTambahan && letter.keteranganTambahan.trim()) {
    payload.keteranganTambahan = clampString(letter.keteranganTambahan, 500);
  }

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (isAdmin) {
      await updateDoc(docRef, {
        status: payload.status,
        ...(payload.nomorSurat ? { nomorSurat: payload.nomorSurat } : {}),
        ...(payload.whatsappNotifiedAt ? { whatsappNotifiedAt: payload.whatsappNotifiedAt } : {}),
        ...(payload.whatsappNotificationStatus
          ? { whatsappNotificationStatus: payload.whatsappNotificationStatus }
          : {}),
        ...(payload.keteranganTambahan ? { keteranganTambahan: payload.keteranganTambahan } : {}),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadLettersFromFirestore(
  user: User,
  isAdmin: boolean
): Promise<PermohonanSurat[]> {
  if (!user.emailVerified) return [];
  const path = 'letters';
  try {
    const q = isAdmin
      ? collection(db, 'letters')
      : query(collection(db, 'letters'), where('ownerUid', '==', sanitizeDocId(user.uid)));

    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const r = d.data();
      return {
        id: sanitizeDocId(String(r.id || d.id)),
        nomorSurat: typeof r.nomorSurat === 'string' ? r.nomorSurat : undefined,
        keluargaId: String(r.keluargaId || ''),
        namaPemohon: String(r.namaPemohon || ''),
        nikPemohon: typeof r.nikPemohon === 'string' ? r.nikPemohon : undefined,
        nomorHpPemohon: typeof r.nomorHpPemohon === 'string' ? r.nomorHpPemohon : undefined,
        whatsappNotifiedAt:
          typeof r.whatsappNotifiedAt === 'string' ? r.whatsappNotifiedAt : undefined,
        whatsappNotificationStatus:
          typeof r.whatsappNotificationStatus === 'string'
            ? r.whatsappNotificationStatus
            : undefined,
        gang: normalizeGang(r.gang),
        nomorRumah: String(r.nomorRumah || ''),
        keperluan: String(r.keperluan || ''),
        jenisSurat: r.jenisSurat || 'Lainnya',
        tanggalPengajuan: String(r.tanggalPengajuan || ''),
        status: r.status || 'Menunggu Verifikasi',
        keteranganTambahan:
          typeof r.keteranganTambahan === 'string' ? r.keteranganTambahan : undefined,
      } as PermohonanSurat;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function loadPortalSettingsFromFirestore(): Promise<{
  showUpdateCitizenBox: boolean;
} | null> {
  const path = 'portalConfig/settings';
  try {
    const snap = await getDoc(doc(db, 'portalConfig', 'settings'));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      showUpdateCitizenBox:
        typeof d.showUpdateCitizenBox === 'boolean' ? d.showUpdateCitizenBox : true,
    };
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function savePortalSettingsToFirestore(showUpdateCitizenBox: boolean): Promise<void> {
  const path = 'portalConfig/settings';
  try {
    await setDoc(doc(db, 'portalConfig', 'settings'), {
      showUpdateCitizenBox: Boolean(showUpdateCitizenBox),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadProgramsFromFirestore(): Promise<ProgramKerjaItem[] | null> {
  const path = 'programs';
  try {
    const snap = await getDocs(collection(db, 'programs'));
    if (snap.empty) return null;

    const byId = new Map<string, Record<string, unknown>>();
    for (const d of snap.docs) {
      byId.set(d.id, d.data());
    }

    const hydrated = await Promise.all(
      INITIAL_PROGRAM_KERJA.map(async (base) => {
        const remote = byId.get(base.id);
        const fbSnap = await getDocs(collection(db, 'programs', base.id, 'feedback')).catch(
          () => null
        );
        const masukanWarga = fbSnap
          ? fbSnap.docs.map((fd) => {
              const r = fd.data();
              return {
                id: String(r.id || fd.id),
                namaWarga: String(r.namaWarga || 'Warga'),
                gang: String(r.gang || 'Gg Utama'),
                pesan: String(r.pesan || ''),
                tanggal: String(r.tanggal || ''),
              };
            })
          : base.masukanWarga;

        return {
          ...base,
          jumlahDukungan:
            remote && typeof remote.jumlahDukungan === 'number'
              ? remote.jumlahDukungan
              : base.jumlahDukungan,
          masukanWarga,
        };
      })
    );

    return hydrated;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function seedProgramsIfAdmin(programs: ProgramKerjaItem[]): Promise<void> {
  try {
    const existing = await getDocs(collection(db, 'programs'));
    if (!existing.empty) return;

    await Promise.all(
      programs.map((p) =>
        setDoc(doc(db, 'programs', sanitizeDocId(p.id)), {
          id: sanitizeDocId(p.id),
          judul: clampString(p.judul, 160),
          deskripsi: clampString(p.ringkasan, 1000),
          kategori: clampString(p.kategori, 80),
          ikon: clampString(p.kategori, 40),
          prioritas: `Prioritas ${p.nomorUrut}`,
          jumlahDukungan: Math.max(0, Math.trunc(p.jumlahDukungan || 0)),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      )
    );
  } catch {
    // non-fatal if already seeded or non-admin
  }
}

export async function upvoteProgramInFirestore(programId: string): Promise<void> {
  const safeId = sanitizeDocId(programId);
  const path = `programs/${safeId}`;
  const docRef = doc(db, 'programs', safeId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const currentVotes = Number(snap.data().jumlahDukungan || 0);
    await updateDoc(docRef, {
      jumlahDukungan: currentVotes + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addProgramFeedbackInFirestore(
  programId: string,
  feedback: { id: string; namaWarga: string; gang: string; pesan: string; tanggal: string },
  authorUid: string
): Promise<void> {
  const safeProgId = sanitizeDocId(programId);
  const safeFbId = sanitizeDocId(feedback.id);
  const path = `programs/${safeProgId}/feedback/${safeFbId}`;
  try {
    const progSnap = await getDoc(doc(db, 'programs', safeProgId));
    if (!progSnap.exists()) return;

    await setDoc(doc(db, 'programs', safeProgId, 'feedback', safeFbId), {
      id: safeFbId,
      programId: safeProgId,
      authorUid: sanitizeDocId(authorUid),
      namaWarga: clampString(feedback.namaWarga, 100, 'Warga'),
      gang: clampString(feedback.gang, 40, 'Gg Utama'),
      pesan: clampString(feedback.pesan, 800, '-'),
      tanggal: clampString(feedback.tanggal, 32, ''),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
