import React from 'react';
import { Candidate } from '../data/candidates';
import {
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  UserCheck,
  Home,
  Edit3,
  Trash2,
  User
} from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onSelectDetail: (candidate: Candidate) => void;
  onSelectCompare: (candidate: Candidate) => void;
  isCompared: boolean;
  onAskCandidate: (candidate: Candidate) => void;
  onEditCandidate?: (candidate: Candidate) => void;
  onDeleteCandidate?: (candidateId: string, candidateName: string) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onSelectDetail,
  onSelectCompare,
  isCompared,
  onAskCandidate,
  onEditCandidate,
  onDeleteCandidate,
}) => {
  return (
    <article className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
      {/* Top Banner / Number Urut Bar */}
      <div className="bg-stone-900 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xl sm:text-2xl font-black text-amber-400">
            {candidate.nomorUrut}
          </span>
          <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-stone-300">
            Nomor Urut Calon
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onEditCandidate && (
            <button
              onClick={() => onEditCandidate(candidate)}
              className="p-2 text-stone-300 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Edit data calon"
              aria-label="Edit data calon"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {onDeleteCandidate && (
            <button
              onClick={() => onDeleteCandidate(candidate.id, candidate.namaLengkap)}
              className="p-2 text-stone-300 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Hapus calon"
              aria-label="Hapus calon"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-xs text-stone-300 pl-2 border-l border-stone-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terdaftar</span>
          </div>
        </div>
      </div>

      {/* Main Candidate Card Body */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {/* Profile Split: Image + Essential Info */}
        <div className="flex flex-row gap-3.5 sm:gap-5 items-start">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
            {candidate.foto ? (
              <img
                src={candidate.foto}
                alt={candidate.namaLengkap}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 text-amber-400 flex flex-col items-center justify-center font-mono font-bold text-lg sm:text-2xl">
                <span>{candidate.nomorUrut}</span>
                <span className="text-[10px] text-stone-300 font-sans font-normal mt-0.5">Calon RT</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-snug">
              {candidate.namaLengkap}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-amber-700 mt-0.5">
              "{candidate.namaPanggilan}"
            </p>

            {/* Unboxed metadata with typographic separators (anti-slop rule §1.A) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600 mt-2">
              <span>{candidate.usia} Th</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                <Home className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">{candidate.blok}</span>
              </span>
              {candidate.lamaTinggal && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span>{candidate.lamaTinggal}</span>
                </>
              )}
            </div>

            {candidate.pekerjaan && (
              <div className="text-[11px] sm:text-xs text-stone-500 mt-1 line-clamp-1">
                {candidate.pekerjaan}
              </div>
            )}
          </div>
        </div>

        {/* Tagline Quote */}
        {candidate.tagline && (
          <div className="mt-4 pt-3 border-t border-stone-100">
            <p className="text-xs sm:text-sm font-medium text-stone-800 italic leading-snug">
              "{candidate.tagline}"
            </p>
          </div>
        )}

        {/* Visi Ringkas */}
        <div className="mt-3">
          <div className="text-[10px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Visi Utama Calon
          </div>
          <p className="text-xs sm:text-sm text-stone-700 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {candidate.visi}
          </p>
        </div>

        {/* Program Unggulan Cuplikan */}
        {candidate.program100Hari.length > 0 && candidate.program100Hari[0].judul && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <div className="text-[10px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Program Kerja Prioritas
            </div>
            <ul className="space-y-1 text-xs text-stone-700">
              {candidate.program100Hari.slice(0, 2).map((prog, idx) => (
                <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                  <span className="font-mono text-stone-400 font-bold shrink-0">{idx + 1}.</span>
                  <span className="truncate">{prog.judul}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Controls - Mobile Touch Optimized (>= 44px) */}
        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={() => onSelectDetail(candidate)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer min-h-[44px]"
          >
            <span>Lihat Profil Penuh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectCompare(candidate)}
            className={`px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer border min-h-[44px] flex items-center justify-center ${
              isCompared
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
            title="Bandingkan calon ini"
          >
            {isCompared ? '✓ Terpilih' : '+ Bandingkan'}
          </button>

          <button
            onClick={() => onAskCandidate(candidate)}
            className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={`Tanya ke ${candidate.namaPanggilan}`}
            aria-label={`Tanya ke ${candidate.namaPanggilan}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
