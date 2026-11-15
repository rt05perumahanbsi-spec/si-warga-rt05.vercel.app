import React from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  DataKeluarga,
  PermohonanSurat,
} from './data/citizenData';
import { GANG_LIST } from './data/gangList';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CitizenListSection } from './components/CitizenListSection';
import { CitizenFormModal } from './components/CitizenFormModal';
import { CitizenDetailModal } from './components/CitizenDetailModal';
import { StrukturOrganisasiSection } from './components/StrukturOrganisasiSection';
import { ProgramKerjaSection } from './components/ProgramKerjaSection';
import { DemographicsSection } from './components/DemographicsSection';
import { ServiceRequestSection } from './components/ServiceRequestSection';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { SecurityPinModal } from './components/SecurityPinModal';
import { WelcomeModal } from './components/WelcomeModal';
import { Footer } from './components/Footer';
import { ProgramKerjaItem, INITIAL_PROGRAM_KERJA } from './data/programKerja';
import {
  auth,
  signInWithGoogleAndDrive,
  signOutGoogle,
  subscribeDriveAccessToken,
} from './firebase';
import {
  addProgramFeedbackInFirestore,
  checkUserIsAdmin,
  deleteCitizenFromFirestore,
  loadCitizensFromFirestore,
  loadCitizenStatsSummary,
  loadLettersFromFirestore,
  loadPortalSettingsFromFirestore,
  loadProgramsFromFirestore,
  saveCitizenStatsSummary,
  saveCitizenToFirestore,
  saveLetterToFirestore,
  savePortalSettingsToFirestore,
  seedProgramsIfAdmin,
  upvoteProgramInFirestore,
  type CitizenStatsSummary,
} from './utils/firestoreSync';
import {
  deleteSingleCitizenFromIdb,
  getDeletedCitizenIdsFromIdb,
  loadCitizensIdbBackup,
  saveCitizensIdbBackup,
  saveLightweightLocalCache,
  saveSingleCitizenToIdb,
} from './utils/storageHelper';
import {
  downloadAllCitizensPdfWithAttachments,
  downloadCitizensExcelWorkbook,
  parseCitizensFromExcelFile,
} from './utils/citizenExport';
import {
  UserPlus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const PENGURUS_PASSWORD = 'rt05jaya';

export default function App() {
  // 1. Citizen data state: INITIALIZED EMPTY as requested ("kosongkan semua contoh data warga karena akan di input data baru")
  const [citizens, setCitizens] = React.useState<DataKeluarga[]>(() => {
    try {
      const saved = localStorage.getItem('si_warga_rt05_official_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return []; // Empty by default for new real citizen inputs
  });

  // Letter service requests state: starts empty
  const [letterRequests, setLetterRequests] = React.useState<PermohonanSurat[]>(() => {
    try {
      const saved = localStorage.getItem('si_warga_rt05_letters_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // 4 Program Kerja Prioritas RT 05 Blok E State (Semua saran & dukungan dikosongkan untuk input baru warga)
  const [programs, setPrograms] = React.useState<ProgramKerjaItem[]>(() => {
    try {
      const saved = localStorage.getItem('si_warga_rt05_programs_v3_clean');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_PROGRAM_KERJA;
  });

  // 3. Security Password State for protecting citizen data (Password: rt05jaya)
  const [isPengurusUnlocked, setIsPengurusUnlocked] = React.useState<boolean>(() => {
    try {
      return sessionStorage.getItem('si_warga_rt05_auth_unlocked') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isSecurityModalOpen, setIsSecurityModalOpen] = React.useState(false);

  // Portal Setting: Show / Hide "Kotak Mutakhirkan Data KK"
  const [showUpdateCitizenBox, setShowUpdateCitizenBox] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('si_warga_rt05_show_update_box');
      return saved === null ? true : saved !== 'false';
    } catch {
      return true;
    }
  });
  const [updatingLetterId, setUpdatingLetterId] = React.useState<string | null>(null);
  const [waFallbackByLetter, setWaFallbackByLetter] = React.useState<Record<string, string>>({});

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [citizenToEdit, setCitizenToEdit] = React.useState<DataKeluarga | null>(null);
  const [selectedDetailCitizen, setSelectedDetailCitizen] = React.useState<DataKeluarga | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = React.useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = React.useState(true);
  const [citizenToDelete, setCitizenToDelete] = React.useState<{ id: string; name: string } | null>(null);

  // Active navigation section
  const [activeSection, setActiveSection] = React.useState('daftar-warga');

  // Firebase Cloud Auth & Google Drive in-memory access token state
  const [cloudUser, setCloudUser] = React.useState<User | null>(null);
  const [driveAccessToken, setDriveAccessToken] = React.useState<string | null>(null);
  const [isCloudAdmin, setIsCloudAdmin] = React.useState(false);
  const [isAuthLoading, setIsAuthLoading] = React.useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = React.useState(false);
  const [publicStats, setPublicStats] = React.useState<CitizenStatsSummary | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  React.useEffect(() => {
    return subscribeDriveAccessToken(setDriveAccessToken);
  }, []);

  // Track whether initial server + IndexedDB hydration finished
  const hasHydratedRef = React.useRef(false);
  const citizensRef = React.useRef<DataKeluarga[]>(citizens);
  React.useEffect(() => {
    citizensRef.current = citizens;
  }, [citizens]);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      const { user, accessToken } = await signInWithGoogleAndDrive();
      if (user?.email) {
        showToast(
          accessToken
            ? `Terhubung ke Cloud Firebase & Google Drive 15 GB (${user.email})!`
            : `Berhasil terhubung ke Cloud Firebase (${user.email})!`
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('popup-closed-by-user')) {
        showToast('Login Google dibatalkan.');
      } else {
        showToast('Gagal terhubung ke Google Cloud & Drive. Silakan coba lagi.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogle().catch(() => undefined);
    setCloudUser(null);
    setDriveAccessToken(null);
    setIsCloudAdmin(false);
    showToast('Akun Google Cloud & Google Drive telah dikeluarkan.');
  };

  // Initial load from IndexedDB/localStorage + public Cloud Firestore stats & programs (static SPA)
  React.useEffect(() => {
    let cancelled = false;

    const hydrateLocalAndPublicCloud = async () => {
      try {
        const [idbCitizens, deletedIds] = await Promise.all([
          loadCitizensIdbBackup(),
          getDeletedCitizenIdsFromIdb(),
        ]);

        if (cancelled) return;

        const deletedSet = new Set(deletedIds);

        // Read lightweight/legacy localStorage candidates
        let lsCandidates: DataKeluarga[] = [];
        try {
          const rawLs = localStorage.getItem('si_warga_rt05_official_v2');
          if (rawLs) {
            const parsed = JSON.parse(rawLs);
            if (Array.isArray(parsed)) lsCandidates = parsed;
          }
        } catch {
          // ignore
        }

        // Combine IndexedDB (has full photos) + localStorage (fallback metadata)
        const localById = new Map<string, DataKeluarga>();
        for (const c of lsCandidates) {
          if (c && typeof c.id === 'string' && !deletedSet.has(c.id)) {
            localById.set(c.id, c);
          }
        }
        for (const c of idbCitizens) {
          if (c && typeof c.id === 'string' && !deletedSet.has(c.id)) {
            localById.set(c.id, c);
          }
        }
        const localMerged = Array.from(localById.values());

        if (localMerged.length > 0) {
          setCitizens(localMerged);
          await saveCitizensIdbBackup(localMerged);
          saveLightweightLocalCache(localMerged);
        }

        // Load public work programs, portal settings & non-PII aggregate stats from Firestore (static SPA)
        const [firestorePrograms, stats, firestoreSettings] = await Promise.all([
          loadProgramsFromFirestore().catch(() => null),
          loadCitizenStatsSummary().catch(() => null),
          loadPortalSettingsFromFirestore().catch(() => null),
        ]);

        if (!cancelled) {
          if (firestorePrograms && firestorePrograms.length > 0) {
            setPrograms(firestorePrograms);
          }
          if (stats) {
            setPublicStats(stats);
          }
          if (typeof firestoreSettings?.showUpdateCitizenBox === 'boolean') {
            setShowUpdateCitizenBox(firestoreSettings.showUpdateCitizenBox);
            try {
              localStorage.setItem(
                'si_warga_rt05_show_update_box',
                String(firestoreSettings.showUpdateCitizenBox)
              );
            } catch {
              // ignore
            }
          }
        }
      } finally {
        if (!cancelled) {
          hasHydratedRef.current = true;
        }
      }
    };

    hydrateLocalAndPublicCloud();
    return () => {
      cancelled = true;
    };
  }, []);

  // Firebase Auth listener + Cloud Firestore bi-directional sync
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCloudUser(fbUser);
      if (!fbUser || !fbUser.emailVerified) {
        setIsCloudAdmin(false);
        return;
      }

      setIsSyncingCloud(true);
      try {
        const adminStatus = await checkUserIsAdmin(fbUser).catch(() => false);
        setIsCloudAdmin(adminStatus);

        if (adminStatus) {
          setIsPengurusUnlocked(true);
          try {
            sessionStorage.setItem('si_warga_rt05_auth_unlocked', 'true');
          } catch {
            // ignore
          }
          await seedProgramsIfAdmin(INITIAL_PROGRAM_KERJA);
          const refreshedPrograms = await loadProgramsFromFirestore().catch(() => null);
          if (refreshedPrograms && refreshedPrograms.length > 0) {
            setPrograms(refreshedPrograms);
          }
        }

        const [cloudCitizens, cloudLetters] = await Promise.all([
          loadCitizensFromFirestore(fbUser, adminStatus).catch(() => []),
          loadLettersFromFirestore(fbUser, adminStatus).catch(() => []),
        ]);

        // Merge local + cloud citizens without dropping local records or photos
        const currentLocal = citizensRef.current;
        const mergedMap = new Map<string, DataKeluarga>();
        for (const lc of currentLocal) {
          mergedMap.set(lc.id, lc);
        }
        for (const cc of cloudCitizens) {
          const prev = mergedMap.get(cc.id);
          mergedMap.set(cc.id, {
            ...cc,
            fotoKtp: cc.fotoKtp || prev?.fotoKtp,
            fotoKk: cc.fotoKk || prev?.fotoKk,
          });
        }

        const mergedList = Array.from(mergedMap.values());
        setCitizens(mergedList);
        await saveCitizensIdbBackup(mergedList);
        saveLightweightLocalCache(mergedList);

        // Push any local-only records up to Firestore
        const cloudIds = new Set(cloudCitizens.map((c) => c.id));
        const missingOnCloud = currentLocal.filter((c) => !cloudIds.has(c.id));
        for (const item of missingOnCloud) {
          await saveCitizenToFirestore(item, fbUser, adminStatus).catch(() => undefined);
        }

        if (adminStatus) {
          await saveCitizenStatsSummary(mergedList).catch(() => undefined);
          const refreshedStats = await loadCitizenStatsSummary().catch(() => null);
          if (refreshedStats) setPublicStats(refreshedStats);
        }

        // Merge letter requests
        if (cloudLetters.length > 0) {
          setLetterRequests((prev) => {
            const byId = new Map<string, PermohonanSurat>();
            for (const l of prev) byId.set(l.id, l);
            for (const cl of cloudLetters) byId.set(cl.id, cl);
            return Array.from(byId.values());
          });
        }
      } finally {
        setIsSyncingCloud(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist citizens to IndexedDB + lightweight localStorage ONLY after hydration completes
  React.useEffect(() => {
    if (!hasHydratedRef.current) return;
    saveCitizensIdbBackup(citizens).catch(() => undefined);
    saveLightweightLocalCache(citizens);
  }, [citizens]);

  // Persist letters
  React.useEffect(() => {
    try {
      localStorage.setItem('si_warga_rt05_letters_v2', JSON.stringify(letterRequests));
    } catch {
      // ignore
    }
  }, [letterRequests]);

  // Persist programs
  React.useEffect(() => {
    try {
      localStorage.setItem('si_warga_rt05_programs_v3_clean', JSON.stringify(programs));
    } catch {
      // ignore
    }
  }, [programs]);

  // Program Kerja actions: Upvote & Feedback
  const handleUpvoteProgram = (programId: string) => {
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === programId ? { ...p, jumlahDukungan: p.jumlahDukungan + 1 } : p
      )
    );
    if (cloudUser && cloudUser.emailVerified) {
      upvoteProgramInFirestore(programId).catch(() => undefined);
    }
    showToast('Terima kasih! Dukungan Anda untuk program kerja telah ditambahkan.');
  };

  const handleAddProgramFeedback = (
    programId: string,
    feedback: { namaWarga: string; gang: string; pesan: string }
  ) => {
    const newFeedback = {
      id: `fb-${Date.now()}`,
      namaWarga: feedback.namaWarga,
      gang: feedback.gang,
      pesan: feedback.pesan,
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    setPrograms((prev) =>
      prev.map((p) =>
        p.id === programId
          ? { ...p, masukanWarga: [newFeedback, ...p.masukanWarga] }
          : p
      )
    );
    if (cloudUser && cloudUser.emailVerified) {
      addProgramFeedbackInFirestore(programId, newFeedback, cloudUser.uid).catch(() => undefined);
    }
    showToast('Saran & masukan Anda berhasil dikirim ke Pengurus RT 05!');
  };

  // Handle password unlock
  const handleUnlockPengurus = (enteredPassword: string): boolean => {
    if (enteredPassword === PENGURUS_PASSWORD) {
      setIsPengurusUnlocked(true);
      try {
        sessionStorage.setItem('si_warga_rt05_auth_unlocked', 'true');
      } catch (e) {
        // ignore
      }
      showToast('Akses Pengurus RT 05 Berhasil Dibuka!');
      return true;
    }
    return false;
  };

  // Handle password lock
  const handleLockPengurus = () => {
    setIsPengurusUnlocked(false);
    try {
      sessionStorage.removeItem('si_warga_rt05_auth_unlocked');
    } catch (e) {
      // ignore
    }
    showToast('Direktori data warga telah dikunci kembali.');
  };

  // Save (Create or Update) Citizen Household -> synced to IndexedDB + localStorage + Firebase Firestore
  const handleSaveCitizen = async (savedData: DataKeluarga) => {
    const isUpdating = Boolean(citizenToEdit);

    // 1. Immediately save full record (including compressed KTP/KK photos) to IndexedDB
    await saveSingleCitizenToIdb(savedData);

    // 2. Optimistically update React state + lightweight localStorage cache
    let nextSnapshot: DataKeluarga[] = [];
    setCitizens((prev) => {
      const next = isUpdating
        ? prev.map((c) => (c.id === savedData.id ? savedData : c))
        : [savedData, ...prev.filter((c) => c.id !== savedData.id)];
      nextSnapshot = next;
      saveLightweightLocalCache(next);
      return next;
    });

    // 3. Persist to Firebase Firestore when signed in with verified Google account
    let savedToCloud = false;
    if (cloudUser && cloudUser.emailVerified) {
      try {
        await saveCitizenToFirestore(savedData, cloudUser, isCloudAdmin);
        savedToCloud = true;
        if (isCloudAdmin) {
          await saveCitizenStatsSummary(nextSnapshot).catch(() => undefined);
        }
      } catch {
        // Non-fatal: still persisted to IndexedDB
      }
    }

    const storageLabel = savedToCloud ? ' & Cloud Firebase' : '';
    if (isUpdating) {
      showToast(`Data KK "${savedData.namaKepalaKeluarga}" (${savedData.gang}) berhasil diperbarui${storageLabel}!`);
    } else {
      showToast(`Data KK baru "${savedData.namaKepalaKeluarga}" (${savedData.gang} ${savedData.nomorRumah}) berhasil disimpan permanen${storageLabel}!`);
    }
    setCitizenToEdit(null);
  };

  // Open Edit modal
  const handleOpenEdit = (citizen: DataKeluarga) => {
    setCitizenToEdit(citizen);
    setIsFormModalOpen(true);
  };

  // Open Create modal
  const handleOpenCreate = () => {
    setCitizenToEdit(null);
    setIsFormModalOpen(true);
  };

  // Confirm delete
  const confirmDeleteCitizen = async () => {
    if (!citizenToDelete) return;
    const targetId = citizenToDelete.id;
    const targetName = citizenToDelete.name;
    setCitizenToDelete(null);

    await deleteSingleCitizenFromIdb(targetId);
    let nextAfterDelete: DataKeluarga[] = [];
    setCitizens((prev) => {
      const next = prev.filter((c) => c.id !== targetId);
      nextAfterDelete = next;
      saveLightweightLocalCache(next);
      return next;
    });

    if (cloudUser && cloudUser.emailVerified) {
      await deleteCitizenFromFirestore(targetId).catch(() => undefined);
      if (isCloudAdmin) {
        await saveCitizenStatsSummary(nextAfterDelete).catch(() => undefined);
      }
    }

    showToast(`Data keluarga "${targetName}" telah dihapus.`);
  };

  // Handle toggle for showing/hiding "Kotak Mutakhirkan Data KK"
  const handleToggleUpdateCitizenBox = async () => {
    const nextValue = !showUpdateCitizenBox;
    setShowUpdateCitizenBox(nextValue);
    try {
      localStorage.setItem('si_warga_rt05_show_update_box', String(nextValue));
    } catch {
      // ignore
    }

    if (cloudUser && cloudUser.emailVerified && isCloudAdmin) {
      await savePortalSettingsToFirestore(nextValue).catch(() => undefined);
    }

    showToast(
      nextValue
        ? 'Kotak "Mutakhirkan Data KK" dimunculkan kembali untuk warga.'
        : 'Kotak "Mutakhirkan Data KK" telah ditutup oleh Pengurus.'
    );
  };

  // Handle letter request submission
  const handleSaveLetterRequest = (newRequest: PermohonanSurat) => {
    setLetterRequests((prev) => [newRequest, ...prev]);
    if (cloudUser && cloudUser.emailVerified) {
      saveLetterToFirestore(newRequest, cloudUser, isCloudAdmin).catch(() => undefined);
    }
    showToast(`Permohonan ${newRequest.jenisSurat} atas nama ${newRequest.namaPemohon} berhasil diajukan!`);
  };

  // Handle letter status update + prepare WhatsApp notification when status becomes "Selesai"
  const handleUpdateLetterStatus = async (
    letterId: string,
    newStatus: PermohonanSurat['status']
  ) => {
    const existing = letterRequests.find((l) => l.id === letterId);
    if (!existing) return;

    if (newStatus !== 'Selesai') {
      const updatedLetter: PermohonanSurat = {
        ...existing,
        status: newStatus,
      };
      setLetterRequests((prev) => prev.map((l) => (l.id === letterId ? updatedLetter : l)));
      if (cloudUser && cloudUser.emailVerified) {
        saveLetterToFirestore(updatedLetter, cloudUser, isCloudAdmin).catch(() => undefined);
      }
      showToast(`Status surat ${existing.namaPemohon} diperbarui menjadi "${newStatus}".`);
      return;
    }

    const matchedCitizen = citizens.find((c) => c.id === existing.keluargaId);
    const phone = existing.nomorHpPemohon || matchedCitizen?.nomorHp || '';
    const digits = phone.replace(/[^0-9]/g, '');
    const normalizedPhone = digits.startsWith('0')
      ? `62${digits.slice(1)}`
      : digits.startsWith('8')
      ? `62${digits}`
      : digits;

    const hasValidPhone = normalizedPhone.length >= 9;
    if (hasValidPhone) {
      const msg = [
        `Assalamu'alaikum / Salam Sejahtera *${existing.namaPemohon}*,`,
        ``,
        `Permohonan *${existing.jenisSurat}* Anda (No. Surat: ${existing.nomorSurat || '-'} · ${existing.gang} ${existing.nomorRumah}) telah berstatus *SELESAI* diproses oleh Pengurus RT 05 Blok E / RW 12 Perumahan Bumi Setia Insani.`,
        ``,
        `Silakan ambil atau unduh surat resmi Anda melalui Pengurus RT 05 Blok E. Terima kasih.`,
      ].join('\n');
      const waLink = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(msg)}`;
      setWaFallbackByLetter((prev) => ({ ...prev, [letterId]: waLink }));
    }

    const finalizedLetter: PermohonanSurat = {
      ...existing,
      status: 'Selesai',
      whatsappNotificationStatus: hasValidPhone
        ? `Siap kirim WA (${normalizedPhone})`
        : 'No. HP pemohon kosong',
    };

    setLetterRequests((prev) => prev.map((l) => (l.id === letterId ? finalizedLetter : l)));
    if (cloudUser && cloudUser.emailVerified) {
      saveLetterToFirestore(finalizedLetter, cloudUser, isCloudAdmin).catch(() => undefined);
    }

    if (hasValidPhone) {
      showToast(
        `Status surat ${existing.namaPemohon} Selesai! Klik tombol "Kirim WA" untuk mengirim pesan WhatsApp ke warga.`
      );
    } else {
      showToast(
        `Status surat ${existing.namaPemohon} Selesai, namun nomor HP pemohon belum diisi.`
      );
    }
  };

  const handleMarkWhatsappSent = (letterId: string, phone: string) => {
    const existing = letterRequests.find((l) => l.id === letterId);
    if (!existing) return;
    const digits = phone.replace(/[^0-9]/g, '');
    const normalizedPhone = digits.startsWith('0')
      ? `62${digits.slice(1)}`
      : digits.startsWith('8')
      ? `62${digits}`
      : digits;
    const updated: PermohonanSurat = {
      ...existing,
      whatsappNotifiedAt: new Date().toISOString(),
      whatsappNotificationStatus: `Notif WA dikirim (${normalizedPhone || phone})`,
    };
    setLetterRequests((prev) => prev.map((l) => (l.id === letterId ? updated : l)));
    if (cloudUser && cloudUser.emailVerified) {
      saveLetterToFirestore(updated, cloudUser, isCloudAdmin).catch(() => undefined);
    }
  };

  // Export to real Excel (.xlsx) workbook
  const handleExportCsv = () => {
    downloadCitizensExcelWorkbook(citizens);
    showToast(
      `Berhasil mengunduh file Excel (.xlsx) data warga RT 05 Blok E (${citizens.length} KK)!`
    );
  };

  // Export PDF A4 complete with KTP & KK attachments
  const handleExportAllPdf = async () => {
    if (citizens.length === 0) {
      showToast('Belum ada data warga untuk diunduh ke PDF.');
      return;
    }
    showToast('Menyiapkan dokumen PDF + lampiran KTP & KK...');
    await downloadAllCitizensPdfWithAttachments(citizens);
    showToast(`Berhasil mengunduh PDF lengkap beserta lampiran KTP & KK (${citizens.length} KK)!`);
  };

  // Export JSON backup
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(citizens, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute(
      'download',
      `cadangan_data_warga_rt05_blok_e_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    showToast('Cadangan data warga berhasil diunduh (JSON)!');
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setCitizens(parsed);
            await saveCitizensIdbBackup(parsed);
            saveLightweightLocalCache(parsed);
            if (cloudUser && cloudUser.emailVerified) {
              for (const item of parsed) {
                await saveCitizenToFirestore(item, cloudUser, isCloudAdmin).catch(() => undefined);
              }
              if (isCloudAdmin) {
                await saveCitizenStatsSummary(parsed).catch(() => undefined);
              }
            }
            showToast(`Berhasil memulihkan ${parsed.length} data keluarga (KK)!`);
          } else {
            showToast('Format berkas cadangan JSON tidak sesuai.');
          }
        } catch {
          showToast('Gagal memproses berkas JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Restore citizens snapshot downloaded from Google Drive
  const handleRestoreFromDrive = async (restored: DataKeluarga[]) => {
    setCitizens(restored);
    await saveCitizensIdbBackup(restored);
    saveLightweightLocalCache(restored);
    if (cloudUser && cloudUser.emailVerified) {
      for (const item of restored) {
        await saveCitizenToFirestore(item, cloudUser, isCloudAdmin).catch(() => undefined);
      }
      if (isCloudAdmin) {
        await saveCitizenStatsSummary(restored).catch(() => undefined);
      }
    }
  };

  // Import bulk households from Excel (.xlsx / .xls / .csv)
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const imported = await parseCitizensFromExcelFile(file);
      if (imported.length === 0) {
        showToast('Tidak ada baris data KK yang ditemukan di file Excel tersebut.');
        return;
      }

      let mergedSnapshot: DataKeluarga[] = [];
      setCitizens((prev) => {
        const merged = [...imported, ...prev];
        mergedSnapshot = merged;
        saveCitizensIdbBackup(merged).catch(() => undefined);
        saveLightweightLocalCache(merged);
        return merged;
      });
      if (cloudUser && cloudUser.emailVerified) {
        for (const item of imported) {
          await saveCitizenToFirestore(item, cloudUser, isCloudAdmin).catch(() => undefined);
        }
        if (isCloudAdmin) {
          await saveCitizenStatsSummary(mergedSnapshot).catch(() => undefined);
        }
      }
      showToast(`Berhasil mengimpor ${imported.length} data KK baru dari Excel!`);
    } catch {
      showToast('Gagal membaca file Excel. Pastikan format kolom sesuai template.');
    }
  };

  // Smooth scroll
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalJiwa = citizens.reduce((acc, c) => acc + c.anggotaKeluarga.length, 0);
  const displayKkCount =
    publicStats && publicStats.totalKk > citizens.length ? publicStats.totalKk : citizens.length;
  const displayJiwaCount =
    publicStats && publicStats.totalKk > citizens.length ? publicStats.totalJiwa : totalJiwa;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 pb-16 sm:pb-0">
      {/* Top Navbar */}
      <Navbar
        onOpenAddCitizen={handleOpenCreate}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        citizenCount={displayKkCount}
        totalJiwa={displayJiwaCount}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        onOpenLetterService={() => setIsLetterModalOpen(true)}
        isPengurusUnlocked={isPengurusUnlocked}
        onToggleLock={() => setIsSecurityModalOpen(true)}
        onExportCsv={handleExportCsv}
        showUpdateCitizenBox={showUpdateCitizenBox}
      />

      {/* Hero Banner */}
      <HeroSection
        onOpenAddCitizen={handleOpenCreate}
        onScrollToCitizens={() => handleNavigate('daftar-warga')}
        onOpenLetterService={() => setIsLetterModalOpen(true)}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        citizens={citizens}
        publicStats={publicStats}
        showUpdateCitizenBox={showUpdateCitizenBox}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* SECTION 1: DIRECTORY OF HOUSEHOLDS (PROTECTED BY PASSWORD rt05jaya) */}
        <CitizenListSection
          citizens={citizens}
          onOpenAddCitizen={handleOpenCreate}
          onOpenDetail={(c) => setSelectedDetailCitizen(c)}
          onOpenEdit={handleOpenEdit}
          onDeleteCitizen={(id, name) => setCitizenToDelete({ id, name })}
          onExportCsv={handleExportCsv}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onImportExcel={handleImportExcel}
          isPengurusUnlocked={isPengurusUnlocked}
          onUnlockPengurus={handleUnlockPengurus}
          onLockPengurus={handleLockPengurus}
          cloudUserEmail={cloudUser?.email || null}
          isCloudAdmin={isCloudAdmin}
          onGoogleSignIn={handleGoogleSignIn}
          isSyncingCloud={isSyncingCloud}
          driveAccessToken={driveAccessToken}
          onRestoreFromDrive={handleRestoreFromDrive}
          onNotify={showToast}
          showUpdateCitizenBox={showUpdateCitizenBox}
          onToggleUpdateCitizenBox={handleToggleUpdateCitizenBox}
        />

        {/* SECTION 2: 4 PROGRAM KERJA PRIORITAS RT 05 BLOK E */}
        <ProgramKerjaSection
          programs={programs}
          onUpvoteProgram={handleUpvoteProgram}
          onAddFeedback={handleAddProgramFeedback}
        />

        {/* SECTION 3: STRUKTUR ORGANISASI PENGURUS RT 05 BLOK E */}
        <StrukturOrganisasiSection />

        {/* SECTION 3: DEMOGRAPHICS & STATISTIK KEPENDUDUKAN */}
        <DemographicsSection citizens={citizens} publicStats={publicStats} />

        {/* SECTION 4: LAYANAN SURAT PENGANTAR RT */}
        <ServiceRequestSection
          requests={letterRequests}
          onOpenNewRequest={() => setIsLetterModalOpen(true)}
          isPengurusUnlocked={isPengurusUnlocked}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          citizens={citizens}
          onUpdateLetterStatus={handleUpdateLetterStatus}
          onWhatsappSent={handleMarkWhatsappSent}
          updatingLetterId={updatingLetterId}
          waFallbackByLetter={waFallbackByLetter}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Security PIN Modal (rt05jaya verification) */}
      <SecurityPinModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        isUnlocked={isPengurusUnlocked}
        onUnlock={handleUnlockPengurus}
        onLock={handleLockPengurus}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportAllPdf}
        citizenCount={citizens.length}
        onNavigateToCitizens={() => handleNavigate('daftar-warga')}
        cloudUserEmail={cloudUser?.email || null}
        isCloudAdmin={isCloudAdmin}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        isAuthLoading={isAuthLoading}
        showUpdateCitizenBox={showUpdateCitizenBox}
        onToggleUpdateCitizenBox={handleToggleUpdateCitizenBox}
      />

      {/* Citizen Form Modal (Add / Edit KK) */}
      <CitizenFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveCitizen}
        citizenToEdit={citizenToEdit}
        cloudUserEmail={cloudUser?.email || null}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Citizen Detail KK Modal */}
      <CitizenDetailModal
        citizen={selectedDetailCitizen}
        onClose={() => setSelectedDetailCitizen(null)}
        onEdit={handleOpenEdit}
      />

      {/* Service Request Modal (Surat Pengantar RT) */}
      <ServiceRequestModal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
        citizens={citizens}
        onSubmitRequest={handleSaveLetterRequest}
      />

      {/* Welcome / Census Guidance Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onOpenAddCitizen={handleOpenCreate}
        showUpdateCitizenBox={showUpdateCitizenBox}
      />

      {/* Delete Confirmation Modal */}
      {citizenToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1">
              Hapus Data Keluarga?
            </h3>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Yakin ingin menghapus data KK atas nama <strong>"{citizenToDelete.name}"</strong> dari sistem RT 05 Blok E?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCitizenToDelete(null)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer min-h-[44px]"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteCitizen}
                className="px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer min-h-[44px]"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Quick Floating Bar */}
      <div className="sm:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center justify-center gap-2 pointer-events-none">
        {showUpdateCitizenBox && (
          <button
            onClick={handleOpenCreate}
            className="pointer-events-auto flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs rounded-2xl shadow-xl border border-amber-300 active:scale-95 cursor-pointer min-h-[48px]"
            aria-label="Mutakhirkan Data KK"
          >
            <UserPlus className="w-4 h-4 text-stone-950 shrink-0" />
            <span>+ Mutakhirkan Data KK</span>
          </button>
        )}

        <button
          onClick={() => {
            if (isPengurusUnlocked) {
              handleNavigate('daftar-warga');
            } else {
              setIsSecurityModalOpen(true);
            }
          }}
          className="pointer-events-auto flex items-center justify-center gap-1.5 px-3.5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl shadow-xl border border-stone-800 active:scale-95 cursor-pointer min-h-[48px]"
          aria-label="Akses Pengurus RT"
        >
          {isPengurusUnlocked ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Data KK</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Akses RT</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl border border-stone-700 flex items-center gap-2.5 text-xs sm:text-sm animate-bounce max-w-[90vw] sm:max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
