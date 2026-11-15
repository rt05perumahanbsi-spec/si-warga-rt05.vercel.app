import React from 'react';
import { Candidate } from '../data/candidates';
import { GANG_LIST, GangName } from '../data/gangList';
import { VoteRecord } from '../data/votingState';
import {
  X,
  Vote,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Home,
  User,
  ArrowRight
} from 'lucide-react';

interface DigitalBallotModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onSubmitVote: (vote: Omit<VoteRecord, 'id' | 'waktu'>) => void;
  onViewRecap: () => void;
}

export const DigitalBallotModal: React.FC<DigitalBallotModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onSubmitVote,
  onViewRecap,
}) => {
  // Voter identity
  const [pemilihNama, setPemilihNama] = React.useState('');
  const [pemilihGang, setPemilihGang] = React.useState<GangName>('Gg Utama');
  const [nomorRumah, setNomorRumah] = React.useState('');
  
  // Selected candidate
  const [selectedCandidateId, setSelectedCandidateId] = React.useState<string | null>(null);
  
  // States
  const [hasVotedSuccess, setHasVotedSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  const handleCoblos = (id: string) => {
    setSelectedCandidateId(id);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pemilihNama.trim()) {
      setErrorMessage('Silakan isi Nama Kepala Keluarga / Pemilih terlebih dahulu!');
      return;
    }
    if (!nomorRumah.trim()) {
      setErrorMessage('Silakan isi Nomor Rumah tempat tinggal Anda!');
      return;
    }
    if (!selectedCandidateId || !selectedCandidate) {
      setErrorMessage('Silakan klik salah satu kotak calon pada kertas suara untuk mencoblos!');
      return;
    }

    onSubmitVote({
      pemilihNama: pemilihNama.trim(),
      pemilihGang,
      nomorRumah: nomorRumah.trim(),
      calonId: selectedCandidate.id,
      calonNomorUrut: selectedCandidate.nomorUrut,
      calonNama: selectedCandidate.namaLengkap,
    });

    setHasVotedSuccess(true);
  };

  const handleFinish = () => {
    setHasVotedSuccess(false);
    setSelectedCandidateId(null);
    setPemilihNama('');
    setNomorRumah('');
    onClose();
    onViewRecap();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        className="relative bg-stone-100 sm:rounded-3xl rounded-none max-w-4xl w-full h-full sm:h-auto sm:max-h-[94vh] flex flex-col shadow-2xl border border-stone-300 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ballot-title"
      >
        {/* Top Dark Header */}
        <div className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shrink-0">
              🗳️
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400 font-semibold leading-none">
                Bilik Suara Elektronik RT 05 Blok E
              </div>
              <h2 id="ballot-title" className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5">
                Surat Suara Digital Pemilihan Ketua RT 05
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup bilik suara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {hasVotedSuccess ? (
          <div className="p-6 sm:p-10 flex-1 flex flex-col items-center justify-center text-center bg-white space-y-5 animate-fadeIn">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
              ✓
            </div>
            <div className="max-w-md space-y-2">
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                Hak Suara Sah Berhasil Diberikan
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                Terima Kasih Atas Partisipasi Anda!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Suara dari <strong>{pemilihNama}</strong> ({pemilihGang} No. {nomorRumah}) telah sah dimasukkan ke dalam kotak suara digital RT 05 Blok E Perumahan Bumi Setia Insani.
              </p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl max-w-sm w-full text-xs text-stone-700 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <span className="font-bold block text-stone-900">Asas LUBER & JURDIL</span>
                <span>Pilihan Anda tercatat aman dan langsung menambah rekapitulasi real count.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 w-full sm:w-auto">
              <button
                onClick={handleFinish}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md cursor-pointer transition-all active:scale-95 min-h-[48px]"
              >
                <span>Lihat Rekapitulasi Hasil Suara Real Count</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 flex flex-col p-4 sm:p-6 space-y-6">
            {/* 1. Form Verifikasi Pemilih RT 05 Blok E */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 pb-1 border-b border-stone-100">
                <User className="w-4 h-4" />
                <span>1. Identitas Pemilih Warga RT 05 Blok E</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs sm:text-sm">
                <div className="sm:col-span-5">
                  <label className="block font-semibold text-stone-700 mb-1 text-xs">
                    Nama Kepala Keluarga / Pemilih *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Joko / Ibu Maya"
                    value={pemilihNama}
                    onChange={(e) => setPemilihNama(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-sm min-h-[44px]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-stone-700 mb-1 text-xs">
                    Pilih Gang di RT 05 Blok E *
                  </label>
                  <select
                    value={pemilihGang}
                    onChange={(e) => setPemilihGang(e.target.value as GangName)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-sm font-bold min-h-[44px]"
                  >
                    {GANG_LIST.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-stone-700 mb-1 text-xs">
                    Nomor Rumah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: No. 14"
                    value={nomorRumah}
                    onChange={(e) => setNomorRumah(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-sm min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 2. LEMBAR SURAT SUARA RESMI */}
            <div className="bg-[#FAF7EE] border-2 border-stone-400 p-4 sm:p-6 rounded-2xl shadow-md space-y-4 text-stone-900">
              {/* Kop Surat Suara */}
              <div className="text-center pb-3 border-b-2 border-stone-900 space-y-1">
                <div className="inline-block px-3 py-0.5 bg-stone-900 text-amber-300 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest rounded">
                  SURAT SUARA RESMI
                </div>
                <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-stone-950">
                  PEMILIHAN KETUA RUKUN TETANGGA (RT) 05 BLOK E
                </h3>
                <div className="text-[11px] sm:text-xs font-semibold text-stone-700 uppercase tracking-wide">
                  PERUMAHAN BUMI SETIA INSANI · DESA PAHLAWAN SETIA · KEC. TARUMAJAYA · KAB. BEKASI
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-stone-500">
                  PERIODE BAKTI 2026 - 2029 · ASAS LANGSUNG, UMUM, BEBAS, RAHASIA, JUJUR DAN ADIL
                </div>
              </div>

              {/* Petunjuk Coblos */}
              <div className="text-center text-xs text-stone-600 bg-amber-50/80 p-2 rounded-lg border border-amber-200/70">
                <strong>PETUNJUK:</strong> Klik atau sentuh salah satu kotak calon di bawah ini untuk mencoblos. Pilihan yang tercoblos akan ditandai dengan stempel dan lubang coblosan.
              </div>

              {/* Candidates Grid on Ballot Paper */}
              {candidates.length === 0 ? (
                <div className="p-8 text-center bg-white/80 rounded-xl border border-dashed border-stone-300 text-stone-500 text-xs">
                  Belum ada calon ketua RT yang didaftarkan. Silakan tutup bilik suara dan gunakan tombol "+ Masukkan Calon Baru" terlebih dahulu.
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${candidates.length === 2 ? 'sm:grid-cols-2' : candidates.length >= 3 ? 'sm:grid-cols-3' : ''} gap-4`}>
                  {candidates.map((c) => {
                    const isSelected = selectedCandidateId === c.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => handleCoblos(c.id)}
                        className={`relative bg-white rounded-xl border-2 transition-all cursor-pointer p-4 flex flex-col items-center text-center select-none ${
                          isSelected
                            ? 'border-red-600 ring-4 ring-red-100 shadow-lg scale-102 bg-red-50/20'
                            : 'border-stone-400 hover:border-stone-800 hover:shadow-sm'
                        }`}
                      >
                        {/* Coblos Punch Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-bounce">
                            <span>✓ TERCOBLOS</span>
                          </div>
                        )}

                        {/* Nomor Urut Besar */}
                        <div className="w-12 h-12 rounded-full border-2 border-stone-900 bg-stone-900 text-amber-400 font-mono font-black text-xl flex items-center justify-center mb-3">
                          {c.nomorUrut}
                        </div>

                        {/* Foto Calon */}
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 mb-3 flex items-center justify-center">
                          {c.foto ? (
                            <img
                              src={c.foto}
                              alt={c.namaLengkap}
                              className="w-full h-full object-cover object-top"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="font-mono font-bold text-2xl text-stone-500">
                              {c.nomorUrut}
                            </div>
                          )}

                          {/* Hole Punch Visual Effect */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-red-950/20 flex items-center justify-center backdrop-blur-2xs">
                              <div className="w-14 h-14 rounded-full border-3 border-dashed border-red-600 bg-red-100/80 flex items-center justify-center shadow-lg transform rotate-12">
                                <span className="text-red-700 font-black text-xs">COBLOS</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Nama Calon */}
                        <div className="font-extrabold text-stone-950 text-sm leading-tight">
                          {c.namaLengkap}
                        </div>
                        <div className="text-xs font-medium text-amber-800 mt-0.5">
                          "{c.namaPanggilan}"
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1">
                          {c.blok}
                        </div>

                        {/* Visual Button / Punch Area */}
                        <div
                          className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition-colors border ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-700'
                              : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          {isSelected ? '✓ Pilihan Anda' : 'Klik Disini Untuk Mencoblos'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected confirmation strip */}
            {selectedCandidate && (
              <div className="p-3.5 bg-amber-100/80 border border-amber-300 rounded-xl text-stone-900 text-xs sm:text-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Pilihan Anda:</span>
                  <span className="font-mono font-black text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded">
                    No. {selectedCandidate.nomorUrut}
                  </span>
                  <span className="font-semibold">{selectedCandidate.namaLengkap}</span>
                </div>
                <span className="text-[11px] text-stone-600 hidden sm:inline">
                  Siap dimasukkan ke kotak suara
                </span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky bottom-0 bg-stone-100 py-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 cursor-pointer min-h-[48px]"
              >
                Batalkan
              </button>

              <button
                type="submit"
                disabled={!selectedCandidateId || candidates.length === 0}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md active:scale-98 min-h-[48px] ${
                  selectedCandidateId && candidates.length > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-200'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <span>🗳️ Masukkan Surat Suara ke Kotak Suara Digital</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
