import React from 'react';
import { Candidate } from '../data/candidates';
import {
  X,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Shield,
  Briefcase,
  Phone,
  Image as ImageIcon,
  Camera
} from 'lucide-react';

interface CandidateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: Candidate) => void;
  candidateToEdit?: Candidate | null;
  existingCount: number;
}

export const CandidateFormModal: React.FC<CandidateFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  candidateToEdit,
  existingCount,
}) => {
  const isEditing = !!candidateToEdit;

  // Form states
  const [nomorUrut, setNomorUrut] = React.useState('');
  const [namaLengkap, setNamaLengkap] = React.useState('');
  const [namaPanggilan, setNamaPanggilan] = React.useState('');
  const [foto, setFoto] = React.useState('');
  const [usia, setUsia] = React.useState<number>(40);
  const [pekerjaan, setPekerjaan] = React.useState('');
  const [alamat, setAlamat] = React.useState('');
  const [blok, setBlok] = React.useState('Gg Utama');
  const [lamaTinggal, setLamaTinggal] = React.useState('');
  const [pendidikan, setPendidikan] = React.useState('');
  const [tagline, setTagline] = React.useState('');
  const [ringkasan, setRingkasan] = React.useState('');
  const [visi, setVisi] = React.useState('');
  const [misiList, setMisiList] = React.useState<string[]>(['']);
  const [kategoriFokus, setKategoriFokus] = React.useState<('keamanan' | 'transparansi' | 'lingkungan' | 'sosial' | 'digital')[]>(['keamanan']);
  
  // Quick wins 100 hari
  const [program100Hari, setProgram100Hari] = React.useState<Array<{ judul: string; deskripsi: string; targetWaktu: string; kategori: string }>>([
    { judul: '', deskripsi: '', targetWaktu: 'Bulan ke-1', kategori: 'Keamanan' }
  ]);

  // Rekam jejak
  const [rekamJejak, setRekamJejak] = React.useState<Array<{ tahun: string; kegiatan: string; peran: string }>>([
    { tahun: '2024', kegiatan: '', peran: '' }
  ]);

  // Komitmen integritas
  const [komitmenList, setKomitmenList] = React.useState<string[]>([
    'Siap mempublikasikan laporan keuangan dan kas RT 005 secara terbuka setiap bulan.',
    'Pelayanan pengurusan surat pengantar warga tanpa biaya sepeser pun (Zero Pungli).'
  ]);

  // Kontak
  const [telepon, setTelepon] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [jamKonsultasi, setJamKonsultasi] = React.useState('Setiap Hari 19.00 - 21.00 WIB');

  // Error validation
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Initialize form when opened or candidateToEdit changes
  React.useEffect(() => {
    if (candidateToEdit) {
      setNomorUrut(candidateToEdit.nomorUrut);
      setNamaLengkap(candidateToEdit.namaLengkap);
      setNamaPanggilan(candidateToEdit.namaPanggilan);
      setFoto(candidateToEdit.foto);
      setUsia(candidateToEdit.usia);
      setPekerjaan(candidateToEdit.pekerjaan);
      setAlamat(candidateToEdit.alamat);
      setBlok(candidateToEdit.blok);
      setLamaTinggal(candidateToEdit.lamaTinggal);
      setPendidikan(candidateToEdit.pendidikan);
      setTagline(candidateToEdit.tagline);
      setRingkasan(candidateToEdit.ringkasan);
      setVisi(candidateToEdit.visi);
      setMisiList(candidateToEdit.misi.length ? candidateToEdit.misi : ['']);
      setKategoriFokus(candidateToEdit.kategoriFokus);
      setProgram100Hari(candidateToEdit.program100Hari.length ? candidateToEdit.program100Hari : [{ judul: '', deskripsi: '', targetWaktu: 'Bulan ke-1', kategori: 'Keamanan' }]);
      setRekamJejak(candidateToEdit.rekamJejak.length ? candidateToEdit.rekamJejak : [{ tahun: '2024', kegiatan: '', peran: '' }]);
      setKomitmenList(candidateToEdit.komitmenIntegritas.length ? candidateToEdit.komitmenIntegritas : ['Siap transparan dalam pengelolaan kas RT']);
      setTelepon(candidateToEdit.kontak.telepon);
      setEmail(candidateToEdit.kontak.email);
      setJamKonsultasi(candidateToEdit.kontak.jamKonsultasi);
    } else {
      // Default new candidate for RT 005 Bumi Setia Insani
      const nextNum = String(existingCount + 1).padStart(2, '0');
      setNomorUrut(nextNum);
      setNamaLengkap('');
      setNamaPanggilan('');
      setFoto('');
      setUsia(42);
      setPekerjaan('');
      setAlamat('Perumahan Bumi Setia Insani Blok E, Gg Utama No. ');
      setBlok('Gg Utama');
      setLamaTinggal('4 Tahun');
      setPendidikan('Sarjana (S1)');
      setTagline('');
      setRingkasan('');
      setVisi('');
      setMisiList(['Memperkuat keamanan dan ketertiban lingkungan RT 005.', 'Menjamin transparansi kas dan iuran warga secara terbuka.']);
      setKategoriFokus(['keamanan', 'transparansi']);
      setProgram100Hari([
        { judul: 'Penataan Pos Satpam & Portal Masuk RT 005', deskripsi: 'Peningkatan keamanan lingkungan dan jadwal jaga.', targetWaktu: 'Bulan ke-1', kategori: 'Keamanan' },
        { judul: 'Penerbitan Laporan Kas RT Online via WhatsApp', deskripsi: 'Pemberitahuan saldo kas dan iuran rutin bulanan.', targetWaktu: 'Bulan ke-2', kategori: 'Transparansi' }
      ]);
      setRekamJejak([
        { tahun: '2024', kegiatan: 'Gotong Royong & Ronda RT 005 Bumi Setia Insani', peran: 'Warga Aktif' }
      ]);
      setKomitmenList([
        'Siap mempublikasikan laporan kas RT 005 setiap awal bulan secara terbuka.',
        'Zero Pungli dalam setiap pelayanan administrasi surat pengantar warga.',
        'Mengutamakan musyawarah dan guyub rukun warga Perumahan Bumi Setia Insani.'
      ]);
      setTelepon('08');
      setEmail('');
      setJamKonsultasi('Setiap Malam 19.30 - 21.00 WIB');
    }
    setErrorMessage(null);
  }, [candidateToEdit, existingCount, isOpen]);

  if (!isOpen) return null;

  // Handle local image file upload (camera or gallery on mobile)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('Ukuran file foto maksimal 8 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic Misi handlers
  const handleAddMisi = () => setMisiList([...misiList, '']);
  const handleUpdateMisi = (index: number, val: string) => {
    const updated = [...misiList];
    updated[index] = val;
    setMisiList(updated);
  };
  const handleRemoveMisi = (index: number) => {
    if (misiList.length <= 1) return;
    setMisiList(misiList.filter((_, i) => i !== index));
  };

  // Dynamic Program handlers
  const handleAddProgram = () => {
    setProgram100Hari([
      ...program100Hari,
      { judul: '', deskripsi: '', targetWaktu: `Bulan ke-${program100Hari.length + 1}`, kategori: 'Umum' }
    ]);
  };
  const handleUpdateProgram = (index: number, field: string, val: string) => {
    const updated = [...program100Hari];
    updated[index] = { ...updated[index], [field]: val };
    setProgram100Hari(updated);
  };
  const handleRemoveProgram = (index: number) => {
    if (program100Hari.length <= 1) return;
    setProgram100Hari(program100Hari.filter((_, i) => i !== index));
  };

  // Dynamic Rekam Jejak handlers
  const handleAddJejak = () => {
    setRekamJejak([...rekamJejak, { tahun: '2025', kegiatan: '', peran: '' }]);
  };
  const handleUpdateJejak = (index: number, field: string, val: string) => {
    const updated = [...rekamJejak];
    updated[index] = { ...updated[index], [field]: val };
    setRekamJejak(updated);
  };
  const handleRemoveJejak = (index: number) => {
    if (rekamJejak.length <= 1) return;
    setRekamJejak(rekamJejak.filter((_, i) => i !== index));
  };

  // Dynamic Komitmen handlers
  const handleAddKomitmen = () => setKomitmenList([...komitmenList, '']);
  const handleUpdateKomitmen = (index: number, val: string) => {
    const updated = [...komitmenList];
    updated[index] = val;
    setKomitmenList(updated);
  };
  const handleRemoveKomitmen = (index: number) => {
    if (komitmenList.length <= 1) return;
    setKomitmenList(komitmenList.filter((_, i) => i !== index));
  };

  // Toggle Category
  const toggleCategory = (cat: 'keamanan' | 'transparansi' | 'lingkungan' | 'sosial' | 'digital') => {
    if (kategoriFokus.includes(cat)) {
      if (kategoriFokus.length > 1) {
        setKategoriFokus(kategoriFokus.filter((c) => c !== cat));
      }
    } else {
      setKategoriFokus([...kategoriFokus, cat]);
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaLengkap.trim()) {
      setErrorMessage('Nama Lengkap calon wajib diisi!');
      return;
    }
    if (!visi.trim()) {
      setErrorMessage('Visi calon wajib diisi!');
      return;
    }

    const cleanMisi = misiList.filter((m) => m.trim().length > 0);
    if (cleanMisi.length === 0) {
      setErrorMessage('Masukkan minimal 1 butir misi!');
      return;
    }

    const clean100Hari = program100Hari.filter((p) => p.judul.trim().length > 0);
    const cleanJejak = rekamJejak.filter((j) => j.kegiatan.trim().length > 0);
    const cleanKomitmen = komitmenList.filter((k) => k.trim().length > 0);

    const candidateData: Candidate = {
      id: candidateToEdit ? candidateToEdit.id : `c-${Date.now()}`,
      nomorUrut: nomorUrut.trim() || '01',
      namaLengkap: namaLengkap.trim(),
      namaPanggilan: namaPanggilan.trim() || namaLengkap.split(' ')[0],
      foto: foto || '',
      usia: Number(usia) || 40,
      pekerjaan: pekerjaan.trim() || 'Warga RT 005',
      alamat: alamat.trim() || 'Perumahan Bumi Setia Insani, RT 005',
      blok: blok.trim() || 'Gang 1',
      lamaTinggal: lamaTinggal.trim() || 'Warga RT 005',
      pendidikan: pendidikan.trim() || 'SMA / Sarjana',
      tagline: tagline.trim() || `Bersama Memajukan RT 005 Bumi Setia Insani`,
      ringkasan: ringkasan.trim() || `Calon Ketua RT 005 Perumahan Bumi Setia Insani, Pahlawan Setia, Tarumajaya, Bekasi.`,
      visi: visi.trim(),
      misi: cleanMisi,
      kategoriFokus,
      program100Hari: clean100Hari.length ? clean100Hari : [
        { judul: 'Rembug Warga & Pembenahan Lingkungan', deskripsi: 'Musyawarah bersama warga RT 005.', targetWaktu: 'Bulan ke-1', kategori: 'Sosial' }
      ],
      programKerjaUtama: candidateToEdit?.programKerjaUtama || [
        {
          bidang: 'Keamanan',
          kegiatan: 'Penguatan pos kamling dan portal masuk.',
          indikator: 'Lingkungan aman 24 jam.'
        },
        {
          bidang: 'Transparansi',
          kegiatan: 'Laporan kas bulanan RT 005 terbuka untuk warga.',
          indikator: 'Publikasi rutin tiap bulan.'
        }
      ],
      rekamJejak: cleanJejak.length ? cleanJejak : [
        { tahun: '2024 - Sekarang', kegiatan: 'Warga Aktif RT 005 Bumi Setia Insani', peran: 'Gotong royong' }
      ],
      komitmenIntegritas: cleanKomitmen.length ? cleanKomitmen : [
        'Transparan dan jujur dalam mengelola kas RT 005.',
        'Pelayanan administrasi warga tanpa pungli.'
      ],
      dokumenTersedia: candidateToEdit?.dokumenTersedia || [
        { nama: 'KTP / KK Domisili RT 005', status: 'Terverifikasi', keterangan: 'Warga Perumahan Bumi Setia Insani' }
      ],
      kontak: {
        telepon: telepon.trim() || '0812-0000-0000',
        email: email.trim() || '',
        jamKonsultasi: jamKonsultasi.trim() || 'Setiap Malam'
      }
    };

    onSave(candidateData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center sm:p-4 p-0 animate-fadeIn">
      {/* Container: Fullscreen on mobile, rounded card on tablet/desktop */}
      <div className="relative bg-white sm:rounded-2xl rounded-none max-w-3xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              {isEditing ? '✎' : '+'}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400 font-semibold leading-none">
                RT 005 Perumahan Bumi Setia Insani
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                {isEditing ? `Edit Calon: ${candidateToEdit?.namaPanggilan || candidateToEdit?.namaLengkap}` : 'Formulir Calon Ketua RT Baru'}
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

        {/* Error message banner */}
        {errorMessage && (
          <div className="px-4 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-stone-800">
          {/* SECTION 1: IDENTITAS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-stone-200 font-bold text-stone-900 text-xs sm:text-sm">
              <User className="w-4 h-4 text-amber-700" />
              <span>1. Identitas Calon & Foto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
              {/* Nomor Urut */}
              <div className="sm:col-span-3">
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Nomor Urut *
                </label>
                <input
                  type="text"
                  required
                  placeholder="01"
                  value={nomorUrut}
                  onChange={(e) => setNomorUrut(e.target.value)}
                  className="w-full px-3 py-2.5 text-center font-mono font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-sm min-h-[44px]"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="sm:col-span-5">
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.T."
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-sm min-h-[44px]"
                />
              </div>

              {/* Nama Panggilan */}
              <div className="sm:col-span-4">
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Nama Panggilan / Sapaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pak Budi"
                  value={namaPanggilan}
                  onChange={(e) => setNamaPanggilan(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-sm min-h-[44px]"
                />
              </div>
            </div>

            {/* Foto Upload (Mobile camera & gallery friendly) */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
              <label className="block font-semibold text-stone-800 text-xs">
                Foto Calon (Pilih dari HP / Laptop)
              </label>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-200 border-2 border-stone-300 shrink-0 flex items-center justify-center">
                  {foto ? (
                    <img
                      src={foto}
                      alt="Pratinjau"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="text-center text-stone-400 p-1">
                      <Camera className="w-5 h-5 mx-auto mb-0.5" />
                      <span className="text-[10px] block leading-none">Belum ada</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-stone-900 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 cursor-pointer shadow-xs min-h-[44px] w-full sm:w-auto">
                    <Upload className="w-4 h-4 text-stone-600 shrink-0" />
                    <span>Pilih Foto dari Galeri / Kamera HP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-stone-500">
                    *Foto bisa berupa foto resmi atau foto santai calon
                  </p>
                </div>
              </div>
            </div>

            {/* Gang & Alamat */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
              <div className="sm:col-span-5">
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Gang di RT 05 Blok E *
                </label>
                <select
                  value={blok}
                  onChange={(e) => setBlok(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-sm font-bold min-h-[44px]"
                >
                  <option value="Gg Utama">Gg Utama</option>
                  <option value="Gg Bhineka">Gg Bhineka</option>
                  <option value="Gg Damai">Gg Damai</option>
                  <option value="Gg Walet">Gg Walet</option>
                  <option value="Gg Jalak suren">Gg Jalak suren</option>
                </select>
              </div>

              <div className="sm:col-span-7">
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Nomor Rumah / Alamat Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: No. 12 (RT 05 Blok E)"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-sm min-h-[44px]"
                />
              </div>
            </div>

            {/* Usia, Pekerjaan, Pendidikan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Usia (Tahun)
                </label>
                <input
                  type="number"
                  min={21}
                  max={85}
                  value={usia}
                  onChange={(e) => setUsia(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Profesi / Pekerjaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Karyawan Swasta / Wiraswasta"
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Nomor WhatsApp Calon
                </label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono min-h-[44px]"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Slogan / Tagline Calon
              </label>
              <input
                type="text"
                placeholder="Contoh: Bersama Mewujudkan RT 005 Aman, Rukun, dan Transparan"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm min-h-[44px]"
              />
            </div>
          </div>

          {/* SECTION 2: VISI & MISI */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center gap-2 pb-1.5 border-b border-stone-200 font-bold text-stone-900 text-xs sm:text-sm">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>2. Visi & Misi untuk RT 005</span>
            </div>

            {/* Visi */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Visi Calon Ketua RT *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Tuliskan visi utama untuk lingkungan RT 005 Bumi Setia Insani..."
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm"
              />
            </div>

            {/* Dynamic Misi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-stone-700 text-xs">
                  Butir-Butir Misi (Langkah Konkret)
                </label>
                <button
                  type="button"
                  onClick={handleAddMisi}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 p-1 cursor-pointer min-h-[36px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Misi</span>
                </button>
              </div>

              <div className="space-y-2">
                {misiList.map((misi, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-stone-400 w-5 shrink-0 text-right">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder={`Misi ${idx + 1}...`}
                      value={misi}
                      onChange={(e) => handleUpdateMisi(idx, e.target.value)}
                      className="flex-1 px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg min-h-[40px]"
                    />
                    {misiList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMisi(idx)}
                        className="p-2 text-stone-400 hover:text-red-600 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                        title="Hapus butir ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: PROGRAM UNGGULAN */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs sm:text-sm">
                <Briefcase className="w-4 h-4 text-amber-700" />
                <span>3. Rencana Program Kerja Utama</span>
              </div>
              <button
                type="button"
                onClick={handleAddProgram}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 p-1 cursor-pointer min-h-[36px]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Program</span>
              </button>
            </div>

            <div className="space-y-3">
              {program100Hari.map((prog, idx) => (
                <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Judul Program (misal: Penguatan Keamanan Portal)"
                      value={prog.judul}
                      onChange={(e) => handleUpdateProgram(idx, 'judul', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs sm:text-sm font-semibold bg-white border border-stone-300 rounded-lg min-h-[40px]"
                    />
                    {program100Hari.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProgram(idx)}
                        className="p-2 text-stone-400 hover:text-red-600 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Uraian kegiatan program kerja ini..."
                    value={prog.deskripsi}
                    onChange={(e) => handleUpdateProgram(idx, 'deskripsi', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: KOMITMEN INTEGRITAS */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center gap-2 pb-1.5 border-b border-stone-200 font-bold text-stone-900 text-xs sm:text-sm">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>4. Janji & Komitmen Integritas Calon</span>
            </div>

            <div className="space-y-2">
              {komitmenList.map((komitmen, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <input
                    type="text"
                    placeholder="Poin komitmen..."
                    value={komitmen}
                    onChange={(e) => handleUpdateKomitmen(idx, e.target.value)}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg min-h-[40px]"
                  />
                  {komitmenList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveKomitmen(idx)}
                      className="p-2 text-stone-400 hover:text-red-600 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddKomitmen}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 pt-1 cursor-pointer min-h-[36px]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Poin Komitmen</span>
              </button>
            </div>
          </div>

          {/* Sticky Bottom Form Action Bar for Mobile & Desktop */}
          <div className="pt-4 pb-2 border-t border-stone-200 flex items-center justify-between gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 cursor-pointer min-h-[48px]"
            >
              Batalkan
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer min-h-[48px]"
            >
              <CheckCircle className="w-4 h-4 text-stone-950" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Simpan & Terbitkan Calon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
