import React from 'react';
import {
  Search,
  UserPlus,
  Download,
  Upload,
  Home,
  Users,
  Phone,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
  Car,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Cloud,
} from 'lucide-react';
import { GANG_LIST, GangName } from '../data/gangList';
import { DataKeluarga } from '../data/citizenData';
import {
  downloadCitizenPdfWithAttachments,
  downloadAllCitizensPdfWithAttachments,
  downloadCitizensExcelTemplate,
} from '../utils/citizenExport';
import { GoogleDrivePanel } from './GoogleDrivePanel';

interface CitizenListSectionProps {
  citizens: DataKeluarga[];
  onOpenAddCitizen: () => void;
  onOpenDetail: (citizen: DataKeluarga) => void;
  onOpenEdit: (citizen: DataKeluarga) => void;
  onDeleteCitizen: (id: string, name: string) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportExcel?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPengurusUnlocked: boolean;
  onUnlockPengurus: (password: string) => boolean;
  onLockPengurus: () => void;
  cloudUserEmail?: string | null;
  isCloudAdmin?: boolean;
  onGoogleSignIn?: () => Promise<void> | void;
  isSyncingCloud?: boolean;
  driveAccessToken?: string | null;
  onRestoreFromDrive?: (restored: DataKeluarga[]) => Promise<void>;
  onNotify?: (msg: string) => void;
  showUpdateCitizenBox?: boolean;
  onToggleUpdateCitizenBox?: () => void;
}

