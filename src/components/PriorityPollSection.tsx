import React from 'react';
import { INITIAL_PRIORITIES, PriorityIssue } from '../data/priorityPoll';
import { BarChart3, CheckCircle, Vote, Sparkles } from 'lucide-react';

export const PriorityPollSection: React.FC = () => {
  const [priorities, setPriorities] = React.useState<PriorityIssue[]>(INITIAL_PRIORITIES);
  const [votedId, setVotedId] = React.useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = React.useState<string>('p-1');

  const totalVotes = React.useMemo(() => {
    return priorities.reduce((sum, p) => sum + p.suara, 0);
  }, [priorities]);

  const handleVote = () => {
    if (votedId) return;
    setPriorities((prev) =>
      prev.map((item) =>
        item.id === selectedIssueId ? { ...item, suara: item.suara + 1 } : item
      )
    );
    setVotedId(selectedIssueId);
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-stone-800 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between pb-8 border-b border-stone-800">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Suara Warga</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Jajak Pendapat: Isu Paling Mendesak di RT 04
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                Hasil survei terbuka ini menjadi acuan utama bagi calon Ketua RT terpilih untuk menyusun program prioritas 100 hari pertama masa baktinya.
              </p>
            </div>

            <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 text-center shrink-0">
              <span className="text-xs text-stone-400 block">Total Partisipasi Suara Warga</span>
              <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                {totalVotes}
              </span>
              <span className="text-[11px] text-stone-400 block mt-0.5">Responden Terverifikasi</span>
            </div>
          </div>

          {/* Poll Choices and Live Progress Bars */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Interactive Vote Selection */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Pilih Isu yang Menurut Anda Paling Krusial:
              </h3>

              {priorities.map((item) => (
                <label
                  key={item.id}
                  className={`block p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedIssueId === item.id
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-stone-800/50 border-stone-700/70 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="priority-poll"
                      value={item.id}
                      checked={selectedIssueId === item.id}
                      onChange={() => setSelectedIssueId(item.id)}
                      disabled={votedId !== null}
                      className="mt-1 accent-amber-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-white leading-snug">
                        {item.judul}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {item.deskripsi}
                      </div>
                    </div>
                  </div>
                </label>
              ))}

              <div className="pt-2">
                {votedId ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Terima kasih! Suara aspirasi Anda telah direkam dalam rekapitulasi RT.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleVote}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-md active:scale-98"
                  >
                    <Vote className="w-4 h-4 text-stone-950" />
                    <span>Kirim Suara Aspirasi Saya</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Live Aggregated Results */}
            <div className="lg:col-span-7 bg-stone-900/90 p-5 sm:p-6 rounded-xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-stone-800">
                <span className="font-semibold text-stone-300">Hasil Rekapitulasi Suara Real-Time</span>
                <span>Persentase Dukungan</span>
              </div>

              {priorities.map((item) => {
                const percentage = Math.round((item.suara / totalVotes) * 100) || 0;
                const isUserChoice = votedId === item.id;

                return (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                        {item.judul}
                        {isUserChoice && (
                          <span className="text-[10px] text-amber-400 font-normal">
                            (Pilihan Anda)
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-stone-400 tabular-nums">
                        {percentage}% ({item.suara} Suara)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 rounded-full ${
                          isUserChoice ? 'bg-amber-400' : 'bg-stone-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
