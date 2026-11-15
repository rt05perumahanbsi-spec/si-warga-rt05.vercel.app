import React from 'react';
import {
  FileText,
  Clock,
  Printer,
  Plus,
  Download,
  Eye,
  X,
  Lock,
  ShieldCheck,
  KeyRound,
  MessageCircle,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { DataKeluarga, PermohonanSurat } from '../data/citizenData';
import { downloadSuratPdf, printSuratDocument } from '../utils/suratGenerator';

interface ServiceRequestSectionProps {
  requests: PermohonanSurat[];
  onOpenNewRequest: () => void;
  isPengurusUnlocked: boolean;
  onOpenSecurityModal: () => void;
  citizens?: DataKeluarga[];
  onUpdateLetterStatus?: (letterId: string, status: PermohonanSurat['status']) => void;
  onWhatsappSent?: (letterId: string, phone: string) => void;
  updatingLetterId?: string | null;
  waFallbackByLetter?: Record<string, string>;
}

function buildFallbackWaUrl(req: PermohonanSurat, phone?: string): string | null {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  const normalized = digits.startsWith('0')
    ? `62${digits.slice(1)}`
    : digits.startsWith('8')
    ? `62${digits}`
    : digits;
  if (!normalized || normalized.length < 9) return null;

  const msg = [
    `Assalamu'alaikum / Salam Sejahtera *${req.namaPemohon}*,`,
    ``,
    `Permohonan *${req.jenisSurat}* Anda (No. Surat: ${req.nomorSurat || '-'} · ${req.gang} ${req.nomorRumah}) telah berstatus *SELESAI* diproses oleh Pengurus RT 05 Blok E / RW 12 Perumahan Bumi Setia Insani.`,
    ``,
    `Silakan ambil atau unduh surat resmi Anda melalui Pengurus RT 05 Blok E. Terima kasih.`,
  ].join('\n');

  return `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`;
}

export const ServiceRequestSection: React.FC<ServiceRequestSectionProps> = ({
  requests,
  onOpenNewRequest,
  isPengurusUnlocked,
  onOpenSecurityModal,
  citizens = [],
  onUpdateLetterStatus,
  onWhatsappSent,
  updatingLetterId = null,
  waFallbackByLetter = {},
}) => {
  const [selectedSurat, setSelectedSurat] = React.useState<PermohonanSurat | null>(null);

  return (
    <section id="layanan-surat" className="py-10 sm:py-14 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Pelayanan Warga Mandiri</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Layanan Surat Pengantar RT 05 Blok E
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Warga yang telah memutakhirkan datanya dapat membuat dan mengunduh surat pengantar RT resmi berformat PDF A4 secara instan untuk berbagai keperluan administrasi kependudukan.
            </p>
          </div>

          <button
            onClick={onOpenNewRequest}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all cursor-pointer self-start md:self-auto min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-stone-950" />
            <span>+ Buat Surat Pengantar Baru</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h4 className="text-sm font-bold text-stone-900 mb-1">Keterangan Domisili</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Untuk keperluan perbankan, lamaran kerja, atau pendaftaran sekolah anak yang memerlukan bukti tempat tinggal resmi di RT 05 Blok E.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h4 className="text-sm font-bold text-stone-900 mb-1">Pengantar KTP & KK</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pengantar resmi untuk pembuatan KTP-el baru, perpanjangan, atau perubahan data kartu keluarga ke kantor Desa Pahlawan Setia Tarumajaya.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h4 className="text-sm font-bold text-stone-900 mb-1">Keterangan Usaha / SKU</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Surat pengantar untuk warga yang memiliki usaha rumahan / UMKM di lingkungan RT 05 Blok E untuk pengajuan izin atau permodalan usaha.
            </p>
          </div>
        </div>

        {/* Recent Letter Requests / History Section */}
        {isPengurusUnlocked ? (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Riwayat & Arsip Surat Pengantar (Akses Pengurus RT)</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sandi RT Terbuka</span>
                </span>
                <span className="text-[11px] font-bold text-stone-600 bg-stone-200/80 px-2 py-1 rounded-md">
                  Total: {requests.length} Surat
                </span>
              </div>
            </div>

            {requests.length > 0 ? (
              <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <th className="py-2.5 px-3">No. Surat</th>
                      <th className="py-2.5 px-3">Nama & No. WA Pemohon</th>
                      <th className="py-2.5 px-3">Alamat Gang</th>
                      <th className="py-2.5 px-3">Jenis Surat</th>
                      <th className="py-2.5 px-3">Keperluan</th>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3 text-center">Status & Notif WA</th>
                      <th className="py-2.5 px-3 text-center">Download PDF A4 & Cetak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {requests.map((req) => {
                      const matchedCitizen = citizens.find((c) => c.id === req.keluargaId);
                      const phone = req.nomorHpPemohon || matchedCitizen?.nomorHp || '';
                      const fallbackWaUrl =
                        waFallbackByLetter[req.id] || buildFallbackWaUrl(req, phone);
                      const isUpdating = updatingLetterId === req.id;

                      const statusColor =
                        req.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : req.status === 'Disetujui RT'
                          ? 'bg-sky-50 text-sky-900 border-sky-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300';

                      return (
                        <tr key={req.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-stone-600">
                            {req.nomorSurat || '-'}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-stone-900">{req.namaPemohon}</div>
                            {phone && (
                              <div className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-500 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{phone}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-stone-700">
                            {req.gang} {req.nomorRumah}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-amber-900">{req.jenisSurat}</td>
                          <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate">{req.keperluan}</td>
                          <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                            {req.tanggalPengajuan}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {onUpdateLetterStatus ? (
                                <select
                                  value={req.status}
                                  disabled={isUpdating}
                                  onChange={(e) =>
                                    onUpdateLetterStatus(
                                      req.id,
                                      e.target.value as PermohonanSurat['status']
                                    )
                                  }
                                  aria-label={`Ubah status surat ${req.namaPemohon}`}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer disabled:opacity-60 ${statusColor}`}
                                >
                                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                                  <option value="Disetujui RT">Disetujui RT</option>
                                  <option value="Selesai">Selesai</option>
                                </select>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                                  {req.status}
                                </span>
                              )}

                              {isUpdating && (
                                <span className="text-[10px] text-amber-700 font-semibold">
                                  Mengirim notif WA...
                                </span>
                              )}

                              {!isUpdating && req.whatsappNotificationStatus && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                                  <span>{req.whatsappNotificationStatus}</span>
                                </span>
                              )}

                              {!isUpdating && req.status === 'Selesai' && fallbackWaUrl && (
                                <a
                                  href={fallbackWaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => onWhatsappSent?.(req.id, phone)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors"
                                  title="Kirim Notifikasi WhatsApp ke Pemohon"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-700" />
                                  <span>Kirim WA</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => downloadSuratPdf(req)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg cursor-pointer transition-colors shadow-2xs active:scale-95"
                                title="Download Surat Resmi Format PDF A4"
                              >
                                <Download className="w-3 h-3 text-emerald-950" />
                                <span>PDF A4</span>
                              </button>
                              <button
                                onClick={() => printSuratDocument(req)}
                                className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg cursor-pointer transition-colors"
                                title="Cetak atau Simpan PDF"
                              >
                                <Printer className="w-3 h-3 text-stone-600" />
                                <span className="hidden sm:inline">Cetak</span>
                              </button>
                              <button
                                onClick={() => setSelectedSurat(req)}
                                className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                                title="Lihat Pratinjau Surat"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500 text-xs bg-white rounded-xl border border-stone-200">
                <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="font-semibold text-stone-700">Belum ada riwayat pengajuan surat masuk</p>
                <p className="text-stone-500 mt-0.5">
                  Setiap pengajuan surat baru yang diajukan oleh warga akan tersimpan rapi dalam arsip pengurus ini.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Locked State for General Citizens */
          <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-md">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-400 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Riwayat Pengajuan Surat Terproteksi Pengurus RT
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Demi menjaga privasi kependudukan warga RT 05 Blok E, seluruh daftar riwayat dan arsip permohonan surat hanya dapat diakses oleh Ketua RT & Pengurus RT 05.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenSecurityModal}
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-md active:scale-95 transition-all min-h-[44px]"
                >
                  <KeyRound className="w-4 h-4 text-stone-950" />
                  <span>Buka Riwayat Surat (Akses Pengurus RT)</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-400 pt-1">
                Warga tetap dapat membuat surat baru dengan menekan tombol <strong>"+ Buat Surat Pengantar Baru"</strong> di atas.
              </p>
            </div>
          </div>
        )}

        {/* Modal Pratinjau & Download Surat Terpilih */}
        {selectedSurat && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
              <div className="bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs sm:text-sm">
                    {selectedSurat.jenisSurat} — {selectedSurat.namaPemohon}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSurat(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-serif text-xs sm:text-sm text-stone-900 space-y-3">
                <div className="text-center pb-2 border-b-2 border-stone-900 font-sans">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-stone-600">
                    RUKUN TETANGGA 05 BLOK E / RW 12
                  </div>
                  <div className="text-sm font-black uppercase text-stone-950">
                    PERUMAHAN BUMI SETIA INSANI
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi
                  </div>
                </div>

                <div className="text-center pt-2">
                  <div className="font-bold underline uppercase text-xs sm:text-sm">
                    {selectedSurat.jenisSurat}
                  </div>
                  <div className="text-[11px] font-sans text-stone-500">
                    Nomor: {selectedSurat.nomorSurat || '470/.../RT.05-BSI/2026'}
                  </div>
                </div>

                <p className="pt-2 leading-relaxed">
                  Menerangkan dengan sebenarnya bahwa warga atas nama:
                </p>

                <div className="pl-4 font-sans text-xs space-y-1">
                  <div><strong>Nama:</strong> {selectedSurat.namaPemohon}</div>
                  {selectedSurat.nikPemohon && <div><strong>NIK:</strong> {selectedSurat.nikPemohon}</div>}
                  <div><strong>Alamat:</strong> {selectedSurat.gang}, Nomor {selectedSurat.nomorRumah}, RT 05 Blok E</div>
                  <div><strong>Perumahan:</strong> Bumi Setia Insani, Pahlawan Setia, Tarumajaya, Bekasi</div>
                </div>

                <p className="pt-2 leading-relaxed">
                  Adalah benar warga bertempat tinggal di lingkungan kami dan surat pengantar ini diberikan untuk keperluan:
                </p>

                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded font-sans font-bold text-stone-900">
                  "{selectedSurat.keperluan}"
                </div>

                <div className="pt-4 flex justify-between items-end font-sans text-xs text-center">
                  <div>
                    <div>Pemohon,</div>
                    <div className="h-12" />
                    <div className="font-bold underline">({selectedSurat.namaPemohon})</div>
                  </div>
                  <div>
                    <div>Bekasi, {selectedSurat.tanggalPengajuan}</div>
                    <div>Ketua RT 05 Blok E,</div>
                    <div className="h-12 flex items-center justify-center text-[10px] text-stone-400 italic">
                      (Cap & TTD)
                    </div>
                    <div className="font-bold underline">Arif Wahyudi</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-end gap-2 font-sans">
                <button
                  onClick={() => downloadSuratPdf(selectedSurat)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl cursor-pointer shadow-xs active:scale-95 min-h-[40px]"
                >
                  <Download className="w-4 h-4 text-emerald-950" />
                  <span>Download PDF (Format A4)</span>
                </button>
                <button
                  onClick={() => printSuratDocument(selectedSurat)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer min-h-[40px]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setSelectedSurat(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer min-h-[40px]"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
