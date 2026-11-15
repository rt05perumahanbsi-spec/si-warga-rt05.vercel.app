import React from 'react';
import {
  UserPlus,
  Menu,
  X,
  Users,
  BarChart3,
  FileText,
  Info,
  Award,
  Lock,
  Unlock,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

interface NavbarProps {
  onOpenAddCitizen: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  citizenCount: number;
  totalJiwa: number;
  onOpenWelcome?: () => void;
  onOpenLetterService?: () => void;
  isPengurusUnlocked: boolean;
  onToggleLock: () => void;
  onExportCsv?: () => void;
  showUpdateCitizenBox?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddCitizen,
  activeSection,
  onNavigate,
  citizenCount,
  totalJiwa,
  onOpenWelcome,
  onOpenLetterService,
  isPengurusUnlocked,
  onToggleLock,
  onExportCsv,
  showUpdateCitizenBox = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { id: 'daftar-warga', label: `Data KK (${citizenCount})`, icon: Users },
    { id: 'program-kerja', label: 'Program Kerja', icon: Sparkles },
    { id: 'struktur-organisasi', label: 'Struktur Pengurus RT', icon: Award },
    { id: 'statistik-warga', label: 'Statistik Warga', icon: BarChart3 },
    { id: 'layanan-surat', label: 'Layanan Pengantar RT', icon: FileText },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-18">
          {/* Brand wordmark */}
          <a
            href="#beranda"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('beranda');
            }}
            className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-stone-700 transition-colors"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-xs">
              05
            </div>
            <div className="flex flex-col">
              <span className="leading-tight font-extrabold text-stone-900 text-xs sm:text-base">
                SI-WARGA 05 · RT 05 BLOK E
              </span>
              <span className="text-[10px] text-stone-500 font-medium hidden sm:block leading-none mt-0.5">
                Perumahan Bumi Setia Insani · Tarumajaya, Bekasi
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-600">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 ${
                    activeSection === link.id
                      ? 'text-stone-950 font-bold border-b-2 border-amber-500'
                      : 'hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-stone-500" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Lock / Unlock Toggle Button */}
            <button
              onClick={onToggleLock}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer min-h-[38px] ${
                isPengurusUnlocked
                  ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
              }`}
              title={
                isPengurusUnlocked
                  ? 'Akses Pengurus Aktif (Klik untuk mengunci)'
                  : 'Akses Pengurus Terkunci (Klik untuk memasukkan sandi rt05jaya)'
              }
            >
              {isPengurusUnlocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Pengurus Terbuka</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Akses Pengurus</span>
                </>
              )}
            </button>

            {isPengurusUnlocked && onExportCsv && (
              <button
                onClick={onExportCsv}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer min-h-[38px] active:scale-95"
                title="Download Seluruh Data Warga ke Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-950 shrink-0" />
                <span>Excel</span>
              </button>
            )}

            {onOpenLetterService && (
              <button
                onClick={onOpenLetterService}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors cursor-pointer min-h-[40px]"
                title="Buat Surat Pengantar RT"
              >
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span>Surat Pengantar</span>
              </button>
            )}

            {showUpdateCitizenBox && (
              <button
                onClick={onOpenAddCitizen}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer min-h-[40px] sm:min-h-[44px]"
              >
                <UserPlus className="w-4 h-4 text-stone-950 shrink-0" />
                <span className="hidden sm:inline">+ Mutakhirkan Data KK</span>
                <span className="sm:hidden">+ Data KK</span>
              </button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200 space-y-3 animate-fadeIn">
            <div className="px-2 py-1.5 bg-amber-50 rounded-xl border border-amber-200/60 mb-2 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-900">
                  SI-WARGA 05 · RT 05 Blok E Bumi Setia Insani
                </div>
                <div className="text-[10px] text-amber-800">
                  {citizenCount} KK Terdata · {totalJiwa} Jiwa Terdaftar
                </div>
              </div>
              <button
                onClick={() => {
                  onToggleLock();
                  setMobileMenuOpen(false);
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  isPengurusUnlocked
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-stone-200 text-stone-800'
                }`}
              >
                {isPengurusUnlocked ? '🔓 Terbuka' : '🔒 Masuk Sandi'}
              </button>
            </div>

            {isPengurusUnlocked && onExportCsv && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onExportCsv();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer min-h-[44px] shadow-xs active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-950" />
                <span>📥 Download Data Warga (Excel / CSV)</span>
              </button>
            )}

            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    className={`flex items-center gap-2.5 text-left px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                      activeSection === link.id
                        ? 'bg-stone-900 text-white font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span>{link.label}</span>
                  </button>
                );
              })}

              {onOpenLetterService && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLetterService();
                  }}
                  className="flex items-center gap-2.5 text-left px-3 py-2.5 text-xs font-semibold text-stone-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Buat Surat Pengantar RT</span>
                </button>
              )}

              {onOpenWelcome && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWelcome();
                  }}
                  className="flex items-center gap-2.5 text-left px-3 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                >
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Info Pemutakhiran Data</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 px-3">
              6 Gang Resmi: Gg Utama, Gg Bhineka, Gg Damai, Gg Walet, Gg Jalak suren, Gg Cendrawasih
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
