import React from 'react';
import { Candidate } from '../data/candidates';
import { ArrowLeftRight, UserPlus } from 'lucide-react';

interface CandidateComparisonProps {
  candidates: Candidate[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onOpenDetail: (candidate: Candidate) => void;
  onOpenAddCandidate: () => void;
}

export const CandidateComparison: React.FC<CandidateComparisonProps> = ({
  candidates,
  selectedIds,
  onToggleSelect,
  onOpenDetail,
  onOpenAddCandidate,
}) => {
  // If fewer than 2 candidates exist overall
  if (candidates.length < 2) {
    return (
      <section id="bandingkan" className="py-10 bg-stone-100/70 border-t border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1">
              Matriks Perbandingan Calon
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed">
              {candidates.length === 0
                ? 'Belum ada calon yang dimasukkan. Silakan daftarkan calon ketua RT baru untuk mulai membandingkan visi dan program.'
                : 'Saat ini baru ada 1 calon terdaftar. Masukkan minimal 2 calon ketua RT untuk melihat perbandingan berdampingan.'}
            </p>
            <button
              onClick={onOpenAddCandidate}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer min-h-[44px]"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>+ Masukkan Calon Ketua RT</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // If at least 2 selected, show selected; otherwise show all candidates
  const displayCandidates = selectedIds.length >= 2
    ? candidates.filter((c) => selectedIds.includes(c.id))
    : candidates;

  const comparisonRows = [
    {
      category: 'Profil & Domisili',
      title: 'Alamat & Profesi',
      render: (c: Candidate) => (
        <div>
          <div className="font-semibold text-stone-900">{c.blok}</div>
          <div className="text-stone-600 mt-0.5">{c.alamat}</div>
          {c.pekerjaan && <div className="text-stone-500 text-[11px] mt-0.5">{c.pekerjaan}</div>}
        </div>
      ),
    },
    {
      category: 'Visi Pokok',
      title: 'Arah Kepemimpinan',
      render: (c: Candidate) => (
        <p className="text-xs text-stone-700 italic leading-relaxed">
          "{c.visi}"
        </p>
      ),
    },
    {
      category: 'Program Kerja Prioritas',
      title: 'Rencana Nyata',
      render: (c: Candidate) => (
        <ul className="space-y-1.5 text-xs text-stone-700">
          {c.program100Hari.map((p, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="font-mono text-amber-700 font-bold shrink-0">{i + 1}.</span>
              <span><strong>{p.judul}</strong>{p.deskripsi ? `: ${p.deskripsi}` : ''}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      category: 'Misi Calon',
      title: 'Langkah Strategis',
      render: (c: Candidate) => (
        <ul className="space-y-1 text-xs text-stone-700">
          {c.misi.map((m, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-stone-400">·</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      category: 'Komitmen Integritas',
      title: 'Janji Transparansi',
      render: (c: Candidate) => (
        <ul className="space-y-1 text-xs text-emerald-800">
          {c.komitmenIntegritas.map((k, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span>✓</span>
              <span>{k}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      category: 'Kontak Aspirasi',
      title: 'Komunikasi Warga',
      render: (c: Candidate) => (
        <div className="text-xs">
          <div className="font-mono font-bold text-stone-900">{c.kontak.telepon}</div>
          <div className="text-stone-500 text-[11px]">{c.kontak.jamKonsultasi}</div>
        </div>
      ),
    },
  ];

  return (
    <section id="bandingkan" className="py-10 sm:py-12 bg-stone-100/70 border-t border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Matriks Perbandingan Objektif</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Bandingkan Calon Ketua RT 05 Blok E Perumahan Bumi Setia Insani
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Lihat secara berdampingan visi, misi, dan program para calon untuk menentukan pilihan terbaik bagi lingkungan RT 05 Blok E Bumi Setia Insani.
            </p>
          </div>

          {/* Candidate toggle selector buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-500 font-medium">Pilih calon:</span>
            {candidates.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => onToggleSelect(c.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border min-h-[36px] ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  No. {c.nomorUrut} {c.namaPanggilan}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white divide-x divide-stone-800">
                  <th className="p-3 sm:p-4 w-40 sm:w-56 text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-stone-400">
                    Parameter
                  </th>
                  {displayCandidates.map((c) => (
                    <th key={c.id} className="p-3 sm:p-4 min-w-[220px] sm:min-w-[260px] text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-800 shrink-0 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
                          {c.foto ? (
                            <img
                              src={c.foto}
                              alt={c.namaLengkap}
                              className="w-full h-full object-cover object-top"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            c.nomorUrut
                          )}
                        </div>
                        <div>
                          <div className="font-mono text-amber-400 font-bold text-xs">
                            No. Urut {c.nomorUrut}
                          </div>
                          <div className="font-bold text-white text-xs sm:text-sm leading-tight">
                            {c.namaPanggilan || c.namaLengkap}
                          </div>
                          <button
                            onClick={() => onOpenDetail(c)}
                            className="text-[11px] text-amber-300 hover:underline mt-0.5 inline-block cursor-pointer"
                          >
                            Lihat Detail →
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="divide-x divide-stone-200 hover:bg-stone-50/50">
                    <td className="p-3 sm:p-4 font-semibold text-stone-900 bg-stone-50/80 align-top">
                      <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">
                        {row.category}
                      </div>
                      <div className="mt-0.5 text-stone-800">{row.title}</div>
                    </td>
                    {displayCandidates.map((c) => (
                      <td key={c.id} className="p-3 sm:p-4 align-top text-stone-700 leading-relaxed">
                        {row.render(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
