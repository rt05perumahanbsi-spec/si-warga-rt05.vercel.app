import React from 'react';
import {
  UserPlus,
  ArrowDown,
  MapPin,
  ShieldCheck,
  Users,
  Home,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { DataKeluarga } from '../data/citizenData';
import type { CitizenStatsSummary } from '../utils/firestoreSync';

interface HeroSectionProps {
  onOpenAddCitizen: () => void;
  onScrollToCitizens: () => void;
  onOpenLetterService: () => void;
  onOpenWelcome?: () => void;
  citizens: DataKeluarga[];
  publicStats?: CitizenStatsSummary | null;
  showUpdateCitizenBox?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenAddCitizen,
  onScrollToCitizens,
  onOpenLetterService,
  onOpenWelcome,
  citizens,
  publicStats,
  showUpdateCitizenBox = true,
}) => {
  const usePublicSummary = Boolean(publicStats && publicStats.totalKk > citizens.length);
  const totalKk = usePublicSummary ? publicStats!.totalKk : citizens.length;
  const totalJiwa = usePublicSummary
    ? publicStats!.totalJiwa
    : citizens.reduce((acc, c) => acc + c.anggotaKeluarga.length, 0);
  const totalLaki = usePublicSummary
    ? publicStats!.totalLaki
    : citizens.reduce(
        (acc, c) => acc + c.anggotaKeluarga.filter((a) => a.jenisKelamin === 'L').length,
        0
      );
  const totalPerempuan = usePublicSummary
    ? publicStats!.totalPerempuan
    : citizens.reduce(
        (acc, c) => acc + c.anggotaKeluarga.filter((a) => a.jenisKelamin === 'P').length,
        0
      );
  const totalKtpRt05 = usePublicSummary
    ? publicStats!.totalKtpRt05
    : citizens.filter((c) => c.statusKtp.includes('Warga Tetap')).length;
  const totalDomisili = usePublicSummary
    ? publicStats!.totalDomisili
    : citizens.filter((c) => c.statusKtp.includes('Domisili')).length;

  return (
    <section id="beranda" className="relative bg-stone-900 text-stone-100 overflow-hidden">
      {/* Background with measured contrast scrim */}
      <div className="absolute inset-0">
        <img
          src="/src/assets/images/balai_warga_hero_1793623769912.jpg"
          alt="Lingkungan Perumahan Bumi Setia Insani"
          className="w-full h-full object-cover object-center opacity-25 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/90 to-stone-900/75" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
        {/* Geographic location kicker */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700/70 text-amber-400 text-xs font-semibold mb-4 backdrop-blur-xs">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>RT 05 Blok E Perumahan Bumi Setia Insani · Pahlawan Setia, Tarumajaya, Bekasi</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Pemutakhiran Data Warga & Keluarga RT 05 Blok E
        </h1>

        <p className="mt-3 sm:mt-4 text-xs sm:text-base text-stone-300 max-w-3xl leading-relaxed">
          Platform digital resmi pendataan Kartu Keluarga (KK) dan data kependudukan warga RT 05 Blok E
          (<strong>Gg Utama</strong>, <strong>Gg Bhineka</strong>, <strong>Gg Damai</strong>, <strong>Gg Walet</strong>, <strong>Gg Jalak suren</strong>, dan <strong>Gg Cendrawasih</strong>).
          Digunakan untuk validasi warga tetap & domisili, ketertiban lingkungan, dan percepatan pelayanan surat pengantar RT.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {showUpdateCitizenBox && (
            <button
              onClick={onOpenAddCitizen}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl shadow-lg transition-all cursor-pointer min-h-[46px]"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>+ Mutakhirkan Data KK Saya</span>
            </button>
          )}

          <button
            onClick={onScrollToCitizens}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-stone-200 hover:text-white bg-stone-800/90 hover:bg-stone-700 border border-stone-700 rounded-xl transition-all cursor-pointer min-h-[46px]"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Cari Data Warga / Rumah</span>
          </button>

          <button
            onClick={onOpenLetterService}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/40 rounded-xl transition-all cursor-pointer min-h-[46px]"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Surat Pengantar RT</span>
          </button>

          {onOpenWelcome && (
            <button
              onClick={onOpenWelcome}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 text-xs font-semibold text-stone-400 hover:text-stone-200 cursor-pointer min-h-[46px]"
            >
              <span>ℹ️ Petunjuk Pendataan</span>
            </button>
          )}
        </div>

        {/* Live Stat Metric Bar */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-stone-950/60 p-3 sm:p-4 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-400 font-medium">Total Kepala Keluarga</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
              {totalKk} <span className="text-xs font-sans text-stone-300 font-normal">KK</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Terdata di RT 05 Blok E</div>
          </div>

          <div className="bg-stone-950/60 p-3 sm:p-4 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-400 font-medium">Total Jiwa Terdaftar</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {totalJiwa} <span className="text-xs font-sans text-stone-300 font-normal">Jiwa</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              {totalLaki} Laki-laki · {totalPerempuan} Perempuan
            </div>
          </div>

          <div className="bg-stone-950/60 p-3 sm:p-4 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-400 font-medium">Wilayah Gang Resmi</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              6 <span className="text-xs font-sans text-stone-300 font-normal">Gang</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 truncate">
              Utama, Bhineka, Damai, Walet, Jalak suren, Cendrawasih
            </div>
          </div>

          <div className="bg-stone-950/60 p-3 sm:p-4 rounded-xl border border-stone-800">
            <div className="text-[11px] text-stone-400 font-medium">Status Domisili Warga</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {totalKtpRt05} <span className="text-xs font-sans text-stone-300 font-normal">Tetap</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              {totalDomisili} Warga Domisili / Kontrak
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
