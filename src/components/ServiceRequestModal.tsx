import React from 'react';
import {
  X,
  FileText,
  Printer,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Download,
} from 'lucide-react';
import { GANG_LIST, GangName } from '../data/gangList';
import { DataKeluarga, PermohonanSurat } from '../data/citizenData';
import {
  downloadSuratPdf,
  downloadSuratFile,
  printSuratDocument,
} from '../utils/suratGenerator';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizens: DataKeluarga[];
  onSubmitRequest: (request: PermohonanSurat) => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  citizens,
  onSubmitRequest,
}) => {
  const [selectedKkId, setSelectedKkId] = React.useState<string>(citizens[0]?.id || '');
  const [namaPemohon, setNamaPemohon] = React.useState('');
  const [nikPemohon, setNikPemohon] = React.useState('');
  const [nomorHpPemohon, setNomorHpPemohon] = React.useState('');
  const [gang, setGang] = React.useState<GangName>('Gg Utama');
  const [nomorRumah, setNomorRumah] = React.useState('');
  const [jenisSurat, setJenisSurat] = React.useState<PermohonanSurat['jenisSurat']>(
    'Surat Keterangan Domisili'
  );
  const [keperluan, setKeperluan] = React.useState('');
  const [keteranganTambahan, setKeteranganTambahan] = React.useState('');

  const [previewMode, setPreviewMode] = React.useState(false);
  const [successSubmitted, setSuccessSubmitted] = React.useState(false);
  const [createdSurat, setCreatedSurat] = React.useState<PermohonanSurat | null>(null);

  // Sync fields when selected KK changes
  React.useEffect(() => {
    const foundKk = citizens.find((c) => c.id === selectedKkId);
    if (foundKk) {
      setNamaPemohon(foundKk.namaKepalaKeluarga);
      setNikPemohon(foundKk.anggotaKeluarga[0]?.nik || '');
      setNomorHpPemohon(foundKk.nomorHp || '');
      setGang(foundKk.gang);
      setNomorRumah(foundKk.nomorRumah);
    }
  }, [selectedKkId, citizens]);

  if (!isOpen) return null;

  const currentSuratData = {
    nomorSurat: createdSurat?.nomorSurat || `470/${Math.floor(100 + Math.random() * 900)}/RT.005-BSI/${new Date().getFullYear()}`,
    namaPemohon: namaPemohon.trim() || 'Warga RT 05',
    nikPemohon: nikPemohon.trim(),
    gang,
    nomorRumah: nomorRumah.trim(),
    jenisSurat,
    keperluan: keperluan.trim(),
    tanggalPengajuan: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    keteranganTambahan: keteranganTambahan.trim(),
  };

  const handleDownloadCurrentPdf = () => {
    downloadSuratPdf(createdSurat || currentSuratData);
  };

  const handleDownloadCurrentSurat = () => {
    downloadSuratFile(createdSurat || currentSuratData);
  };

  const handlePrintDraft = () => {
    printSuratDocument(createdSurat || currentSuratData);
  };

  const waRequestText = encodeURIComponent(
    `Assalamu'alaikum Pengurus RT 05 Blok E Perumahan Bumi Setia Insani, saya ${namaPemohon} (${gang} ${nomorRumah}) ingin mengajukan ${jenisSurat} untuk keperluan: "${keperluan}". Mohon arahannya. Terima kasih.`
  );
  const waRequestUrl = `https://wa.me/?text=${waRequestText}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPemohon.trim() || !keperluan.trim()) {
      return;
    }

    const nomorSurat = `470/${Math.floor(100 + Math.random() * 900)}/RT.005-BSI/${new Date().getFullYear()}`;
    const newReq: PermohonanSurat = {
      id: `surat-${Date.now()}`,
      nomorSurat,
      keluargaId: selectedKkId,
      namaPemohon: namaPemohon.trim(),
      nikPemohon: nikPemohon.trim(),
      nomorHpPemohon: nomorHpPemohon.trim(),
      gang,
      nomorRumah: nomorRumah.trim(),
      jenisSurat,
      keperluan: keperluan.trim(),
      tanggalPengajuan: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      status: 'Menunggu Verifikasi',
      keteranganTambahan: keteranganTambahan.trim(),
    };

    setCreatedSurat(newReq);
    onSubmitRequest(newReq);
    setSuccessSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center sm:p-4 p-0 animate-fadeIn">
      <div className="relative bg-white sm:rounded-2xl rounded-none max-w-3xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-sm shrink-0">
              <FileText className="w-4 h-4 text-stone-950" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400 font-semibold leading-none">
                Layanan Administrasi Warga
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                Pembuatan Surat Pengantar RT 05 Blok E
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs sm:text-sm text-stone-800 space-y-4">
          {successSubmitted ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                Pengajuan Surat Pengantar Berhasil Dibuat!
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Draft surat pengantar atas nama <strong>{namaPemohon}</strong> telah tercatat di sistem RT 05 Blok E. Anda dapat mencetak surat ini langsung atau mengirim konfirmasi via WhatsApp ke Ketua RT.
              </p>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={handleDownloadCurrentPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer min-h-[44px] shadow-xs active:scale-95"
                  title="Unduh langsung surat pengantar dalam format PDF A4 resmi"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Surat (PDF A4)</span>
                </button>
                <button
                  onClick={handlePrintDraft}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer min-h-[44px]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <a
                  href={waRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim ke WhatsApp RT</span>
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer min-h-[44px]"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : previewMode ? (
            /* Official Preview Format of Surat Pengantar */
            <div className="border border-stone-300 p-6 rounded-xl bg-white space-y-4 font-serif text-stone-900">
              {/* Kop Surat */}
              <div className="text-center pb-3 border-b-2 border-stone-800">
                <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-stone-700">
                  RUKUN TETANGGA 05 BLOK E / RW 12
                </div>
                <h4 className="text-base font-sans font-black uppercase text-stone-950">
                  PERUMAHAN BUMI SETIA INSANI
                </h4>
                <div className="text-[11px] font-sans text-stone-600">
                  Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi 17215
                </div>
              </div>

              {/* Title & Number */}
              <div className="text-center pt-2">
                <div className="font-bold underline text-sm sm:text-base tracking-wide uppercase">
                  {jenisSurat}
                </div>
                <div className="text-xs font-sans text-stone-600 mt-0.5">
                  Nomor: 470 / RT.05-BSI / {new Date().getFullYear()}
                </div>
              </div>

              {/* Body */}
              <div className="text-xs sm:text-sm space-y-2 leading-relaxed pt-2">
                <p>
                  Yang bertanda tangan di bawah ini Pengurus RT 05 Blok E Perumahan Bumi Setia Insani menerangkan bahwa:
                </p>

                <div className="pl-4 space-y-1 font-sans text-xs">
                  <div className="grid grid-cols-3">
                    <span className="text-stone-600">Nama Lengkap</span>
                    <span className="col-span-2 font-bold text-stone-900">: {namaPemohon}</span>
                  </div>
                  {nikPemohon && (
                    <div className="grid grid-cols-3">
                      <span className="text-stone-600">NIK</span>
                      <span className="col-span-2 font-mono">: {nikPemohon}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3">
                    <span className="text-stone-600">Alamat Rumah</span>
                    <span className="col-span-2">: {gang}, {nomorRumah}, RT 05 Blok E</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-stone-600">Perumahan</span>
                    <span className="col-span-2">: Bumi Setia Insani, Pahlawan Setia</span>
                  </div>
                </div>

                <p className="pt-2">
                  Adalah benar yang bersangkutan merupakan warga yang bertempat tinggal di lingkungan RT 05 Blok E Perumahan Bumi Setia Insani. Surat pengantar ini diberikan untuk keperluan:
                </p>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded font-sans font-bold text-stone-900">
                  "{keperluan}"
                </div>

                <p>
                  Demikian surat pengantar ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-6 flex justify-between items-end text-xs font-sans">
                <div className="text-center">
                  <div>Pemohon,</div>
                  <div className="h-16" />
                  <div className="font-bold underline">({namaPemohon})</div>
                </div>

                <div className="text-center">
                  <div>Bekasi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div>Pengurus RT 05 Blok E,</div>
                  <div className="h-16 flex items-center justify-center text-stone-400 italic text-[11px]">
                    (Cap & Tanda Tangan)
                  </div>
                  <div className="font-bold underline">Ketua RT 05 Blok E</div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-end gap-2 font-sans">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg min-h-[40px] cursor-pointer"
                >
                  Kembali Edit
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCurrentPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg min-h-[40px] shadow-xs cursor-pointer active:scale-95"
                  title="Unduh berkas PDF standar A4 resmi"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download PDF (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintDraft}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg min-h-[40px] cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          ) : (
            /* Form Mode */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
                Pilih Kartu Keluarga Anda untuk mengisi data pemohon secara otomatis, atau ketik langsung keperluan surat yang Anda butuhkan.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pilih Data Keluarga (KK Terdaftar)
                </label>
                <select
                  value={selectedKkId}
                  onChange={(e) => setSelectedKkId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg min-h-[44px]"
                >
                  {citizens.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.namaKepalaKeluarga} — {c.gang} ({c.nomorRumah})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Pemohon *
                  </label>
                  <input
                    type="text"
                    required
                    value={namaPemohon}
                    onChange={(e) => setNamaPemohon(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    NIK Pemohon
                  </label>
                  <input
                    type="text"
                    placeholder="16 Digit NIK"
                    value={nikPemohon}
                    onChange={(e) => setNikPemohon(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    No. WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={nomorHpPemohon}
                    onChange={(e) => setNomorHpPemohon(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Gang di RT 05 Blok E *
                  </label>
                  <select
                    value={gang}
                    onChange={(e) => setGang(e.target.value as GangName)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-bold min-h-[40px]"
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
                    Nomor Rumah *
                  </label>
                  <input
                    type="text"
                    required
                    value={nomorRumah}
                    onChange={(e) => setNomorRumah(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jenis Surat Pengantar Yang Diajukan *
                </label>
                <select
                  value={jenisSurat}
                  onChange={(e) => setJenisSurat(e.target.value as PermohonanSurat['jenisSurat'])}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg font-bold min-h-[44px]"
                >
                  <option value="Surat Keterangan Domisili">Surat Keterangan Domisili Tempat Tinggal</option>
                  <option value="Surat Pengantar KTP / KK">Surat Pengantar Pembuatan KTP / KK Baru</option>
                  <option value="Surat Keterangan Usaha">Surat Keterangan Usaha (SKU)</option>
                  <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu (SKTM / Beasiswa)</option>
                  <option value="Surat Pengantar Nikah">Surat Pengantar Nikah (N1 / N2)</option>
                  <option value="Surat Keterangan Kematian / Kelahiran">Surat Keterangan Kematian / Kelahiran</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keperluan / Tujuan Surat *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Pengurusan perpanjangan KTP di Kelurahan Pahlawan Setia / Bank / Pekerjaan"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleDownloadCurrentPdf}
                  disabled={!namaPemohon.trim() || !keperluan.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-40 disabled:pointer-events-none rounded-xl min-h-[44px] cursor-pointer transition-colors"
                  title="Unduh langsung draft surat ke format PDF A4 resmi"
                >
                  <Download className="w-4 h-4 text-emerald-800" />
                  <span>Download Draft (PDF A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl min-h-[44px] cursor-pointer"
                >
                  Pratinjau Format Surat
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs min-h-[44px] cursor-pointer"
                >
                  <span>Ajukan Surat Pengantar</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
