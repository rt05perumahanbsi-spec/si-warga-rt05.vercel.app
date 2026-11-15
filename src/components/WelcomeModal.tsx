import React from 'react';
import { X, HeartHandshake, ShieldCheck, Check, ArrowRight, UserPlus, Home } from 'lucide-react';
import { GANG_LIST } from '../data/gangList';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddCitizen: () => void;
  showUpdateCitizenBox?: boolean;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onOpenAddCitizen,
  showUpdateCitizenBox = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        {/* Modal Top Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shrink-0">
              05
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400 font-semibold leading-none">
                Sosialisasi & Petunjuk Pendataan
              </div>
              <h2 id="welcome-title" className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                Pemutakhiran Data Warga RT 05 Blok E
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup sambutan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Sambutan Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed flex-1">
          {/* Greeting Box */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl text-amber-950 font-semibold text-xs sm:text-sm">
            Assalamu’alaikum Warahmatullahi Wabarakatuh,
            <span className="block mt-0.5 font-normal text-stone-700">
              Salam Sejahtera bagi Kita Semua. Salam Hangat untuk Seluruh Warga RT 05 Blok E Perumahan Bumi Setia Insani.
            </span>
          </div>

          <p>
            Puji dan syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa. Selamat datang di <strong>Sistem Aplikasi Pemutakhiran Data Warga & Keluarga RT 05 Blok E Perumahan Bumi Setia Insani</strong>, Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi.
          </p>

          <p>
            Aplikasi ini dibuat secara khusus untuk mendata ulang dan memperbarui informasi seluruh keluarga yang berdomisili di 6 gang resmi RT 05 Blok E:
          </p>

          {/* List of 6 Gangs */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
            <div className="text-[11px] font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-amber-600" />
              <span>Cakupan 6 Gang Resmi RT 05 Blok E:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {GANG_LIST.map((g) => (
                <div key={g} className="flex items-center gap-1.5 text-stone-800 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-stone-900">Manfaat Utama Pemutakhiran Data:</div>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pendataan Warga Tetap & Domisili:</strong> Mengetahui jumlah pasti kepala keluarga dan jiwa yang menetap, baik yang ber-KTP RT 05 maupun ber-KTP luar (domisili/sewa).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Upload Dokumen KTP & KK:</strong> Warga kini dapat langsung melampirkan foto dokumen KTP dan Kartu Keluarga untuk verifikasi data kependudukan oleh pengurus RT.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>4 Program Kerja Prioritas:</strong> Ketahui & beri masukan untuk rencana pengadaan CCTV, perbaikan nama gang, penggantian tempat sampah rusak, dan tanggul saluran got.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Layanan Surat Pengantar RT Instan:</strong> Warga terdata dapat langsung membuat surat pengantar domisili, KTP/KK, dan SKU tanpa repot.</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3 text-stone-700">
            <HeartHandshake className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Kerahasiaan data warga dijaga dengan baik hanya untuk keperluan administrasi internal RT 05 Blok E. Mari bersama-sama wujudkan lingkungan yang aman, tertib, transparan, dan guyub rukun.
            </p>
          </div>

          <div className="pt-2 text-right">
            <p className="font-bold text-stone-900 text-xs sm:text-sm">
              Pengurus Rukun Tetangga (RT) 05 Blok E
            </p>
            <p className="text-[11px] text-stone-500">
              Perumahan Bumi Setia Insani · Pahlawan Setia · Tarumajaya · Bekasi
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          {showUpdateCitizenBox && (
            <button
              onClick={() => {
                onClose();
                onOpenAddCitizen();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>+ Mutakhirkan Data KK Saya</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="sm:ml-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-xl shadow-xs transition-all cursor-pointer min-h-[44px]"
          >
            <span>Masuk ke Halaman Utama</span>
            <ArrowRight className="w-4 h-4 text-stone-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
