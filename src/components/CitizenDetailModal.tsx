import React from 'react';
import {
  X,
  Printer,
  Edit3,
  Phone,
  Home,
  Users,
  ShieldCheck,
  Car,
  Calendar,
  AlertCircle,
  FileText,
  Eye,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { DataKeluarga } from '../data/citizenData';
import {
  downloadCitizenPdfWithAttachments,
  downloadCitizensExcelWorkbook,
} from '../utils/citizenExport';

interface CitizenDetailModalProps {
  citizen: DataKeluarga | null;
  onClose: () => void;
  onEdit: (citizen: DataKeluarga) => void;
}

export const CitizenDetailModal: React.FC<CitizenDetailModalProps> = ({
  citizen,
  onClose,
  onEdit,
}) => {
  const [enlargedImage, setEnlargedImage] = React.useState<{ src: string; title: string } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  if (!citizen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadCitizenPdfWithAttachments(citizen);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadExcel = () => {
    const cleanName = (citizen.namaKepalaKeluarga || 'warga')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');
    downloadCitizensExcelWorkbook(
      [citizen],
      `data_kk_${cleanName}_rt05_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleWhatsApp = () => {
    const cleanPhone = citizen.nomorHp.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone;
    const text = encodeURIComponent(
      `Halo Bapak/Ibu ${citizen.namaKepalaKeluarga} (${citizen.gang} ${citizen.nomorRumah}), ini dari Pengurus RT 05 Blok E Perumahan Bumi Setia Insani mengenai pemutakhiran data warga.`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center sm:p-4 p-0 animate-fadeIn">
      <div className="relative bg-white sm:rounded-2xl rounded-none max-w-4xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shrink-0">
              05
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400 font-semibold leading-none">
                Data Kartu Keluarga (KK) Terverifikasi
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                Keluarga: {citizen.namaKepalaKeluarga}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg transition-colors cursor-pointer min-h-[38px]"
              title="Download PDF Biodata + Lampiran KTP & KK"
            >
              <Download className="w-3.5 h-3.5 text-stone-950" />
              <span>{isGeneratingPdf ? 'Menyiapkan PDF...' : 'PDF + KTP/KK'}</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer min-h-[38px]"
              title="Download Excel (.xlsx) Keluarga Ini"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-950" />
              <span>Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Cetak Biodata Keluarga"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(citizen);
              }}
              className="p-2 text-stone-300 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Edit Data Keluarga"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-stone-800">
          {/* Formal Kop RT */}
          <div className="text-center pb-4 border-b-2 border-stone-800">
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest">
              Rukun Tetangga 05 Blok E · Rukun Warga 12
            </div>
            <h3 className="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight mt-0.5 uppercase">
              Perumahan Bumi Setia Insani
            </h3>
            <p className="text-xs text-stone-600">
              Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi, Jawa Barat
            </p>
          </div>

          {/* Household Metadata Summary */}
          <div className="bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Nomor KK</span>
              <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm block">
                {citizen.nomorKk}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Alamat / Gang</span>
              <span className="font-bold text-amber-800 text-xs sm:text-sm block">
                {citizen.gang} · {citizen.nomorRumah}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Status Tempat Tinggal</span>
              <span className="font-semibold text-stone-800 block">
                {citizen.statusHunian} ({citizen.statusKtp})
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Kontak WhatsApp</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-stone-900">{citizen.nomorHp}</span>
                <button
                  onClick={handleWhatsApp}
                  className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                >
                  Chat WA
                </button>
              </div>
            </div>
          </div>

          {/* Table of Family Members (Jiwa) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Daftar Anggota Keluarga ({citizen.anggotaKeluarga.length} Jiwa)</span>
              </h4>
              <span className="text-xs text-stone-500">
                Update terakhir: {citizen.tanggalUpdate}
              </span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Hubungan</th>
                    <th className="py-2.5 px-3">L/P</th>
                    <th className="py-2.5 px-3">Usia</th>
                    <th className="py-2.5 px-3">Agama</th>
                    <th className="py-2.5 px-3">Pekerjaan</th>
                    <th className="py-2.5 px-3">BPJS</th>
                    <th className="py-2.5 px-3">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  {citizen.anggotaKeluarga.map((a, index) => (
                    <tr key={a.id} className="hover:bg-stone-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-500">{index + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">
                        {a.namaLengkap}
                        {a.nik && (
                          <span className="block font-mono text-[10px] text-stone-400 font-normal">
                            NIK: {a.nik}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium">{a.hubunganKeluarga}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-600">
                        {a.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{a.usia} Th</td>
                      <td className="py-2.5 px-3">{a.agama}</td>
                      <td className="py-2.5 px-3">{a.pekerjaan || '-'}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                            a.statusBpjs === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {a.statusBpjs}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {a.kategoriKhusus && a.kategoriKhusus.length > 0 ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                            {a.kategoriKhusus.join(', ')}
                          </span>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DOKUMEN LAMPIRAN (FOTO KTP & KARTU KELUARGA) - REQUESTED */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Dokumen Lampiran (KTP & Kartu Keluarga)</span>
            </h4>

            {citizen.fotoKtp || citizen.fotoKk ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {citizen.fotoKtp ? (
                  <div className="bg-white p-3 rounded-lg border border-stone-200">
                    <div className="text-[11px] font-bold text-stone-800 mb-2 flex items-center justify-between">
                      <span>Foto KTP Kepala Keluarga</span>
                      <button
                        onClick={() => setEnlargedImage({ src: citizen.fotoKtp!, title: `KTP: ${citizen.namaKepalaKeluarga}` })}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Perbesar</span>
                      </button>
                    </div>
                    <div
                      onClick={() => setEnlargedImage({ src: citizen.fotoKtp!, title: `KTP: ${citizen.namaKepalaKeluarga}` })}
                      className="cursor-pointer overflow-hidden rounded border border-stone-200 max-h-44 flex items-center justify-center bg-stone-100 hover:opacity-95"
                    >
                      <img
                        src={citizen.fotoKtp}
                        alt="KTP"
                        className="w-full h-36 object-cover object-center"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-lg border border-stone-200 text-stone-400 text-xs italic">
                    Belum ada foto KTP terunggah.
                  </div>
                )}

                {citizen.fotoKk ? (
                  <div className="bg-white p-3 rounded-lg border border-stone-200">
                    <div className="text-[11px] font-bold text-stone-800 mb-2 flex items-center justify-between">
                      <span>Foto Kartu Keluarga (KK)</span>
                      <button
                        onClick={() => setEnlargedImage({ src: citizen.fotoKk!, title: `KK No. ${citizen.nomorKk}` })}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Perbesar</span>
                      </button>
                    </div>
                    <div
                      onClick={() => setEnlargedImage({ src: citizen.fotoKk!, title: `KK No. ${citizen.nomorKk}` })}
                      className="cursor-pointer overflow-hidden rounded border border-stone-200 max-h-44 flex items-center justify-center bg-stone-100 hover:opacity-95"
                    >
                      <img
                        src={citizen.fotoKk}
                        alt="KK"
                        className="w-full h-36 object-cover object-center"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-lg border border-stone-200 text-stone-400 text-xs italic">
                    Belum ada foto KK terunggah.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-white rounded-lg border border-stone-200 text-stone-500 text-xs">
                Warga belum mengunggah foto KTP atau KK. Dokumen dapat diunggah saat mengedit data.
              </div>
            )}
          </div>

          {/* Additional details: Vehicles, Residency info, Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-[11px] font-bold text-stone-900 flex items-center gap-1.5 mb-2">
                <Car className="w-3.5 h-3.5 text-stone-600" />
                <span>Kendaraan Bermotor Warga</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span>Motor: <strong>{citizen.jumlahKendaraan?.motor ?? 0} Unit</strong></span>
                <span>Mobil: <strong>{citizen.jumlahKendaraan?.mobil ?? 0} Unit</strong></span>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Data ketertiban akses jalan dan parkir gang di RT 05 Blok E
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-[11px] font-bold text-stone-900 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Catatan & Keperluan Khusus</span>
              </div>
              <p className="text-xs text-stone-700">
                {citizen.catatanKhusus || 'Tidak ada catatan khusus untuk keluarga ini.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] text-stone-500">
            ID: <span className="font-mono">{citizen.id}</span> · Terdata di RT 05 Blok E
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-60 rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Download PDF (+ KTP & KK)'}</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-950" />
              <span>Download Excel</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(citizen);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-950" />
              <span>Perbarui Data Ini</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Enlarged Image Lightbox */}
      {enlargedImage && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden p-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-2">
              <span className="text-xs font-bold text-stone-900">{enlargedImage.title}</span>
              <button
                onClick={() => setEnlargedImage(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-stone-100 rounded-lg">
              <img
                src={enlargedImage.src}
                alt={enlargedImage.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
