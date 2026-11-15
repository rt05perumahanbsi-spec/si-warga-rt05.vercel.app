import React from 'react';
import {
  X,
  UserPlus,
  Users,
  Home,
  Phone,
  Car,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Upload,
  FileText,
  Image as ImageIcon,
  Camera,
  Eye,
  Cloud,
} from 'lucide-react';
import { GANG_LIST, GangName } from '../data/gangList';
import { compressImageFile } from '../utils/storageHelper';
import { CameraCaptureModal } from './CameraCaptureModal';
import {
  DataKeluarga,
  AnggotaKeluarga,
  HubunganKeluarga,
  JenisKelamin,
  StatusHunian,
  StatusKtp,
  GolonganDarah,
  StatusBpjs,
  Agama,
} from '../data/citizenData';

interface CitizenFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (citizen: DataKeluarga) => Promise<void> | void;
  citizenToEdit?: DataKeluarga | null;
  cloudUserEmail?: string | null;
  onGoogleSignIn?: () => Promise<void> | void;
}

export const CitizenFormModal: React.FC<CitizenFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  citizenToEdit,
  cloudUserEmail,
  onGoogleSignIn,
}) => {
  const isEditing = Boolean(citizenToEdit);

  // Household fields
  const [gang, setGang] = React.useState<GangName>('Gg Utama');
  const [nomorRumah, setNomorRumah] = React.useState('');
  const [statusHunian, setStatusHunian] = React.useState<StatusHunian>('Milik Sendiri');
  const [statusKtp, setStatusKtp] = React.useState<StatusKtp>('KTP RT 05 (Warga Tetap)');
  const [tahunTinggal, setTahunTinggal] = React.useState(new Date().getFullYear().toString());
  const [nomorKk, setNomorKk] = React.useState('');
  const [namaKepalaKeluarga, setNamaKepalaKeluarga] = React.useState('');
  const [nomorHp, setNomorHp] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [jumlahMotor, setJumlahMotor] = React.useState(1);
  const [jumlahMobil, setJumlahMobil] = React.useState(0);
  const [catatanKhusus, setCatatanKhusus] = React.useState('');

  // Document Uploads (KTP & KK)
  const [fotoKtp, setFotoKtp] = React.useState<string>('');
  const [fotoKk, setFotoKk] = React.useState<string>('');

  // Family members list
  const [anggotaList, setAnggotaList] = React.useState<AnggotaKeluarga[]>([
    {
      id: 'ak-1',
      namaLengkap: '',
      nik: '',
      hubunganKeluarga: 'Kepala Keluarga',
      jenisKelamin: 'L',
      usia: 35,
      agama: 'Islam',
      pendidikanTerakhir: 'SMA',
      pekerjaan: '',
      golonganDarah: 'Belum Tahu',
      statusBpjs: 'Aktif',
      statusPernikahan: 'Menikah',
    },
  ]);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [savedNotice, setSavedNotice] = React.useState<string | null>(null);
  const [isCompressingDoc, setIsCompressingDoc] = React.useState<'ktp' | 'kk' | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeCameraDoc, setActiveCameraDoc] = React.useState<'ktp' | 'kk' | null>(null);

  const resetNewForm = () => {
    setGang('Gg Utama');
    setNomorRumah('');
    setStatusHunian('Milik Sendiri');
    setStatusKtp('KTP RT 05 (Warga Tetap)');
    setTahunTinggal(new Date().getFullYear().toString());
    setNomorKk('');
    setNamaKepalaKeluarga('');
    setNomorHp('');
    setEmail('');
    setJumlahMotor(1);
    setJumlahMobil(0);
    setCatatanKhusus('');
    setFotoKtp('');
    setFotoKk('');
    setAnggotaList([
      {
        id: `ak-${Date.now()}`,
        namaLengkap: '',
        nik: '',
        hubunganKeluarga: 'Kepala Keluarga',
        jenisKelamin: 'L',
        usia: 35,
        agama: 'Islam',
        pendidikanTerakhir: 'SMA',
        pekerjaan: '',
        golonganDarah: 'Belum Tahu',
        statusBpjs: 'Aktif',
        statusPernikahan: 'Menikah',
      },
    ]);
  };

  // Initialize or reset form when modal opens or citizenToEdit changes
  React.useEffect(() => {
    if (citizenToEdit) {
      setGang(citizenToEdit.gang);
      setNomorRumah(citizenToEdit.nomorRumah);
      setStatusHunian(citizenToEdit.statusHunian);
      setStatusKtp(citizenToEdit.statusKtp);
      setTahunTinggal(citizenToEdit.tahunTinggal || '');
      setNomorKk(citizenToEdit.nomorKk);
      setNamaKepalaKeluarga(citizenToEdit.namaKepalaKeluarga);
      setNomorHp(citizenToEdit.nomorHp);
      setEmail(citizenToEdit.email || '');
      setJumlahMotor(citizenToEdit.jumlahKendaraan?.motor ?? 1);
      setJumlahMobil(citizenToEdit.jumlahKendaraan?.mobil ?? 0);
      setCatatanKhusus(citizenToEdit.catatanKhusus || '');
      setFotoKtp(citizenToEdit.fotoKtp || '');
      setFotoKk(citizenToEdit.fotoKk || '');
      setAnggotaList(
        citizenToEdit.anggotaKeluarga && citizenToEdit.anggotaKeluarga.length > 0
          ? citizenToEdit.anggotaKeluarga
          : [
              {
                id: `ak-${Date.now()}`,
                namaLengkap: citizenToEdit.namaKepalaKeluarga,
                hubunganKeluarga: 'Kepala Keluarga',
                jenisKelamin: 'L',
                usia: 35,
                agama: 'Islam',
                golonganDarah: 'Belum Tahu',
                statusBpjs: 'Aktif',
              },
            ]
      );
    } else {
      resetNewForm();
    }
    setErrorMessage(null);
    setSavedNotice(null);
  }, [citizenToEdit, isOpen]);

  // Keep first member name in sync with Kepala Keluarga if empty
  const handleKepalaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNamaKepalaKeluarga(val);
    setAnggotaList((prev) => {
      const copy = [...prev];
      if (copy[0] && copy[0].hubunganKeluarga === 'Kepala Keluarga') {
        copy[0] = { ...copy[0], namaLengkap: val };
      }
      return copy;
    });
  };

  const handleAddAnggota = () => {
    const newAnggota: AnggotaKeluarga = {
      id: `ak-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      namaLengkap: '',
      nik: '',
      hubunganKeluarga: 'Anak',
      jenisKelamin: 'L',
      usia: 10,
      agama: 'Islam',
      pendidikanTerakhir: 'SD',
      pekerjaan: 'Pelajar',
      golonganDarah: 'Belum Tahu',
      statusBpjs: 'Aktif',
      statusPernikahan: 'Belum Menikah',
    };
    setAnggotaList([...anggotaList, newAnggota]);
  };

  const handleRemoveAnggota = (id: string) => {
    if (anggotaList.length <= 1) {
      alert('Minimal harus ada 1 anggota keluarga (Kepala Keluarga)!');
      return;
    }
    setAnggotaList(anggotaList.filter((a) => a.id !== id));
  };

  const handleUpdateAnggota = (
    id: string,
    field: keyof AnggotaKeluarga,
    val: any
  ) => {
    setAnggotaList((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, [field]: val };
          if (field === 'namaLengkap' && a.hubunganKeluarga === 'Kepala Keluarga') {
            setNamaKepalaKeluarga(val);
          }
          return updated;
        }
        return a;
      })
    );
  };

  // Upload handler for KTP (auto-compressed so data saves reliably across server & browser)
  const handleKtpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Ukuran berkas foto KTP maksimal 15 MB.');
      return;
    }
    setIsCompressingDoc('ktp');
    setErrorMessage(null);
    try {
      const compressed = await compressImageFile(file, 1400, 0.82);
      setFotoKtp(compressed);
    } catch {
      setErrorMessage('Gagal memproses foto KTP. Silakan coba foto lain.');
    } finally {
      setIsCompressingDoc(null);
      e.target.value = '';
    }
  };

  // Upload handler for KK (auto-compressed so data saves reliably across server & browser)
  const handleKkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Ukuran berkas foto Kartu Keluarga maksimal 15 MB.');
      return;
    }
    setIsCompressingDoc('kk');
    setErrorMessage(null);
    try {
      const compressed = await compressImageFile(file, 1500, 0.84);
      setFotoKk(compressed);
    } catch {
      setErrorMessage('Gagal memproses foto Kartu Keluarga. Silakan coba foto lain.');
    } finally {
      setIsCompressingDoc(null);
      e.target.value = '';
    }
  };

  const submitHousehold = async (keepOpenForNext: boolean) => {
    if (!namaKepalaKeluarga.trim()) {
      setErrorMessage('Nama Kepala Keluarga wajib diisi!');
      return;
    }
    if (!nomorRumah.trim()) {
      setErrorMessage('Nomor Rumah tempat tinggal wajib diisi!');
      return;
    }
    if (!nomorHp.trim()) {
      setErrorMessage('Nomor WhatsApp / HP wajib diisi untuk koordinasi pengurus RT!');
      return;
    }

    const now = new Date();
    const tanggalUpdate =
      now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB';

    const householdData: DataKeluarga = {
      id: citizenToEdit ? citizenToEdit.id : `kk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nomorKk: nomorKk.trim() || '321606' + Math.floor(1000000000 + Math.random() * 9000000000),
      namaKepalaKeluarga: namaKepalaKeluarga.trim(),
      nomorHp: nomorHp.trim(),
      email: email.trim(),
      gang,
      nomorRumah: nomorRumah.trim(),
      statusHunian,
      statusKtp,
      tahunTinggal: tahunTinggal.trim() || new Date().getFullYear().toString(),
      jumlahKendaraan: {
        motor: Number(jumlahMotor) || 0,
        mobil: Number(jumlahMobil) || 0,
      },
      anggotaKeluarga: anggotaList.map((a, idx) => ({
        ...a,
        namaLengkap: a.namaLengkap.trim() || (idx === 0 ? namaKepalaKeluarga.trim() : 'Anggota Keluarga'),
      })),
      fotoKtp: fotoKtp || undefined,
      fotoKk: fotoKk || undefined,
      diverifikasiRt: true,
      tanggalUpdate,
      catatanKhusus: catatanKhusus.trim(),
    };

    setIsSaving(true);
    setErrorMessage(null);
    setSavedNotice(null);
    try {
      await onSave(householdData);
      if (keepOpenForNext && !isEditing) {
        const savedName = householdData.namaKepalaKeluarga;
        resetNewForm();
        setSavedNotice(`Data KK "${savedName}" berhasil tersimpan! Silakan lanjut isi data KK berikutnya.`);
      } else {
        onClose();
      }
    } catch {
      setErrorMessage('Gagal menyimpan data warga ke database. Silakan coba klik simpan kembali.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitHousehold(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center sm:p-4 p-0 animate-fadeIn">
      <div className="relative bg-white sm:rounded-2xl rounded-none max-w-4xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              {isEditing ? '✎' : '+'}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400 font-semibold leading-none">
                RT 05 Blok E Perumahan Bumi Setia Insani
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                {isEditing ? `Perbarui Data KK: ${citizenToEdit?.namaKepalaKeluarga}` : 'Formulir Pemutakhiran Data Warga (KK)'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Firebase Sync Status Bar */}
        <div
          className={`px-4 py-2 border-b text-[11px] flex flex-wrap items-center justify-between gap-2 ${
            cloudUserEmail
              ? 'bg-sky-50 border-sky-200 text-sky-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Cloud className={`w-3.5 h-3.5 shrink-0 ${cloudUserEmail ? 'text-sky-600' : 'text-amber-600'}`} />
            <span>
              {cloudUserEmail
                ? `Tersambung Cloud Firebase (${cloudUserEmail}) — data & foto KTP/KK otomatis tersimpan permanen.`
                : 'Mode Lokal/Server: Masuk Google agar data KK & foto KTP/KK tersimpan permanen di Cloud Firebase.'}
            </span>
          </div>
          {!cloudUserEmail && onGoogleSignIn && (
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold rounded-lg cursor-pointer shrink-0"
            >
              Masuk Google
            </button>
          )}
        </div>

        {/* Error / Success message banner */}
        {errorMessage && (
          <div className="px-4 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {savedNotice && (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-stone-800">
          {/* SECTION 1: LOKASI & TEMPAT TINGGAL */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 border-b border-stone-200 pb-2">
              <Home className="w-4 h-4 text-amber-600" />
              <span>1. LOKASI TEMPAT TINGGAL DI RT 05 BLOK E</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Gang Dropdown with 6 Official Gangs */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pilih Gang di RT 05 Blok E *
                </label>
                <select
                  value={gang}
                  onChange={(e) => setGang(e.target.value as GangName)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                >
                  {GANG_LIST.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-500 mt-1">Termasuk Gg Cendrawasih baru</p>
              </div>

              {/* Nomor Rumah */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Rumah / Blok Rumah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Blok E3 No. 08"
                  value={nomorRumah}
                  onChange={(e) => setNomorRumah(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 min-h-[44px]"
                />
              </div>

              {/* Status Tempat Tinggal */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Status Kepemilikan Rumah *
                </label>
                <select
                  value={statusHunian}
                  onChange={(e) => setStatusHunian(e.target.value as StatusHunian)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg min-h-[44px]"
                >
                  <option value="Milik Sendiri">Milik Sendiri (SHM/HGB)</option>
                  <option value="Kontrak / Sewa">Kontrak / Sewa</option>
                  <option value="Rumah Singgah / Kerabat">Rumah Singgah / Kerabat</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Status Kependudukan / KTP *
                </label>
                <select
                  value={statusKtp}
                  onChange={(e) => setStatusKtp(e.target.value as StatusKtp)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg min-h-[44px]"
                >
                  <option value="KTP RT 05 (Warga Tetap)">KTP RT 05 (Warga Tetap)</option>
                  <option value="KTP Luar (Warga Domisili)">KTP Luar (Warga Domisili / Pindah Datang)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tinggal di RT 05 Sejak Tahun
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 2021"
                  value={tahunTinggal}
                  onChange={(e) => setTahunTinggal(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: KEPALA KELUARGA & KONTAK */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 border-b border-stone-200 pb-2">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>2. DATA KEPALA KELUARGA & NOMOR WHATSAPP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Lengkap Kepala Keluarga *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bambang Sudarmono"
                  value={namaKepalaKeluarga}
                  onChange={handleKepalaChange}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Kartu Keluarga (No. KK - 16 Digit)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Contoh: 3216061205210001"
                  value={nomorKk}
                  onChange={(e) => setNomorKk(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor WhatsApp / HP Aktif *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081287654321"
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-mono min-h-[44px]"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Digunakan pengurus RT untuk koordinasi pengumuman & darurat
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="Contoh: warga@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: ANGGOTA KELUARGA (JIWA) */}
          <div className="p-4 bg-white rounded-xl border border-stone-300 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                <Users className="w-4 h-4 text-amber-600" />
                <span>3. ANGGOTA KELUARGA / JIWA ({anggotaList.length} Orang)</span>
              </div>
              <button
                type="button"
                onClick={handleAddAnggota}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer self-start sm:self-auto min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Anggota Keluarga</span>
              </button>
            </div>

            <div className="space-y-4">
              {anggotaList.map((anggota, index) => (
                <div
                  key={anggota.id}
                  className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <span>
                        {index === 0 ? 'Kepala Keluarga' : `Anggota Keluarga #${index + 1}`}
                      </span>
                    </span>

                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAnggota(anggota.id)}
                        className="text-stone-400 hover:text-red-500 p-1 rounded-lg cursor-pointer transition-colors"
                        title="Hapus anggota keluarga ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama sesuai KTP/Akta"
                        value={anggota.namaLengkap}
                        onChange={(e) => handleUpdateAnggota(anggota.id, 'namaLengkap', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                        Hubungan Keluarga *
                      </label>
                      <select
                        value={anggota.hubunganKeluarga}
                        onChange={(e) =>
                          handleUpdateAnggota(anggota.id, 'hubunganKeluarga', e.target.value as HubunganKeluarga)
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs min-h-[38px]"
                      >
                        <option value="Kepala Keluarga">Kepala Keluarga</option>
                        <option value="Istri">Istri</option>
                        <option value="Anak">Anak</option>
                        <option value="Orang Tua">Orang Tua</option>
                        <option value="Mertua">Mertua</option>
                        <option value="Famili Lain">Famili Lain</option>
                        <option value="Asisten RT">Asisten RT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                        Jenis Kelamin *
                      </label>
                      <select
                        value={anggota.jenisKelamin}
                        onChange={(e) =>
                          handleUpdateAnggota(anggota.id, 'jenisKelamin', e.target.value as JenisKelamin)
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs min-h-[38px]"
                      >
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                        Usia (Tahun)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={anggota.usia}
                        onChange={(e) =>
                          handleUpdateAnggota(anggota.id, 'usia', Number(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                        Agama
                      </label>
                      <select
                        value={anggota.agama}
                        onChange={(e) =>
                          handleUpdateAnggota(anggota.id, 'agama', e.target.value as Agama)
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs min-h-[38px]"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen Protestan">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Khonghucu">Khonghucu</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                        Pekerjaan
                      </label>
                      <input
                        type="text"
                        placeholder="Karyawan, Guru, dll."
                        value={anggota.pekerjaan || ''}
                        onChange={(e) => handleUpdateAnggota(anggota.id, 'pekerjaan', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                        BPJS Kesehatan
                      </label>
                      <select
                        value={anggota.statusBpjs}
                        onChange={(e) =>
                          handleUpdateAnggota(anggota.id, 'statusBpjs', e.target.value as StatusBpjs)
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs min-h-[38px]"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                        <option value="Belum Ada">Belum Ada</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: UPLOAD DOKUMEN KTP & KARTU KELUARGA (KK) - REQUESTED */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/90 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 border-b border-amber-200 pb-2">
              <Upload className="w-4 h-4 text-amber-700" />
              <span>4. UPLOAD DOKUMEN FOTO/SCAN KTP & KARTU KELUARGA (KK)</span>
            </div>

            <p className="text-[11px] text-stone-600">
              Unggah foto fisik atau scan dokumen KTP Kepala Keluarga dan Kartu Keluarga (KK). Dokumen ini tersimpan secara aman dan hanya dapat diverifikasi oleh Ketua RT & Pengurus RT 05 Blok E.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Upload Foto KTP */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-700" />
                      <span>Foto KTP Kepala Keluarga</span>
                    </span>
                    {fotoKtp && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Terunggah
                      </span>
                    )}
                  </div>

                  {fotoKtp ? (
                    <div className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-100 mb-2 max-h-48 flex items-center justify-center">
                      <img
                        src={fotoKtp}
                        alt="Pratinjau KTP"
                        className="w-full h-36 object-cover object-center"
                      />
                      <button
                        type="button"
                        onClick={() => setFotoKtp('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm cursor-pointer"
                        title="Hapus foto KTP"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-stone-300 rounded-lg text-center mb-2 bg-stone-50">
                      <Camera className="w-7 h-7 text-stone-400 mx-auto mb-1" />
                      <div className="text-xs font-semibold text-stone-700">Belum ada foto KTP</div>
                      <div className="text-[10px] text-stone-500">Kamera HP / Format JPG, PNG</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCameraDoc('ktp')}
                    disabled={isCompressingDoc === 'ktp'}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg cursor-pointer transition-colors min-h-[42px] text-center shadow-xs active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-stone-950 shrink-0" />
                    <span>Ambil Foto Langsung</span>
                  </button>

                  <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg cursor-pointer transition-colors min-h-[42px] text-center">
                    <Upload className="w-3.5 h-3.5 text-stone-800 shrink-0" />
                    <span>
                      {isCompressingDoc === 'ktp'
                        ? 'Memproses...'
                        : fotoKtp
                        ? 'Ganti File KTP'
                        : 'Pilih Galeri / File'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKtpUpload}
                      disabled={isCompressingDoc === 'ktp'}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Upload Foto Kartu Keluarga (KK) */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-700" />
                      <span>Foto Kartu Keluarga (KK)</span>
                    </span>
                    {fotoKk && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Terunggah
                      </span>
                    )}
                  </div>

                  {fotoKk ? (
                    <div className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-100 mb-2 max-h-48 flex items-center justify-center">
                      <img
                        src={fotoKk}
                        alt="Pratinjau KK"
                        className="w-full h-36 object-cover object-center"
                      />
                      <button
                        type="button"
                        onClick={() => setFotoKk('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm cursor-pointer"
                        title="Hapus foto KK"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-stone-300 rounded-lg text-center mb-2 bg-stone-50">
                      <Camera className="w-7 h-7 text-stone-400 mx-auto mb-1" />
                      <div className="text-xs font-semibold text-stone-700">Belum ada foto KK</div>
                      <div className="text-[10px] text-stone-500">Lembar KK tampak jelas & terbaca</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCameraDoc('kk')}
                    disabled={isCompressingDoc === 'kk'}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg cursor-pointer transition-colors min-h-[42px] text-center shadow-xs active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-stone-950 shrink-0" />
                    <span>Ambil Foto Langsung</span>
                  </button>

                  <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg cursor-pointer transition-colors min-h-[42px] text-center">
                    <Upload className="w-3.5 h-3.5 text-stone-800 shrink-0" />
                    <span>
                      {isCompressingDoc === 'kk'
                        ? 'Memproses...'
                        : fotoKk
                        ? 'Ganti File KK'
                        : 'Pilih Galeri / File'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKkUpload}
                      disabled={isCompressingDoc === 'kk'}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: KENDARAAN & CATATAN */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 border-b border-stone-200 pb-2">
              <Car className="w-4 h-4 text-amber-600" />
              <span>5. KENDARAAN (KETERTIBAAN PARKIR GANG) & CATATAN WARGA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Jumlah Motor
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={jumlahMotor}
                    onChange={(e) => setJumlahMotor(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Jumlah Mobil
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={jumlahMobil}
                    onChange={(e) => setJumlahMobil(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Catatan Khusus (Lansia, Balita, Kebutuhan Khusus)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ada lansia butuh perhatian, dll."
                  value={catatanKhusus}
                  onChange={(e) => setCatatanKhusus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer min-h-[44px]"
            >
              Batal
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={() => submitHousehold(true)}
                disabled={isSaving || isCompressingDoc !== null}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4 text-emerald-950" />
                <span>Simpan &amp; Tambah KK Lainnya</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving || isCompressingDoc !== null}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer min-h-[44px]"
            >
              <CheckCircle className="w-4 h-4 text-stone-950" />
              <span>
                {isSaving
                  ? 'Menyimpan Data ke Database...'
                  : isEditing
                  ? 'Simpan Perubahan Data KK'
                  : 'Simpan Pemutakhiran Data KK'}
              </span>
            </button>
          </div>
        </form>
      </div>

      <CameraCaptureModal
        isOpen={activeCameraDoc !== null}
        docType={activeCameraDoc || 'ktp'}
        onClose={() => setActiveCameraDoc(null)}
        onCapture={(dataUrl) => {
          if (activeCameraDoc === 'ktp') {
            setFotoKtp(dataUrl);
          } else if (activeCameraDoc === 'kk') {
            setFotoKk(dataUrl);
          }
          setErrorMessage(null);
        }}
      />
    </div>
  );
};
