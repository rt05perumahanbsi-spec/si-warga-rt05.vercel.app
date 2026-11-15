import React from 'react';
import { Candidate } from '../data/candidates';
import { VoteRecord } from '../data/votingState';
import { GANG_LIST, GangName } from '../data/gangList';
import {
  BarChart3,
  Vote,
  Trophy,
  Users,
  Printer,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface VoteRecapSectionProps {
  candidates: Candidate[];
  votes: VoteRecord[];
  onOpenBallot: () => void;
  onResetVotes: () => void;
}

export const VoteRecapSection: React.FC<VoteRecapSectionProps> = ({
  candidates,
  votes,
  onOpenBallot,
  onResetVotes,
}) => {
  const totalVotes = votes.length;

  // Calculate vote count and percentage per candidate
  const candidateStats = React.useMemo(() => {
    return candidates.map((c) => {
      const count = votes.filter((v) => v.calonId === c.id).length;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return {
        ...c,
        count,
        percentage,
      };
    }).sort((a, b) => b.count - a.count);
  }, [candidates, votes, totalVotes]);

  // Calculate votes per gang
  const gangStats = React.useMemo(() => {
    return GANG_LIST.map((gang) => {
      const count = votes.filter((v) => v.pemilihGang === gang).length;
      return {
        gang,
        count,
      };
    });
  }, [votes]);

  const leaderCandidate = candidateStats.length > 0 && totalVotes > 0 && candidateStats[0].count > 0
    ? candidateStats[0]
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="rekapitulasi-suara" className="py-10 sm:py-14 bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header split */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-amber-400 text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Real Count Digital RT 05 Blok E</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rekapitulasi Hasil Perhitungan Suara
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Pemilihan Calon Ketua RT 05 Blok E Perumahan Bumi Setia Insani, Desa Pahlawan Setia, Tarumajaya, Bekasi. Data diperbarui seketika setiap warga memasukkan surat suara digital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-end">
            <button
              onClick={onOpenBallot}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Vote className="w-4 h-4 text-stone-950" />
              <span>🗳️ Coblos di Kertas Suara</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors cursor-pointer min-h-[44px]"
              title="Cetak Berita Acara Rekapitulasi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Berita Acara</span>
            </button>

            {totalVotes > 0 && (
              <button
                onClick={onResetVotes}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-stone-400 hover:text-red-400 transition-colors cursor-pointer min-h-[44px]"
                title="Reset perhitungan suara (Panlih)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset Suara</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 bg-stone-800/80 rounded-2xl border border-stone-700/80">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Total Surat Suara Masuk</span>
              <Vote className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
              {totalVotes}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Surat suara sah tercatat di kotak suara digital
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-stone-800/80 rounded-2xl border border-stone-700/80">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Perolehan Suara Tertinggi</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            {leaderCandidate ? (
              <div>
                <div className="text-xl sm:text-2xl font-bold text-amber-400 truncate">
                  No. {leaderCandidate.nomorUrut} {leaderCandidate.namaPanggilan}
                </div>
                <div className="text-[11px] text-stone-300 font-mono mt-1">
                  {leaderCandidate.count} Suara ({leaderCandidate.percentage}%)
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold text-stone-400 mt-2">
                Belum ada suara masuk
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 bg-stone-800/80 rounded-2xl border border-stone-700/80">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Partisipasi Lingkungan</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              5 Gang Aktif
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Gg Utama, Bhineka, Damai, Walet, Jalak suren
            </div>
          </div>
        </div>

        {/* Perolehan Suara per Calon (Detailed Cards & Progress Bars) */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
            <span>Perolehan Suara Calon Ketua RT 05</span>
            <span className="font-normal text-stone-500">Urutan Berdasarkan Suara Terbanyak</span>
          </div>

          {candidateStats.length === 0 ? (
            <div className="p-6 bg-stone-800/50 rounded-2xl border border-stone-700 text-center text-xs text-stone-400">
              Belum ada calon yang didaftarkan ke sistem.
            </div>
          ) : (
            <div className="space-y-3">
              {candidateStats.map((c, index) => {
                const isLeader = leaderCandidate && leaderCandidate.id === c.id;

                return (
                  <div
                    key={c.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isLeader
                        ? 'bg-stone-800/90 border-amber-500/80 shadow-lg'
                        : 'bg-stone-800/50 border-stone-700/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 text-amber-400 font-mono font-bold text-base flex items-center justify-center shrink-0">
                          {c.nomorUrut}
                        </div>

                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-700 border border-stone-600 shrink-0 flex items-center justify-center">
                          {c.foto ? (
                            <img
                              src={c.foto}
                              alt={c.namaLengkap}
                              className="w-full h-full object-cover object-top"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="font-mono text-sm font-bold text-stone-400">{c.nomorUrut}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm sm:text-base leading-tight">
                              {c.namaLengkap}
                            </h4>
                            {isLeader && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-950 uppercase tracking-wide">
                                Teratas
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-400 mt-0.5">
                            "{c.namaPanggilan}" · {c.blok}
                          </div>
                        </div>
                      </div>

                      {/* Vote Count & Percent */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-700/60">
                        <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
                          {c.count} <span className="text-xs font-sans font-normal text-stone-300">Suara</span>
                        </div>
                        <div className="text-xs font-mono text-stone-400 tabular-nums">
                          {c.percentage}% dari total suara
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-700">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isLeader ? 'bg-amber-400' : 'bg-stone-400'
                        }`}
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Perolehan Suara Berdasarkan Gang RT 05 Blok E */}
        <div className="mt-10 pt-8 border-t border-stone-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
            Distribusi Partisipasi Pemilih per Gang (RT 05 Blok E)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {gangStats.map((item) => (
              <div
                key={item.gang}
                className="p-3.5 bg-stone-800/60 border border-stone-700/70 rounded-xl text-center"
              >
                <div className="text-xs font-bold text-amber-400">
                  {item.gang}
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                  {item.count}
                </div>
                <div className="text-[10px] text-stone-400">
                  Suara Masuk
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panitia Disclaimer & Neutrality */}
        <div className="mt-8 p-4 bg-stone-800/40 border border-stone-700/60 rounded-xl flex items-center gap-3 text-xs text-stone-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Perhitungan suara digital ini bersifat transparan, sah, dan langsung dapat dipantau seluruh warga RT 05 Blok E Perumahan Bumi Setia Insani.
          </span>
        </div>
      </div>
    </section>
  );
};
