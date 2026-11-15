import React from 'react';
import { X, Lock, Unlock, KeyRound, ShieldAlert, CheckCircle2, FileSpreadsheet, Download, ArrowRight, Cloud, LogOut, Eye, EyeOff } from 'lucide-react';

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  citizenCount?: number;
  onNavigateToCitizens?: () => void;
  cloudUserEmail?: string | null;
  isCloudAdmin?: boolean;
  onGoogleSignIn?: () => Promise<void> | void;
  onGoogleSignOut?: () => Promise<void> | void;
  isAuthLoading?: boolean;
  showUpdateCitizenBox?: boolean;
  onToggleUpdateCitizenBox?: () => void;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  onUnlock,
  onLock,
  onExportCsv,
  onExportPdf,
  citizenCount = 0,
  onNavigateToCitizens,
  cloudUserEmail,
  isCloudAdmin,
  onGoogleSignIn,
  onGoogleSignOut,
  isAuthLoading,
  showUpdateCitizenBox = true,
  onToggleUpdateCitizenBox,
}) => {
  const [password, setPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Masukkan sandi pengurus terlebih dahulu!');
      return;
    }

    const success = onUnlock(password.trim());
    if (success) {
      setPassword('');
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg('Sandi salah! Akses khusus Ketua RT & Pengurus RT 05.');
    }
  };

  const handleLockNow = () => {
    onLock();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs">
              05
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-800">
                Keamanan Data Warga
              </div>
              <h3 className="text-sm font-bold text-stone-900 leading-tight">
                {isUnlocked ? 'Mode Pengurus Aktif' : 'Masuk Sandi Pengurus'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isUnlocked ? (
          <div className="pt-4 space-y-3.5">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Akses Pengurus RT 05 Aktif.</strong> Anda memiliki wewenang untuk melihat seluruh data warga ({citizenCount} KK), memeriksa foto KTP/KK, dan mengunduh laporan Excel.
              </div>
            </div>

            {onToggleUpdateCitizenBox && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-stone-800">Kotak Mutakhirkan Data KK</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      showUpdateCitizenBox
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {showUpdateCitizenBox ? 'Muncul (Terbuka)' : 'Ditutup'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onToggleUpdateCitizenBox}
                  className={`w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px] ${
                    showUpdateCitizenBox
                      ? 'bg-stone-200 hover:bg-stone-300 text-stone-900'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                  }`}
                >
                  {showUpdateCitizenBox ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 shrink-0" />
                      <span>Tutup Kotak Mutakhirkan Data</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>Munculkan Kotak Mutakhirkan Data</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {cloudUserEmail ? (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-2 text-[11px] text-sky-900">
                <div className="min-w-0">
                  <div className="font-bold flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{isCloudAdmin ? 'Cloud Firebase Admin Aktif' : 'Terhubung Google Cloud'}</span>
                  </div>
                  <div className="truncate text-sky-700 mt-0.5">{cloudUserEmail}</div>
                </div>
                {onGoogleSignOut && (
                  <button
                    onClick={onGoogleSignOut}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-sky-900 bg-white border border-sky-300 hover:bg-sky-100 rounded-lg cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Keluar</span>
                  </button>
                )}
              </div>
            ) : (
              onGoogleSignIn && (
                <button
                  onClick={onGoogleSignIn}
                  disabled={isAuthLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl transition-all cursor-pointer min-h-[44px]"
                >
                  <Cloud className="w-4 h-4 text-sky-700 shrink-0" />
                  <span>{isAuthLoading ? 'Menghubungkan...' : 'Hubungkan Google (Sinkron Cloud Firebase)'}</span>
                </button>
              )
            )}

            {onExportPdf && (
              <button
                onClick={() => {
                  onExportPdf();
                }}
                disabled={citizenCount === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl transition-all cursor-pointer min-h-[46px] shadow-xs active:scale-95"
              >
                <Download className="w-4 h-4 text-stone-950 shrink-0" />
                <span>Download PDF + KTP/KK ({citizenCount} KK)</span>
              </button>
            )}

            {onExportCsv && (
              <button
                onClick={() => {
                  onExportCsv();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer min-h-[46px] shadow-xs active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-950 shrink-0" />
                <span>Download Laporan Excel ({citizenCount} KK)</span>
              </button>
            )}

            {onNavigateToCitizens && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCitizens();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                <span>Buka Tabel / Kartu Data Warga</span>
                <ArrowRight className="w-4 h-4 text-stone-600" />
              </button>
            )}

            <button
              onClick={handleLockNow}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all cursor-pointer min-h-[44px]"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Kunci Akses Pengurus Kembali</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-3.5">
            <p className="text-xs text-stone-600 leading-relaxed">
              Masukkan sandi keamanan atau masuk dengan akun Google Pengurus RT untuk membuka direktori & penyimpanan Cloud Firebase RT 05 Blok E.
            </p>

            {onGoogleSignIn && (
              <button
                type="button"
                onClick={async () => {
                  await onGoogleSignIn();
                }}
                disabled={isAuthLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                <Cloud className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isAuthLoading
                    ? 'Memeriksa Akun...'
                    : cloudUserEmail
                      ? `Terhubung: ${cloudUserEmail}`
                      : 'Masuk dengan Google (Cloud Firebase)'}
                </span>
              </button>
            )}

            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Sandi Pengurus..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 min-h-[44px]"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer min-h-[44px]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs cursor-pointer min-h-[44px]"
              >
                <Unlock className="w-4 h-4 text-stone-950" />
                <span>Buka Akses</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
