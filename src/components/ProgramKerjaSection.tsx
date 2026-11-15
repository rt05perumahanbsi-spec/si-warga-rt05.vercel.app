import React from 'react';
import {
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Send,
  MapPin,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Camera,
  Trash2,
  Waves,
  Signpost,
  Plus,
} from 'lucide-react';
import { ProgramKerjaItem, INITIAL_PROGRAM_KERJA } from '../data/programKerja';
import { GANG_LIST } from '../data/gangList';

interface ProgramKerjaSectionProps {
  programs: ProgramKerjaItem[];
  onUpvoteProgram: (programId: string) => void;
  onAddFeedback: (programId: string, feedback: { namaWarga: string; gang: string; pesan: string }) => void;
}

export const ProgramKerjaSection: React.FC<ProgramKerjaSectionProps> = ({
  programs,
  onUpvoteProgram,
  onAddFeedback,
}) => {
  const [activeFeedbackId, setActiveFeedbackId] = React.useState<string | null>(null);
  const [namaWarga, setNamaWarga] = React.useState('');
  const [gangWarga, setGangWarga] = React.useState('Gg Utama');
  const [pesan, setPesan] = React.useState('');
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);

  const getProgramIcon = (nomorUrut: number) => {
    switch (nomorUrut) {
      case 1:
        return <Camera className="w-5 h-5 text-amber-500" />;
      case 2:
        return <Signpost className="w-5 h-5 text-amber-500" />;
      case 3:
        return <Trash2 className="w-5 h-5 text-amber-500" />;
      case 4:
        return <Waves className="w-5 h-5 text-amber-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-amber-500" />;
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent, programId: string) => {
    e.preventDefault();
    if (!namaWarga.trim() || !pesan.trim()) return;

    onAddFeedback(programId, {
      namaWarga: namaWarga.trim(),
      gang: gangWarga,
      pesan: pesan.trim(),
    });

    setPesan('');
    setFeedbackSuccess(programId);
    setTimeout(() => {
      setFeedbackSuccess(null);
      setActiveFeedbackId(null);
    }, 2500);
  };

  return (
    <section id="program-kerja" className="py-10 sm:py-14 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Rencana Awal Kepengurusan RT 05</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              4 Program Kerja Prioritas RT 05 Blok E
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Rencana aksi nyata Pengurus RT 05 Blok E Perumahan Bumi Setia Insani untuk meningkatkan keamanan, kebersihan, kerapian nama gang, dan pencegahan banjir saluran air got.
            </p>
          </div>

          <div className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-xl p-3 max-w-xs">
            <span className="font-bold text-stone-900 block">Keterbukaan & Partisipasi:</span>
            Warga dapat memberikan dukungan jempol serta menuliskan saran langsung pada tiap program.
          </div>
        </div>

        {/* 4 Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((prog) => {
            const isFeedbackOpen = activeFeedbackId === prog.id;

            return (
              <div
                key={prog.id}
                className="bg-stone-50 rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors"
              >
                <div>
                  {/* Card Top: Number, Category, Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        {prog.nomorUrut < 10 ? `0${prog.nomorUrut}` : prog.nomorUrut}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">
                          {prog.kategori}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
                          {prog.judul}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-900 rounded-md border border-amber-200 shrink-0">
                      {prog.status}
                    </span>
                  </div>

                  {/* Program Description */}
                  <p className="mt-3.5 text-xs text-stone-700 leading-relaxed">
                    {prog.ringkasan}
                  </p>

                  {/* Detail Bullet Points */}
                  <div className="mt-4 p-3 bg-white rounded-xl border border-stone-200/80 space-y-1.5">
                    <div className="text-[11px] font-bold text-stone-900">Rencana Pelaksanaan:</div>
                    <ul className="space-y-1 text-xs text-stone-600 pl-1">
                      {prog.detailRencana.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata Row: Penanggung Jawab & Lokasi */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-start gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span><strong>PIC:</strong> {prog.penanggungJawab}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span><strong>Lokasi:</strong> {prog.lokasi}</span>
                    </div>
                  </div>

                  {/* Existing Citizen Feedbacks */}
                  {prog.masukanWarga.length > 0 && (
                    <div className="mt-4 space-y-2 pt-3 border-t border-stone-200/80">
                      <div className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-700" />
                        <span>Masukan Warga ({prog.masukanWarga.length}):</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {prog.masukanWarga.map((m) => (
                          <div key={m.id} className="p-2.5 bg-white rounded-lg border border-stone-200 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-stone-500 mb-0.5">
                              <span className="font-bold text-stone-800">{m.namaWarga} ({m.gang})</span>
                              <span>{m.tanggal}</span>
                            </div>
                            <p className="text-stone-700 italic">"{m.pesan}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback Form Modal/Toggle */}
                  {isFeedbackOpen && (
                    <form
                      onSubmit={(e) => handleFeedbackSubmit(e, prog.id)}
                      className="mt-3.5 p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs space-y-2.5 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          Tulis Saran untuk "{prog.judul}"
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveFeedbackId(null)}
                          className="text-stone-400 hover:text-stone-700 p-0.5"
                        >
                          ✕
                        </button>
                      </div>

                      {feedbackSuccess === prog.id ? (
                        <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Terima kasih! Saran Anda telah diterima pengurus RT.</span>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Nama Anda / KK"
                              value={namaWarga}
                              onChange={(e) => setNamaWarga(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg min-h-[36px]"
                            />
                            <select
                              value={gangWarga}
                              onChange={(e) => setGangWarga(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg min-h-[36px]"
                            >
                              {GANG_LIST.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>

                          <textarea
                            required
                            rows={2}
                            placeholder="Tuliskan masukan, ide, atau titik lokasi yang perlu diperhatikan..."
                            value={pesan}
                            onChange={(e) => setPesan(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg"
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveFeedbackId(null)}
                              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Kirim Masukan</span>
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  )}
                </div>

                {/* Card Bottom: Upvote Button & Add Feedback Button */}
                <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onUpvoteProgram(prog.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs min-h-[40px]"
                    title="Dukung program kerja ini"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dukung Program</span>
                    <span className="font-mono font-black text-amber-900 ml-1">
                      ({prog.jumlahDukungan})
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveFeedbackId(isFeedbackOpen ? null : prog.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer min-h-[40px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                    <span>{isFeedbackOpen ? 'Tutup Masukan' : '+ Beri Saran'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
