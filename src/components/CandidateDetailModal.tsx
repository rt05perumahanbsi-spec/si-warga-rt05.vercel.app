import React from 'react';
import { Candidate } from '../data/candidates';
import {
  X,
  CheckCircle,
  Clock,
  Phone,
  Home,
  Briefcase,
  FileCheck,
  MessageSquare,
  User
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onAskCandidate: (candidate: Candidate) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onAskCandidate,
}) => {
  const [activeTab, setActiveTab] = React.useState<'visi-misi' | 'program' | 'integritas'>('visi-misi');

  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        className="relative bg-white sm:rounded-2xl rounded-none max-w-3xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-name"
      >
        {/* Modal Top Header */}
        <div className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400">
              {candidate.nomorUrut}
            </span>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-400 font-semibold">
                Calon Ketua RT 005 Perumahan Bumi Setia Insani
              </div>
              <h2 id="candidate-name" className="text-base sm:text-lg font-bold text-white truncate max-w-[220px] sm:max-w-md">
                {candidate.namaLengkap}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup jendela profil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Summary Strip */}
        <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 shrink-0">
          <div className="flex flex-row gap-4 items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shadow-xs shrink-0 flex items-center justify-center">
              {candidate.foto ? (
                <img
                  src={candidate.foto}
                  alt={candidate.namaLengkap}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="font-mono text-xl font-bold text-stone-700">
                  {candidate.nomorUrut}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {candidate.tagline && (
                <div className="text-xs sm:text-sm font-semibold text-stone-900 italic line-clamp-2">
                  "{candidate.tagline}"
                </div>
              )}
              {candidate.ringkasan && (
                <p className="text-[11px] sm:text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                  {candidate.ringkasan}
                </p>
              )}

              {/* Unboxed metadata row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{candidate.blok} {candidate.alamat ? `· ${candidate.alamat}` : ''}</span>
                </span>
                {candidate.usia && (
                  <span>· {candidate.usia} Th</span>
                )}
                {candidate.pekerjaan && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{candidate.pekerjaan}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 border-b border-stone-200 bg-white shrink-0">
          <div className="flex space-x-6 overflow-x-auto no-scrollbar text-xs font-semibold">
            <button
              onClick={() => setActiveTab('visi-misi')}
              className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'visi-misi'
                  ? 'border-stone-900 text-stone-950 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Visi & Misi
            </button>
            <button
              onClick={() => setActiveTab('program')}
              className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'program'
                  ? 'border-stone-900 text-stone-950 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Program Kerja
            </button>
            <button
              onClick={() => setActiveTab('integritas')}
              className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'integritas'
                  ? 'border-stone-900 text-stone-950 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Komitmen & Kontak
            </button>
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm text-stone-800">
          {/* TAB 1: VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                  Visi Calon
                </h3>
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-stone-900 font-medium leading-relaxed text-xs sm:text-sm">
                  "{candidate.visi}"
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Langkah & Butir Misi
                </h3>
                <div className="space-y-2">
                  {candidate.misi.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="font-mono text-xs font-bold text-stone-400 mt-0.5 shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROGRAM KERJA */}
          {activeTab === 'program' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Program Kerja Unggulan
              </h3>
              <div className="space-y-3">
                {candidate.program100Hari.map((prog, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">
                      Program {idx + 1} {prog.targetWaktu ? `· ${prog.targetWaktu}` : ''}
                    </div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm mb-1">
                      {prog.judul}
                    </h4>
                    {prog.deskripsi && (
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {prog.deskripsi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRITAS & KONTAK */}
          {activeTab === 'integritas' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  Komitmen & Janji Calon
                </h3>
                <div className="space-y-2">
                  {candidate.komitmenIntegritas.map((poin, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs sm:text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-stone-800 leading-relaxed font-medium">
                        {poin}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Kontak Aspirasi Warga
                </h3>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="text-stone-500 block text-[11px]">Nomor WhatsApp</span>
                      <span className="font-bold text-stone-900 font-mono">{candidate.kontak.telepon}</span>
                    </div>
                  </div>
                  {candidate.kontak.telepon && candidate.kontak.telepon !== '0812-0000-0000' && (
                    <a
                      href={`https://wa.me/${candidate.kontak.telepon.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold min-h-[36px] flex items-center"
                    >
                      Hubungi WA
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onAskCandidate(candidate);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tanya ke {candidate.namaPanggilan}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-xl transition-colors cursor-pointer min-h-[44px]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