export const CitizenListSection: React.FC<CitizenListSectionProps> = ({
  citizens,
  onOpenAddCitizen,
  onOpenDetail,
  onOpenEdit,
  onDeleteCitizen,
  onExportCsv,
  onExportJson,
  onImportJson,
  onImportExcel,
  isPengurusUnlocked,
  onUnlockPengurus,
  onLockPengurus,
  cloudUserEmail,
  isCloudAdmin,
  onGoogleSignIn,
  isSyncingCloud,
  driveAccessToken = null,
  onRestoreFromDrive,
  onNotify,
  showUpdateCitizenBox = true,
  onToggleUpdateCitizenBox,
}) => {
  const [selectedGang, setSelectedGang] = React.useState<string>('semua');
  const [selectedStatusKtp, setSelectedStatusKtp] = React.useState<string>('semua');
  const [selectedStatusHunian, setSelectedStatusHunian] = React.useState<string>('semua');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [viewMode, setViewMode] = React.useState<'card' | 'table'>('card');
  const [downloadingPdfId, setDownloadingPdfId] = React.useState<string | null>(null);
  const [isDownloadingAllPdf, setIsDownloadingAllPdf] = React.useState(false);

  // Password state for unlocking
  const [inputPassword, setInputPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const handleDownloadSinglePdf = async (citizen: DataKeluarga) => {
    setDownloadingPdfId(citizen.id);
    try {
      await downloadCitizenPdfWithAttachments(citizen);
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleDownloadAllPdf = async (list: DataKeluarga[]) => {
    if (list.length === 0) return;
    setIsDownloadingAllPdf(true);
    try {
      await downloadAllCitizensPdfWithAttachments(list);
    } finally {
      setIsDownloadingAllPdf(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPassword.trim()) {
      setPasswordError('Silakan masukkan sandi pengaman pengurus!');
      return;
    }

    const success = onUnlockPengurus(inputPassword.trim());
    if (success) {
      setPasswordError(null);
      setInputPassword('');
    } else {
      setPasswordError('Sandi salah! Akses khusus Ketua RT & Pengurus RT 05.');
    }
  };

  // Filter logic
  const filteredCitizens = citizens.filter((c) => {
    const matchesGang = selectedGang === 'semua' || c.gang === selectedGang;
    const matchesKtp =
      selectedStatusKtp === 'semua' ||
      (selectedStatusKtp === 'tetap' && c.statusKtp.includes('Warga Tetap')) ||
      (selectedStatusKtp === 'domisili' && c.statusKtp.includes('Domisili'));
    const matchesHunian =
      selectedStatusHunian === 'semua' || c.statusHunian === selectedStatusHunian;

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      query === '' ||
      c.namaKepalaKeluarga.toLowerCase().includes(query) ||
      c.nomorRumah.toLowerCase().includes(query) ||
      c.nomorKk.toLowerCase().includes(query) ||
      c.nomorHp.includes(query) ||
      c.gang.toLowerCase().includes(query) ||
      c.anggotaKeluarga.some(
        (a) =>
          a.namaLengkap.toLowerCase().includes(query) ||
          (a.nik && a.nik.includes(query)) ||
          (a.pekerjaan && a.pekerjaan.toLowerCase().includes(query))
      );

    return matchesGang && matchesKtp && matchesHunian && matchesQuery;
  });

  return (
    <section id="daftar-warga" className="py-8 sm:py-12 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Quick Action */}
        <div className="mb-6 p-4 sm:p-5 bg-stone-900 text-white rounded-2xl border border-stone-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-0.5">
              Direktori Data Kependudukan RT 05 Blok E
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Daftar Kartu Keluarga (KK) & Warga Terdata</span>
              {isPengurusUnlocked ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  🔓 Akses Terbuka
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  🔒 Terproteksi Sandi
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">
              {citizens.length} Kepala Keluarga terdaftar di 6 gang resmi RT 05 Blok E Bumi Setia Insani.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {showUpdateCitizenBox ? (
              <button
                onClick={onOpenAddCitizen}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer min-h-[44px]"
              >
                <UserPlus className="w-4 h-4 text-stone-950" />
                <span>+ Mutakhirkan Data KK</span>
              </button>
            ) : !isPengurusUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-300 bg-stone-800 border border-stone-700 rounded-xl">
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Kotak Mutakhirkan Data Ditutup Pengurus</span>
              </span>
            ) : null}

            {isPengurusUnlocked && (
              <>
                {onToggleUpdateCitizenBox && (
                  <button
                    onClick={onToggleUpdateCitizenBox}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px] active:scale-95 border ${
                      showUpdateCitizenBox
                        ? 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border-emerald-500/40'
                        : 'bg-amber-400 hover:bg-amber-300 text-stone-950 border-amber-300'
                    }`}
                    title="Munculkan atau tutup kotak + Mutakhirkan Data KK untuk warga"
                  >
                    {showUpdateCitizenBox ? (
                      <>
                        <EyeOff className="w-4 h-4 shrink-0" />
                        <span>Tutup Kotak Mutakhirkan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 shrink-0" />
                        <span>Munculkan Kotak Mutakhirkan</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDownloadAllPdf(citizens)}
                  disabled={citizens.length === 0 || isDownloadingAllPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-stone-800 hover:bg-stone-700 border border-stone-600 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px] active:scale-95"
                  title="Unduh Rekap PDF A4 seluruh warga beserta lampiran KTP & KK"
                >
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isDownloadingAllPdf ? 'Membuat PDF...' : 'Download PDF (+ KTP/KK)'}</span>
                </button>

                <button
                  onClick={onExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px] active:scale-95"
                  title="Unduh seluruh data warga RT 05 ke format Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-stone-950 shrink-0" />
                  <span>Download Excel</span>
                </button>

                {onImportExcel && (
                  <label
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 bg-stone-800 hover:bg-stone-700 border border-amber-500/40 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                    title="Import banyak data KK sekaligus dari file Excel (.xlsx / .csv)"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Import Excel</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={onImportExcel}
                      className="hidden"
                    />
                  </label>
                )}

                <button
                  onClick={downloadCitizensExcelTemplate}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                  title="Unduh contoh format Excel untuk input banyak KK sekaligus"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Template Excel</span>
                </button>

                <button
                  onClick={onExportJson}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                  title="Unduh cadangan data JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cadangan JSON</span>
                </button>

                <label className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer min-h-[44px]">
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pulihkan JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportJson}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={onLockPengurus}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-600/40 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                  title="Kunci kembali direktori data"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kunci</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* SECURITY GATE: IF LOCKED, SHOW PASSWORD AUTH CARD */}
        {!isPengurusUnlocked ? (
          <div className="bg-stone-50 border border-stone-300 rounded-2xl p-6 sm:p-10 max-w-xl mx-auto text-center shadow-xs my-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-stone-900 mx-auto flex items-center justify-center mb-4 shadow-xs">
              <Lock className="w-7 h-7 text-amber-800" />
            </div>

            <h4 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Direktori Data Warga Terkunci
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed max-w-md mx-auto">
              Demi privasi dan perlindungan data kependudukan (NIK, No. KK, Nomor HP, & daftar keluarga), bagian data warga hanya dapat diakses oleh <strong>Ketua RT & Pengurus RT 05</strong>.
            </p>

            <form onSubmit={handlePasswordSubmit} className="mt-6 max-w-sm mx-auto space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan Sandi Pengurus RT..."
                  value={inputPassword}
                  onChange={(e) => {
                    setInputPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 min-h-[46px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-stone-400 hover:text-stone-600 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer min-h-[46px]"
              >
                <Unlock className="w-4 h-4 text-stone-950" />
                <span>Buka Akses Pengurus</span>
              </button>

              {onGoogleSignIn && (
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl transition-all cursor-pointer min-h-[44px]"
                >
                  <Cloud className="w-4 h-4 text-sky-700" />
                  <span>
                    {cloudUserEmail
                      ? `Terhubung Google: ${cloudUserEmail}`
                      : 'Masuk Google (Sinkron Cloud Firebase)'}
                  </span>
                </button>
              )}
            </form>

            <div className="mt-6 pt-5 border-t border-stone-200/80 text-[11px] text-stone-500 leading-relaxed">
              {showUpdateCitizenBox ? (
                <>
                  *Warga yang ingin memperbarui data keluarga mandiri tetap dapat mengisi formulir melalui tombol <strong>+ Mutakhirkan Data KK</strong> di atas tanpa memerlukan sandi.
                </>
              ) : (
                <>
                  *Kotak pemutakhiran data warga mandiri saat ini sedang <strong>ditutup oleh Pengurus RT 05</strong>.
                </>
              )}
            </div>
          </div>
        ) : (
          /* UNLOCKED: FULL CITIZEN DIRECTORY */
          <div className="animate-fadeIn space-y-6">
            {/* Unlocked banner */}
            <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block text-emerald-950 flex flex-wrap items-center gap-2">
                    <span>Akses Pengurus RT 05 Aktif ({citizens.length} KK Terdaftar)</span>
                    {isCloudAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                        <Cloud className="w-3 h-3 text-sky-700" />
                        <span>{isSyncingCloud ? 'Menyinkronkan Cloud...' : 'Cloud Firebase Tersinkron'}</span>
                      </span>
                    ) : onGoogleSignIn ? (
                      <button
                        type="button"
                        onClick={onGoogleSignIn}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 cursor-pointer"
                      >
                        <Cloud className="w-3 h-3 text-amber-700" />
                        <span>Hubungkan Google Cloud</span>
                      </button>
                    ) : null}
                  </span>
                  <span className="text-emerald-800 text-[11px]">
                    Anda dapat melihat data lengkap, foto KTP/KK, mengunduh PDF lengkap lampiran KTP & KK, atau mengunduh Excel (.xlsx).
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => handleDownloadAllPdf(filteredCitizens)}
                  disabled={filteredCitizens.length === 0 || isDownloadingAllPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer min-h-[38px] active:scale-95"
                  title="Unduh Rekap PDF A4 + Lampiran KTP & KK"
                >
                  <Download className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isDownloadingAllPdf ? 'Membuat PDF...' : `Download PDF + KTP/KK (${filteredCitizens.length} KK)`}</span>
                </button>
                <button
                  onClick={onExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-all cursor-pointer min-h-[38px] active:scale-95"
                  title="Unduh data dalam format Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-950 shrink-0" />
                  <span>Download Excel ({citizens.length} KK)</span>
                </button>
                <button
                  onClick={onLockPengurus}
                  className="px-2.5 py-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  Kunci
                </button>
              </div>
            </div>

            {onGoogleSignIn && onRestoreFromDrive && onNotify && (
              <GoogleDrivePanel
                citizens={citizens}
                driveAccessToken={driveAccessToken}
                cloudUserEmail={cloudUserEmail || null}
                onConnectGoogleDrive={onGoogleSignIn}
                onRestoreCitizens={onRestoreFromDrive}
                onNotify={onNotify}
              />
            )}

            {/* Filter & Search Bar */}
            <div className="bg-stone-50 p-3 sm:p-4 rounded-xl border border-stone-200 space-y-3">
              {/* Gang Selection Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
                  Gang:
                </span>
                <button
                  onClick={() => setSelectedGang('semua')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors min-h-[36px] ${
                    selectedGang === 'semua'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  Semua Gang ({citizens.length})
                </button>
                {GANG_LIST.map((g) => {
                  const count = citizens.filter((c) => c.gang === g).length;
                  return (
                    <button
                      key={g}
                      onClick={() => setSelectedGang(g)}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors min-h-[36px] ${
                        selectedGang === g
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      {g} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Secondary Filters & Search Box */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2 border-t border-stone-200">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama kepala keluarga, no. rumah, gang, atau NIK..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status KTP Dropdown */}
                  <select
                    value={selectedStatusKtp}
                    onChange={(e) => setSelectedStatusKtp(e.target.value)}
                    className="text-xs px-2.5 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  >
                    <option value="semua">Semua Status KTP</option>
                    <option value="tetap">KTP RT 05 (Warga Tetap)</option>
                    <option value="domisili">KTP Luar (Domisili)</option>
                  </select>

                  {/* Status Hunian Dropdown */}
                  <select
                    value={selectedStatusHunian}
                    onChange={(e) => setSelectedStatusHunian(e.target.value)}
                    className="text-xs px-2.5 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  >
                    <option value="semua">Semua Status Rumah</option>
                    <option value="Milik Sendiri">Milik Sendiri</option>
                    <option value="Kontrak / Sewa">Kontrak / Sewa</option>
                  </select>

                  {/* View mode toggle */}
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setViewMode('card')}
                      className={`px-2.5 py-2 text-xs font-semibold cursor-pointer ${
                        viewMode === 'card' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Kartu
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-2.5 py-2 text-xs font-semibold cursor-pointer ${
                        viewMode === 'table' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Tabel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State: If No Citizens Registered Yet (Addressing Requirement #1) */}
            {citizens.length === 0 ? (
              <div className="text-center py-14 sm:py-16 bg-white rounded-2xl border-2 border-dashed border-stone-300 p-6 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-stone-900 mx-auto flex items-center justify-center font-bold text-xl mb-3">
                  05
                </div>
                <h4 className="text-base sm:text-lg font-bold text-stone-900 mb-1">
                  Seluruh Data Contoh Telah Dikosongkan
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto mb-5 leading-relaxed">
                  Database warga RT 05 Blok E siap untuk penginputan data resmi baru. Silakan klik tombol di bawah untuk memasukkan data Kartu Keluarga (KK) pertama.
                </p>
                <button
                  onClick={onOpenAddCitizen}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer min-h-[46px]"
                >
                  <UserPlus className="w-4 h-4 text-stone-950" />
                  <span>+ Masukkan Data KK Baru Pertama</span>
                </button>
              </div>
            ) : filteredCitizens.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-stone-300 p-6">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <h4 className="text-base font-bold text-stone-800">
                  Tidak ada data warga yang cocok
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Periksa kata kunci pencarian atau ubah filter gang di atas.
                </p>
              </div>
            ) : viewMode === 'card' ? (
              /* Card View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCitizens.map((citizen) => {
                  const totalAnggota = citizen.anggotaKeluarga.length;
                  const jumlahLaki = citizen.anggotaKeluarga.filter((a) => a.jenisKelamin === 'L').length;
                  const jumlahPerempuan = citizen.anggotaKeluarga.filter((a) => a.jenisKelamin === 'P').length;

                  return (
                    <div
                      key={citizen.id}
                      className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Top gang & house number tag */}
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <Home className="w-3.5 h-3.5 text-amber-600" />
                            <span>{citizen.gang}</span>
                            <span aria-hidden="true" className="text-stone-300">·</span>
                            <span className="text-stone-900 font-extrabold">{citizen.nomorRumah}</span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              citizen.statusKtp.includes('Warga Tetap')
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {citizen.statusKtp.includes('Warga Tetap') ? 'Tetap' : 'Domisili'}
                          </span>
                        </div>

                        {/* Kepala Keluarga info */}
                        <div className="mt-3">
                          <div className="text-[10px] text-stone-400 font-medium uppercase">
                            Kepala Keluarga
                          </div>
                          <h4 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
                            {citizen.namaKepalaKeluarga}
                          </h4>
                          <div className="text-xs font-mono text-stone-500 mt-0.5">
                            KK: {citizen.nomorKk}
                          </div>
                        </div>

                        {/* Jiwa & details */}
                        <div className="mt-3 py-2 px-2.5 bg-stone-50 rounded-xl border border-stone-100 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-stone-400 block">Jumlah Jiwa:</span>
                            <span className="font-bold text-stone-800">
                              {totalAnggota} Orang ({jumlahLaki}L / {jumlahPerempuan}P)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block">Status Rumah:</span>
                            <span className="font-semibold text-stone-800">{citizen.statusHunian}</span>
                          </div>
                        </div>

                        {/* Vehicles and tags */}
                        <div className="mt-2.5 flex items-center justify-between text-xs text-stone-500">
                          <div className="flex items-center gap-2">
                            <Car className="w-3.5 h-3.5 text-stone-400" />
                            <span>Motor: {citizen.jumlahKendaraan?.motor ?? 0}</span>
                            <span>Mobil: {citizen.jumlahKendaraan?.mobil ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px]">
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold ${
                                citizen.fotoKtp ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                              }`}
                            >
                              KTP {citizen.fotoKtp ? '✓' : '-'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold ${
                                citizen.fotoKk ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                              }`}
                            >
                              KK {citizen.fotoKk ? '✓' : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenDetail(citizen)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer transition-colors min-h-[36px]"
                          >
                            <Eye className="w-3.5 h-3.5 text-stone-700" />
                            <span>Lihat KK</span>
                          </button>
                          <button
                            onClick={() => handleDownloadSinglePdf(citizen)}
                            disabled={downloadingPdfId === citizen.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 disabled:opacity-60 rounded-lg cursor-pointer transition-colors min-h-[36px]"
                            title="Download PDF Biodata + Lampiran KTP & KK"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-800" />
                            <span>{downloadingPdfId === citizen.id ? 'PDF...' : 'PDF'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenEdit(citizen)}
                            className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Edit Data Keluarga"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteCitizen(citizen.id, citizen.namaKepalaKeluarga)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Hapus Data Keluarga"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-900 text-white font-bold">
                      <th className="py-3 px-3.5">No</th>
                      <th className="py-3 px-3.5">Nama Kepala Keluarga</th>
                      <th className="py-3 px-3.5">Gang & No Rumah</th>
                      <th className="py-3 px-3.5">No. KK</th>
                      <th className="py-3 px-3.5">Jiwa</th>
                      <th className="py-3 px-3.5">Status KTP</th>
                      <th className="py-3 px-3.5">Rumah</th>
                      <th className="py-3 px-3.5">No. HP / WA</th>
                      <th className="py-3 px-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {filteredCitizens.map((citizen, idx) => (
                      <tr key={citizen.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3.5 font-mono text-stone-500">{idx + 1}</td>
                        <td className="py-3 px-3.5 font-bold text-stone-900">
                          {citizen.namaKepalaKeluarga}
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-amber-900">
                          {citizen.gang} ({citizen.nomorRumah})
                        </td>
                        <td className="py-3 px-3.5 font-mono text-stone-600">{citizen.nomorKk}</td>
                        <td className="py-3 px-3.5 font-bold text-stone-800">
                          {citizen.anggotaKeluarga.length} Jiwa
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              citizen.statusKtp.includes('Warga Tetap')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {citizen.statusKtp.includes('Warga Tetap') ? 'Tetap' : 'Domisili'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">{citizen.statusHunian}</td>
                        <td className="py-3 px-3.5 font-mono text-stone-700">{citizen.nomorHp}</td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onOpenDetail(citizen)}
                              className="px-2 py-1 text-[11px] font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded cursor-pointer"
                            >
                              Lihat
                            </button>
                            <button
                              onClick={() => handleDownloadSinglePdf(citizen)}
                              disabled={downloadingPdfId === citizen.id}
                              className="px-2 py-1 text-[11px] font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded cursor-pointer"
                              title="Download PDF + Lampiran KTP & KK"
                            >
                              {downloadingPdfId === citizen.id ? '...' : 'PDF'}
                            </button>
                            <button
                              onClick={() => onOpenEdit(citizen)}
                              className="p-1 text-stone-500 hover:text-amber-700 rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteCitizen(citizen.id, citizen.namaKepalaKeluarga)}
                              className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
