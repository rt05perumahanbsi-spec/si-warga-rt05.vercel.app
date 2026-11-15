import React from 'react';
import {
  BarChart3,
  Users,
  Home,
  ShieldCheck,
  HeartPulse,
  Car,
  PieChart,
  Printer,
} from 'lucide-react';
import { GANG_LIST, GangName } from '../data/gangList';
import { DataKeluarga } from '../data/citizenData';
import type { CitizenStatsSummary } from '../utils/firestoreSync';

interface DemographicsSectionProps {
  citizens: DataKeluarga[];
  publicStats?: CitizenStatsSummary | null;
}

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({
  citizens,
  publicStats,
}) => {
  const usePublicSummary = Boolean(publicStats && publicStats.totalKk > citizens.length);
  const totalKk = usePublicSummary ? publicStats!.totalKk : citizens.length;
  const allAnggota = citizens.flatMap((c) => c.anggotaKeluarga);
  const totalJiwa = usePublicSummary ? publicStats!.totalJiwa : allAnggota.length;

  // Gang breakdown
  const gangStats = GANG_LIST.map((gang) => {
    const publicGang = usePublicSummary ? publicStats?.gangCounts?.[gang] : undefined;
    const kkInGang = citizens.filter((c) => c.gang === gang);
    const kkCount = publicGang ? publicGang.kkCount : kkInGang.length;
    const jiwaCount = publicGang
      ? publicGang.jiwaCount
      : kkInGang.reduce((acc, c) => acc + c.anggotaKeluarga.length, 0);
    const percentage = totalJiwa > 0 ? Math.round((jiwaCount / totalJiwa) * 100) : 0;
    return {
      gang,
      kkCount,
      jiwaCount,
      percentage,
    };
  });

  // Age breakdown
  const balitaCount = allAnggota.filter((a) => a.usia <= 5).length;
  const anakSekolahCount = allAnggota.filter((a) => a.usia >= 6 && a.usia <= 17).length;
  const produktifCount = allAnggota.filter((a) => a.usia >= 18 && a.usia <= 59).length;
  const lansiaCount = allAnggota.filter((a) => a.usia >= 60).length;

  // Gender breakdown
  const lakiCount = usePublicSummary
    ? publicStats!.totalLaki
    : allAnggota.filter((a) => a.jenisKelamin === 'L').length;
  const perempuanCount = usePublicSummary
    ? publicStats!.totalPerempuan
    : allAnggota.filter((a) => a.jenisKelamin === 'P').length;

  // BPJS breakdown
  const bpjsAktif = allAnggota.filter((a) => a.statusBpjs === 'Aktif').length;
  const bpjsTidakAktif = allAnggota.filter((a) => a.statusBpjs !== 'Aktif').length;

  // Vehicles
  const totalMotor = citizens.reduce((acc, c) => acc + (c.jumlahKendaraan?.motor || 0), 0);
  const totalMobil = citizens.reduce((acc, c) => acc + (c.jumlahKendaraan?.mobil || 0), 0);

  // Housing
  const milikSendiri = citizens.filter((c) => c.statusHunian === 'Milik Sendiri').length;
  const sewaKontrak = citizens.filter((c) => c.statusHunian !== 'Milik Sendiri').length;

  return (
    <section id="statistik-warga" className="py-10 sm:py-14 bg-stone-100/70 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistik & Demografi Kependudukan</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Rekapitulasi Data Warga RT 05 Blok E
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Distribusi jumlah keluarga dan warga di 6 gang resmi Perumahan Bumi Setia Insani (Gg Utama, Gg Bhineka, Gg Damai, Gg Walet, Gg Jalak suren, Gg Cendrawasih).
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-colors cursor-pointer self-start md:self-auto min-h-[40px]"
          >
            <Printer className="w-4 h-4 text-stone-700" />
            <span>Cetak Rekap Kependudukan</span>
          </button>
        </div>

        {/* 1. SEBARAN WARGA PER GANG */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs mb-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-600" />
              <span>Sebaran Warga & KK di 6 Gang Resmi RT 05 Blok E</span>
            </h3>
            <span className="text-xs font-mono font-bold text-stone-500">
              Total {totalKk} KK / {totalJiwa} Jiwa
            </span>
          </div>

          <div className="space-y-4">
            {gangStats.map((stat) => (
              <div key={stat.gang} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{stat.gang}</span>
                    {stat.gang === 'Gg Cendrawasih' && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-900 rounded">
                        Gang Baru
                      </span>
                    )}
                  </div>
                  <div className="text-right font-medium text-stone-600">
                    <span className="font-bold text-stone-900">{stat.kkCount} KK</span> ({stat.jiwaCount} Jiwa) ·{' '}
                    <span className="font-mono font-bold text-amber-800">{stat.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200/80">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(stat.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. DEMOGRAFI USIA, GENDER, BPJS, & KENDARAAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Usia */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Komposisi Usia</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">Balita (0 - 5 Th):</span>
                <span className="font-bold text-stone-900">{balitaCount} Jiwa</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">Usia Sekolah (6 - 17 Th):</span>
                <span className="font-bold text-stone-900">{anakSekolahCount} Jiwa</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">Produktif (18 - 59 Th):</span>
                <span className="font-bold text-stone-900">{produktifCount} Jiwa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Lansia (60+ Th):</span>
                <span className="font-bold text-amber-700">{lansiaCount} Jiwa</span>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              <span>Jenis Kelamin</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">Laki-laki:</span>
                <span className="font-bold text-stone-900">
                  {lakiCount} ({totalJiwa > 0 ? Math.round((lakiCount / totalJiwa) * 100) : 0}%)
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">Perempuan:</span>
                <span className="font-bold text-stone-900">
                  {perempuanCount} ({totalJiwa > 0 ? Math.round((perempuanCount / totalJiwa) * 100) : 0}%)
                </span>
              </div>
              <div className="text-[10px] text-stone-500 pt-1">
                Data acuan posyandu, ronda malam, dan kegiatan warga PKK RT 05.
              </div>
            </div>
          </div>

          {/* BPJS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Jaminan Kesehatan</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">BPJS Aktif:</span>
                <span className="font-bold text-emerald-700">{bpjsAktif} Jiwa</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">Belum / Tidak Aktif:</span>
                <span className="font-bold text-stone-800">{bpjsTidakAktif} Jiwa</span>
              </div>
              <div className="text-[10px] text-stone-500 pt-1">
                Prioritas pendampingan bantuan kesehatan dari pengurus RT.
              </div>
            </div>
          </div>

          {/* Kendaraan & Hunian */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" />
              <span>Hunian & Kendaraan</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">Rumah Milik Sendiri:</span>
                <span className="font-bold text-stone-900">{milikSendiri} KK</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-stone-100">
                <span className="text-stone-600">Kontrak / Sewa:</span>
                <span className="font-bold text-stone-900">{sewaKontrak} KK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Total Kendaraan:</span>
                <span className="font-bold text-stone-900">{totalMotor} Motor · {totalMobil} Mobil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
