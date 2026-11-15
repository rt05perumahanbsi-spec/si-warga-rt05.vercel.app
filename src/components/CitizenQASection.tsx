import React from 'react';
import { CitizenQuestion } from '../data/citizenQuestions';
import { Candidate } from '../data/candidates';
import { GANG_LIST } from '../data/gangList';
import { MessageSquare, ThumbsUp, Send, CheckCircle, Plus } from 'lucide-react';

interface CitizenQASectionProps {
  questions: CitizenQuestion[];
  candidates: Candidate[];
  onAddQuestion: (newQuestion: Omit<CitizenQuestion, 'id' | 'tanggal' | 'jumlahDukungan' | 'jawabanCalon'>) => void;
  onUpvoteQuestion: (questionId: string) => void;
  selectedCandidateFilter: string;
  onFilterChange: (filter: string) => void;
  focusCandidateForQuestion?: Candidate | null;
}

export const CitizenQASection: React.FC<CitizenQASectionProps> = ({
  questions,
  candidates,
  onAddQuestion,
  onUpvoteQuestion,
  selectedCandidateFilter,
  onFilterChange,
  focusCandidateForQuestion,
}) => {
  const [showForm, setShowForm] = React.useState(false);
  const [penanyaNama, setPenanyaNama] = React.useState('');
  const [penanyaBlok, setPenanyaBlok] = React.useState('Gg Utama');
  const [topik, setTopik] = React.useState('Keamanan & Ketertiban');
  const [pertanyaan, setPertanyaan] = React.useState('');
  const [ditujukanUntuk, setDitujukanUntuk] = React.useState<string>('semua');
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // When focusCandidateForQuestion changes, open form and set target
  React.useEffect(() => {
    if (focusCandidateForQuestion) {
      setDitujukanUntuk(focusCandidateForQuestion.id);
      setShowForm(true);
    }
  }, [focusCandidateForQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!penanyaNama.trim() || !pertanyaan.trim()) return;

    onAddQuestion({
      penanyaNama: penanyaNama.trim(),
      penanyaBlok: penanyaBlok.trim() || 'Warga RT 005',
      topik,
      pertanyaan: pertanyaan.trim(),
      ditujukanUntuk,
    });

    setPertanyaan('');
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowForm(false);
    }, 2500);
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedCandidateFilter === 'semua') return true;
    return q.ditujukanUntuk === 'semua' || q.ditujukanUntuk === selectedCandidateFilter;
  });

  return (
    <section id="aspirasi-warga" className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Aspirasi Warga RT 005</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Tanya Jawab Terbuka Calon & Suara Warga
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Warga Perumahan Bumi Setia Insani dapat menyampaikan aspirasi, saran, dan pertanyaan terbuka secara langsung ke para calon.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-all cursor-pointer self-stretch sm:self-auto min-h-[44px]"
          >
            <Send className="w-4 h-4 text-amber-400" />
            <span>{showForm ? 'Tutup Formulir' : '+ Sampaikan Aspirasi Warga'}</span>
          </button>
        </div>

        {/* Question Submission Form */}
        {showForm && (
          <div className="mb-6 p-4 sm:p-6 bg-stone-50 border border-stone-200 rounded-2xl shadow-xs animate-fadeIn">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1">
              Ajukan Pertanyaan / Aspirasi untuk Calon RT 005
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Aspirasi Anda akan tampil terbuka di portal pemilihan untuk diketahui seluruh warga.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Terima kasih! Aspirasi Anda berhasil dimuat ke forum publik RT 005.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Warga / Keluarga *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pak Anton"
                      value={penanyaNama}
                      onChange={(e) => setPenanyaNama(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2.5 bg-white border border-stone-300 rounded-lg min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Gang di RT 05 Blok E *
                    </label>
                    <select
                      value={penanyaBlok}
                      onChange={(e) => setPenanyaBlok(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-bold min-h-[44px]"
                    >
                      {GANG_LIST.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Ditujukan Kepada
                    </label>
                    <select
                      value={ditujukanUntuk}
                      onChange={(e) => setDitujukanUntuk(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2.5 bg-white border border-stone-300 rounded-lg min-h-[44px]"
                    >
                      <option value="semua">Semua Calon (Terbuka)</option>
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          No. {c.nomorUrut} - {c.namaPanggilan || c.namaLengkap}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Kategori Isu
                    </label>
                    <select
                      value={topik}
                      onChange={(e) => setTopik(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2.5 bg-white border border-stone-300 rounded-lg min-h-[44px]"
                    >
                      <option value="Keamanan & Ketertiban">Keamanan & Portal Masuk</option>
                      <option value="Transparansi Kas & Iuran">Transparansi Kas & Iuran</option>
                      <option value="Sampah & Kebersihan Selokan">Sampah & Kebersihan</option>
                      <option value="Guyub Rukun & Sosial">Sosial & Guyub Warga</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Isi Aspirasi / Pertanyaan *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Tuliskan aspirasi atau pertanyaan Anda..."
                      value={pertanyaan}
                      onChange={(e) => setPertanyaan(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 min-h-[44px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl min-h-[44px]"
                  >
                    Kirim Aspirasi
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Candidate Filter pills */}
        {candidates.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-4 text-xs">
            <button
              onClick={() => onFilterChange('semua')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer min-h-[36px] ${
                selectedCandidateFilter === 'semua'
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Semua ({questions.length})
            </button>
            {candidates.map((c) => (
              <button
                key={c.id}
                onClick={() => onFilterChange(c.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer min-h-[36px] ${
                  selectedCandidateFilter === c.id
                    ? 'bg-stone-900 text-white font-bold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                No. {c.nomorUrut} ({c.namaPanggilan})
              </button>
            ))}
          </div>
        )}

        {/* List of Questions */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-4 sm:p-5 bg-stone-50 border border-stone-200 rounded-2xl shadow-xs"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-stone-200/60">
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="font-bold text-stone-900">{q.penanyaNama}</span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span>{q.penanyaBlok}</span>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded self-start sm:self-auto">
                  {q.topik}
                </span>
              </div>

              {/* Question Content */}
              <p className="mt-2 text-xs sm:text-sm font-medium text-stone-900 leading-relaxed">
                "{q.pertanyaan}"
              </p>

              {/* Upvote button */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onUpvoteQuestion(q.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer active:scale-95 min-h-[36px]"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dukung</span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    ({q.jumlahDukungan})
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
