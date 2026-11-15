import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import type { DataKeluarga } from '../data/citizenData';
import { GANG_LIST, type GangName } from '../data/gangList';

interface LoadedImageInfo {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Normalizes any uploaded image DataURL (PNG/JPG/WEBP/etc.) into a clean JPEG DataURL
 * along with its natural pixel dimensions so jsPDF can embed it reliably without errors.
 */
async function loadNormalizedImage(src: string): Promise<LoadedImageInfo | null> {
  if (!src) return null;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal memuat gambar lampiran.'));
      el.src = src;
    });

    const width = img.naturalWidth || img.width || 800;
    const height = img.naturalHeight || img.height || 500;

    // Convert to standard JPEG via canvas for maximum jsPDF compatibility
    const maxDim = 1600;
    let drawW = width;
    let drawH = height;
    if (drawW > maxDim || drawH > maxDim) {
      if (drawW >= drawH) {
        drawH = Math.round((drawH * maxDim) / drawW);
        drawW = maxDim;
      } else {
        drawW = Math.round((drawW * maxDim) / drawH);
        drawH = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = drawW;
    canvas.height = drawH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, drawW, drawH);
    ctx.drawImage(img, 0, 0, drawW, drawH);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.88),
      width: drawW,
      height: drawH,
    };
  } catch {
    return null;
  }
}

function drawKopRt05(doc: jsPDF, pageWidth: number, margin: number, startY = 16): number {
  let y = startY;
  doc.setTextColor(28, 25, 23);
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('RUKUN TETANGGA 05 BLOK E / RW 12', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(13.5);
  doc.text('PERUMAHAN BUMI SETIA INSANI', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(87, 83, 78);
  doc.text(
    'Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi, Jawa Barat 17215',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 3;

  doc.setDrawColor(28, 25, 23);
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageWidth - margin, y);
  y += 0.9;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setTextColor(28, 25, 23);
  return y + 7;
}

async function appendCitizenSectionToPdf(
  doc: jsPDF,
  citizen: DataKeluarga,
  isFirstPageOfDoc: boolean
): Promise<void> {
  if (!isFirstPageOfDoc) {
    doc.addPage('a4', 'portrait');
  }

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let y = drawKopRt05(doc, pageWidth, margin, 16);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('BIODATA KARTU KELUARGA (KK) WARGA RT 05 BLOK E', pageWidth / 2, y, {
    align: 'center',
  });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 113, 108);
  doc.text(`ID Terdata: ${citizen.id}   |   Pembaruan Terakhir: ${citizen.tanggalUpdate}`, pageWidth / 2, y, {
    align: 'center',
  });
  doc.setTextColor(28, 25, 23);
  y += 6;

  // Household Summary Box
  const boxTop = y;
  const colMid = margin + contentWidth / 2;
  const leftInfo: Array<[string, string]> = [
    ['Kepala Keluarga', citizen.namaKepalaKeluarga || '-'],
    ['Nomor KK', citizen.nomorKk || '-'],
    ['Alamat / Gang', `${citizen.gang} · ${citizen.nomorRumah}`],
    ['Nomor HP / WA', citizen.nomorHp || '-'],
    ['Email', citizen.email || '-'],
  ];
  const rightInfo: Array<[string, string]> = [
    ['Status Hunian', citizen.statusHunian || '-'],
    ['Status KTP', citizen.statusKtp || '-'],
    ['Tahun Tinggal', citizen.tahunTinggal || '-'],
    [
      'Kendaraan',
      `Motor: ${citizen.jumlahKendaraan?.motor ?? 0} | Mobil: ${citizen.jumlahKendaraan?.mobil ?? 0}`,
    ],
    [
      'Berkas Lampiran',
      `KTP: ${citizen.fotoKtp ? 'Terlampir' : 'Belum'} · KK: ${citizen.fotoKk ? 'Terlampir' : 'Belum'}`,
    ],
  ];

  const boxHeight = Math.max(leftInfo.length, rightInfo.length) * 5.6 + 6;
  doc.setFillColor(250, 250, 249);
  doc.setDrawColor(214, 211, 209);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, boxTop, contentWidth, boxHeight, 2, 2, 'FD');

  let infoY = boxTop + 5.5;
  for (let i = 0; i < leftInfo.length; i++) {
    const [lblL, valL] = leftInfo[i];
    const [lblR, valR] = rightInfo[i];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(lblL, margin + 3, infoY);
    doc.setTextColor(28, 25, 23);
    doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
    const clippedL = doc.splitTextToSize(`: ${valL}`, contentWidth / 2 - 33)[0] || '';
    doc.text(clippedL, margin + 31, infoY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(lblR, colMid + 2, infoY);
    doc.setTextColor(28, 25, 23);
    doc.setFont('helvetica', 'normal');
    const clippedR = doc.splitTextToSize(`: ${valR}`, contentWidth / 2 - 33)[0] || '';
    doc.text(clippedR, colMid + 29, infoY);

    infoY += 5.6;
  }

  y = boxTop + boxHeight + 7;

  // Section Header: Anggota Keluarga
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`DAFTAR ANGGOTA KELUARGA (${citizen.anggotaKeluarga.length} JIWA)`, margin, y);
  y += 3;

  // Table Columns totaling 180mm (pageWidth 210 - 30)
  const cols = [
    { header: 'No', width: 9 },
    { header: 'Nama Lengkap & NIK', width: 50 },
    { header: 'Hubungan', width: 25 },
    { header: 'L/P', width: 10 },
    { header: 'Usia', width: 14 },
    { header: 'Pekerjaan', width: 32 },
    { header: 'BPJS', width: 18 },
    { header: 'Kategori', width: 22 },
  ];

  const drawTableHeader = (startY: number): number => {
    doc.setFillColor(28, 25, 23);
    doc.rect(margin, startY, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);

    let x = margin;
    cols.forEach((col) => {
      doc.text(col.header, x + 1.8, startY + 4.8);
      x += col.width;
    });
    doc.setTextColor(28, 25, 23);
    return startY + 7;
  };

  y = drawTableHeader(y);

  citizen.anggotaKeluarga.forEach((anggota, idx) => {
    const namaNik = anggota.nik
      ? `${anggota.namaLengkap}\nNIK: ${anggota.nik}`
      : anggota.namaLengkap || '-';
    const namaLines = doc.splitTextToSize(namaNik, cols[1].width - 3);
    const kerjaLines = doc.splitTextToSize(anggota.pekerjaan || '-', cols[5].width - 3);
    const kategoriStr =
      anggota.kategoriKhusus && anggota.kategoriKhusus.length > 0
        ? anggota.kategoriKhusus.join(', ')
        : '-';
    const katLines = doc.splitTextToSize(kategoriStr, cols[7].width - 3);

    const maxLines = Math.max(namaLines.length, kerjaLines.length, katLines.length, 1);
    const rowHeight = maxLines * 4 + 3.5;

    if (y + rowHeight > pageHeight - 35) {
      doc.addPage('a4', 'portrait');
      y = 18;
      y = drawTableHeader(y);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 244);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(214, 211, 209);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, contentWidth, rowHeight, 'S');

    let x = margin;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);

    const textY = y + 4.5;
    doc.text(String(idx + 1), x + 2, textY);
    x += cols[0].width;

    doc.setFont('helvetica', 'bold');
    doc.text(namaLines, x + 1.8, textY);
    doc.setFont('helvetica', 'normal');
    x += cols[1].width;

    doc.text(doc.splitTextToSize(anggota.hubunganKeluarga || '-', cols[2].width - 3), x + 1.8, textY);
    x += cols[2].width;

    doc.text(anggota.jenisKelamin || '-', x + 2.5, textY);
    x += cols[3].width;

    doc.text(`${anggota.usia ?? 0} Th`, x + 1.8, textY);
    x += cols[4].width;

    doc.text(kerjaLines, x + 1.8, textY);
    x += cols[5].width;

    doc.text(anggota.statusBpjs || '-', x + 1.8, textY);
    x += cols[6].width;

    doc.text(katLines, x + 1.8, textY);

    y += rowHeight;
  });

  y += 6;

  // Catatan Khusus
  if (y > pageHeight - 50) {
    doc.addPage('a4', 'portrait');
    y = 18;
  }

  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(252, 211, 77);
  const catatanText = citizen.catatanKhusus || 'Tidak ada catatan khusus.';
  const catatanLines = doc.splitTextToSize(`Catatan Khusus: ${catatanText}`, contentWidth - 8);
  const noteHeight = catatanLines.length * 4.5 + 5;
  doc.roundedRect(margin, y, contentWidth, noteHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.text(catatanLines, margin + 4, y + 4.8);
  y += noteHeight + 10;

  // Signature block
  if (y > pageHeight - 40) {
    doc.addPage('a4', 'portrait');
    y = 20;
  }

  const signX = pageWidth - margin - 35;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Bekasi, ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    signX,
    y,
    { align: 'center' }
  );
  doc.text('Ketua RT 05 Blok E / RW 12,', signX, y + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Arif Wahyudi', signX, y + 22, { align: 'center' });

  // Lampiran 1: Foto KTP
  if (citizen.fotoKtp) {
    const ktpImg = await loadNormalizedImage(citizen.fotoKtp);
    if (ktpImg) {
      const isLandscape = ktpImg.width > ktpImg.height * 1.15;
      doc.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      const pw = isLandscape ? 297 : 210;
      const ph = isLandscape ? 210 : 297;
      const m = 15;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LAMPIRAN 1: DOKUMEN FOTO / SCAN KTP KEPALA KELUARGA', pw / 2, 18, {
        align: 'center',
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(87, 83, 78);
      doc.text(
        `Nama KK: ${citizen.namaKepalaKeluarga}  |  No. KK: ${citizen.nomorKk}  |  Alamat: ${citizen.gang} ${citizen.nomorRumah}`,
        pw / 2,
        24,
        { align: 'center' }
      );
      doc.setTextColor(28, 25, 23);

      const maxW = pw - m * 2;
      const maxH = ph - 42;
      const scale = Math.min(maxW / ktpImg.width, maxH / ktpImg.height);
      const drawW = ktpImg.width * scale;
      const drawH = ktpImg.height * scale;
      const drawX = (pw - drawW) / 2;
      const drawY = 30;

      doc.setDrawColor(214, 211, 209);
      doc.rect(drawX - 1, drawY - 1, drawW + 2, drawH + 2, 'S');
      doc.addImage(ktpImg.dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
    }
  }

  // Lampiran 2: Foto Kartu Keluarga (KK)
  if (citizen.fotoKk) {
    const kkImg = await loadNormalizedImage(citizen.fotoKk);
    if (kkImg) {
      const isLandscape = kkImg.width > kkImg.height * 1.1;
      doc.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      const pw = isLandscape ? 297 : 210;
      const ph = isLandscape ? 210 : 297;
      const m = 15;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LAMPIRAN 2: DOKUMEN FOTO / SCAN KARTU KELUARGA (KK)', pw / 2, 18, {
        align: 'center',
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(87, 83, 78);
      doc.text(
        `Nama KK: ${citizen.namaKepalaKeluarga}  |  No. KK: ${citizen.nomorKk}  |  Alamat: ${citizen.gang} ${citizen.nomorRumah}`,
        pw / 2,
        24,
        { align: 'center' }
      );
      doc.setTextColor(28, 25, 23);

      const maxW = pw - m * 2;
      const maxH = ph - 42;
      const scale = Math.min(maxW / kkImg.width, maxH / kkImg.height);
      const drawW = kkImg.width * scale;
      const drawH = kkImg.height * scale;
      const drawX = (pw - drawW) / 2;
      const drawY = 30;

      doc.setDrawColor(214, 211, 209);
      doc.rect(drawX - 1, drawY - 1, drawW + 2, drawH + 2, 'S');
      doc.addImage(kkImg.dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
    }
  }
}

/**
 * Download PDF A4 lengkap untuk 1 Kepala Keluarga beserta lampiran Foto KTP & Kartu Keluarga (KK).
 */
export async function downloadCitizenPdfWithAttachments(citizen: DataKeluarga): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  await appendCitizenSectionToPdf(doc, citizen, true);

  const cleanName = (citizen.namaKepalaKeluarga || 'warga')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
  const cleanGang = (citizen.gang || 'rt05')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');

  doc.save(`biodata_kk_${cleanName}_${cleanGang}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Build Rekap PDF A4 untuk seluruh warga terdata beserta masing-masing lampiran KTP & KK.
 */
async function generateAllCitizensPdfDoc(citizens: DataKeluarga[]): Promise<jsPDF> {

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let y = drawKopRt05(doc, pageWidth, margin, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('REKAPITULASI DATA WARGA & KARTU KELUARGA RT 05 BLOK E', pageWidth / 2, y, {
    align: 'center',
  });
  y += 4.5;

  const totalJiwa = citizens.reduce((sum, c) => sum + c.anggotaKeluarga.length, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(87, 83, 78);
  doc.text(
    `Total: ${citizens.length} Kepala Keluarga · ${totalJiwa} Jiwa   |   Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  doc.setTextColor(28, 25, 23);
  y += 6;

  // Summary Table
  const cols = [
    { header: 'No', width: 9 },
    { header: 'Nama Kepala Keluarga', width: 42 },
    { header: 'Gang & Rumah', width: 34 },
    { header: 'No. KK', width: 34 },
    { header: 'Jiwa', width: 12 },
    { header: 'No. HP / WA', width: 27 },
    { header: 'KTP / KK', width: 22 },
  ];

  const drawSummaryHeader = (startY: number): number => {
    doc.setFillColor(28, 25, 23);
    doc.rect(margin, startY, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    let x = margin;
    cols.forEach((col) => {
      doc.text(col.header, x + 1.5, startY + 4.8);
      x += col.width;
    });
    doc.setTextColor(28, 25, 23);
    return startY + 7;
  };

  y = drawSummaryHeader(y);

  citizens.forEach((c, idx) => {
    const rowHeight = 7;
    if (y + rowHeight > pageHeight - 20) {
      doc.addPage('a4', 'portrait');
      y = 18;
      y = drawSummaryHeader(y);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 244);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(214, 211, 209);
    doc.rect(margin, y, contentWidth, rowHeight, 'S');

    let x = margin;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    const ty = y + 4.8;

    doc.text(String(idx + 1), x + 2, ty);
    x += cols[0].width;

    doc.setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(c.namaKepalaKeluarga, cols[1].width - 2)[0] || '-', x + 1.5, ty);
    doc.setFont('helvetica', 'normal');
    x += cols[1].width;

    doc.text(doc.splitTextToSize(`${c.gang} ${c.nomorRumah}`, cols[2].width - 2)[0] || '-', x + 1.5, ty);
    x += cols[2].width;

    doc.text(c.nomorKk || '-', x + 1.5, ty);
    x += cols[3].width;

    doc.text(String(c.anggotaKeluarga.length), x + 4, ty);
    x += cols[4].width;

    doc.text(c.nomorHp || '-', x + 1.5, ty);
    x += cols[5].width;

    const lampiranText = `${c.fotoKtp ? 'KTP✓' : 'KTP-'} / ${c.fotoKk ? 'KK✓' : 'KK-'}`;
    doc.text(lampiranText, x + 1.5, ty);

    y += rowHeight;
  });

  // Individual household pages + KTP & KK attachments
  for (const citizen of citizens) {
    await appendCitizenSectionToPdf(doc, citizen, false);
  }

  return doc;
}

export async function buildAllCitizensPdfBlob(citizens: DataKeluarga[]): Promise<Blob> {
  const doc = await generateAllCitizensPdfDoc(citizens);
  return doc.output('blob');
}

export async function downloadAllCitizensPdfWithAttachments(citizens: DataKeluarga[]): Promise<void> {
  if (citizens.length === 0) return;
  const doc = await generateAllCitizensPdfDoc(citizens);
  doc.save(`rekap_lengkap_warga_rt05_lampiran_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Build Excel (.xlsx) resmi dengan 2 worksheet:
 * 1) Data Kepala Keluarga
 * 2) Rincian Anggota Keluarga
 */
function generateCitizensExcelWorkbook(citizens: DataKeluarga[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Data Kepala Keluarga (KK)
  const kkRows = citizens.map((c, index) => ({
    No: index + 1,
    'Nomor KK': c.nomorKk || '-',
    'Nama Kepala Keluarga': c.namaKepalaKeluarga || '-',
    Gang: c.gang,
    'Nomor Rumah': c.nomorRumah,
    'Status Hunian': c.statusHunian,
    'Status KTP': c.statusKtp,
    'Tahun Tinggal': c.tahunTinggal || '-',
    'Nomor HP / WhatsApp': c.nomorHp || '-',
    Email: c.email || '-',
    'Jumlah Jiwa': c.anggotaKeluarga.length,
    'Jumlah Motor': c.jumlahKendaraan?.motor ?? 0,
    'Jumlah Mobil': c.jumlahKendaraan?.mobil ?? 0,
    'Lampiran KTP': c.fotoKtp ? 'Terlampir (Sudah Diunggah)' : 'Belum Diunggah',
    'Lampiran KK': c.fotoKk ? 'Terlampir (Sudah Diunggah)' : 'Belum Diunggah',
    'Catatan Khusus': c.catatanKhusus || '-',
    'Tanggal Pembaruan': c.tanggalUpdate || '-',
  }));

  const wsKk = XLSX.utils.json_to_sheet(
    kkRows.length > 0
      ? kkRows
      : [
          {
            No: '',
            'Nomor KK': 'Belum ada data warga',
          },
        ]
  );
  wsKk['!cols'] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 26 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 12 },
    { wch: 13 },
    { wch: 13 },
    { wch: 24 },
    { wch: 24 },
    { wch: 28 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsKk, 'Data Kepala Keluarga');

  // Sheet 2: Rincian Anggota Keluarga
  const anggotaRows: Array<Record<string, unknown>> = [];
  let memberCounter = 1;
  citizens.forEach((c) => {
    c.anggotaKeluarga.forEach((a) => {
      anggotaRows.push({
        No: memberCounter++,
        'Nomor KK': c.nomorKk || '-',
        'Kepala Keluarga': c.namaKepalaKeluarga || '-',
        'Gang & Rumah': `${c.gang} ${c.nomorRumah}`,
        'Nama Lengkap Anggota': a.namaLengkap || '-',
        NIK: a.nik || '-',
        'Hubungan Keluarga': a.hubunganKeluarga || '-',
        'L/P': a.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        Usia: a.usia ?? 0,
        Agama: a.agama || '-',
        'Pendidikan Terakhir': a.pendidikanTerakhir || '-',
        Pekerjaan: a.pekerjaan || '-',
        'Gol. Darah': a.golonganDarah || '-',
        'Status BPJS': a.statusBpjs || '-',
        'Status Pernikahan': a.statusPernikahan || '-',
        'Kategori Khusus':
          a.kategoriKhusus && a.kategoriKhusus.length > 0
            ? a.kategoriKhusus.join(', ')
            : '-',
      });
    });
  });

  const wsAnggota = XLSX.utils.json_to_sheet(
    anggotaRows.length > 0
      ? anggotaRows
      : [
          {
            No: '',
            'Nama Lengkap Anggota': 'Belum ada anggota keluarga terdata',
          },
        ]
  );
  wsAnggota['!cols'] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 24 },
    { wch: 22 },
    { wch: 26 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 8 },
    { wch: 12 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsAnggota, 'Anggota Keluarga');
  return wb;
}

export function buildCitizensExcelBlob(citizens: DataKeluarga[]): Blob {
  const wb = generateCitizensExcelWorkbook(citizens);
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function downloadCitizensExcelWorkbook(
  citizens: DataKeluarga[],
  customFilename?: string
): void {
  const wb = generateCitizensExcelWorkbook(citizens);
  const filename =
    customFilename ||
    `data_warga_rt05_blok_e_bumi_setia_insani_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Unduh file template Excel (.xlsx) siap isi untuk import massal data banyak KK sekaligus.
 */
export function downloadCitizensExcelTemplate(): void {
  const wb = XLSX.utils.book_new();
  const sampleRows = [
    {
      'Nomor KK': '3216060101010001',
      'Nama Kepala Keluarga': 'Contoh: Budi Santoso',
      Gang: 'Gg Utama',
      'Nomor Rumah': 'No. 01',
      'Status Hunian': 'Milik Sendiri',
      'Status KTP': 'KTP RT 05 (Warga Tetap)',
      'Tahun Tinggal': '2022',
      'Nomor HP / WhatsApp': '081234567890',
      'Jumlah Motor': 2,
      'Jumlah Mobil': 0,
      'Jumlah Jiwa': 3,
      'Catatan Khusus': '',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sampleRows);
  ws['!cols'] = [
    { wch: 20 },
    { wch: 26 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 24 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Template Import KK');
  XLSX.writeFile(wb, 'template_import_data_warga_rt05_blok_e.xlsx');
}

function normalizeGangName(raw: unknown): GangName {
  const text = String(raw || '').toLowerCase().trim();
  if (text.includes('bhineka') || text.includes('bhinneka')) return 'Gg Bhineka';
  if (text.includes('damai')) return 'Gg Damai';
  if (text.includes('walet')) return 'Gg Walet';
  if (text.includes('jalak')) return 'Gg Jalak suren';
  if (text.includes('cendrawasih')) return 'Gg Cendrawasih';
  if (text.includes('utama')) return 'Gg Utama';
  return GANG_LIST[0];
}

/**
 * Parse uploaded Excel (.xlsx/.xls/.csv) file into DataKeluarga[] records
 * so pengurus can bulk-import many households at once.
 */
export async function parseCitizensFromExcelFile(file: File): Promise<DataKeluarga[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[firstSheetName], {
    defval: '',
  });

  const nowStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const imported: DataKeluarga[] = [];

  rows.forEach((row, idx) => {
    const pick = (...keys: string[]): string => {
      for (const key of keys) {
        const matchKey = Object.keys(row).find(
          (k) => k.trim().toLowerCase() === key.toLowerCase()
        );
        if (matchKey && String(row[matchKey]).trim() !== '') {
          return String(row[matchKey]).trim();
        }
      }
      return '';
    };

    const nama = pick('Nama Kepala Keluarga', 'Kepala Keluarga', 'Nama', 'Nama KK');
    if (!nama || nama.toLowerCase().startsWith('contoh:')) return;

    const nomorKk =
      pick('Nomor KK', 'No. KK', 'No KK', 'KK') ||
      `321606${String(Date.now() + idx).slice(-10)}`;
    const gang = normalizeGangName(pick('Gang', 'Gang di RT 05 Blok E', 'Alamat Gang'));
    const nomorRumah = pick('Nomor Rumah', 'No. Rumah', 'No Rumah', 'Rumah') || '-';
    const nomorHp = pick('Nomor HP / WhatsApp', 'Nomor WhatsApp', 'Nomor HP', 'No HP', 'HP', 'WA') || '-';
    const rawHunian = pick('Status Hunian', 'Status Kepemilikan Rumah', 'Status Rumah');
    const statusHunian = rawHunian.toLowerCase().includes('kontrak') || rawHunian.toLowerCase().includes('sewa')
      ? 'Kontrak / Sewa'
      : rawHunian.toLowerCase().includes('singgah')
      ? 'Rumah Singgah / Kerabat'
      : 'Milik Sendiri';

    const rawKtp = pick('Status KTP');
    const statusKtp = rawKtp.toLowerCase().includes('domisili') || rawKtp.toLowerCase().includes('luar')
      ? 'KTP Luar (Warga Domisili)'
      : 'KTP RT 05 (Warga Tetap)';

    const tahunTinggal = pick('Tahun Tinggal') || new Date().getFullYear().toString();
    const motor = Math.max(0, Number(pick('Jumlah Motor', 'Motor')) || 0);
    const mobil = Math.max(0, Number(pick('Jumlah Mobil', 'Mobil')) || 0);
    const jumlahJiwa = Math.max(1, Number(pick('Jumlah Jiwa', 'Jiwa')) || 1);
    const catatanKhusus = pick('Catatan Khusus', 'Catatan');

    const anggotaKeluarga: DataKeluarga['anggotaKeluarga'] = [
      {
        id: `ak-imp-${Date.now()}-${idx}-0`,
        namaLengkap: nama,
        hubunganKeluarga: 'Kepala Keluarga',
        jenisKelamin: 'L',
        usia: 35,
        agama: 'Islam',
        golonganDarah: 'Belum Tahu',
        statusBpjs: 'Aktif',
        statusPernikahan: 'Menikah',
      },
    ];

    for (let m = 1; m < Math.min(jumlahJiwa, 15); m++) {
      anggotaKeluarga.push({
        id: `ak-imp-${Date.now()}-${idx}-${m}`,
        namaLengkap: `Anggota Keluarga ${m + 1} (${nama})`,
        hubunganKeluarga: m === 1 ? 'Istri' : 'Anak',
        jenisKelamin: m === 1 ? 'P' : 'L',
        usia: m === 1 ? 32 : 10,
        agama: 'Islam',
        golonganDarah: 'Belum Tahu',
        statusBpjs: 'Aktif',
        statusPernikahan: m === 1 ? 'Menikah' : 'Belum Menikah',
      });
    }

    imported.push({
      id: `kk-imp-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      nomorKk,
      namaKepalaKeluarga: nama,
      nomorHp,
      email: pick('Email'),
      gang,
      nomorRumah,
      statusHunian,
      statusKtp,
      tahunTinggal,
      jumlahKendaraan: { motor, mobil },
      anggotaKeluarga,
      diverifikasiRt: true,
      tanggalUpdate: `${nowStr} (Import Excel)`,
      catatanKhusus,
    });
  });

  return imported;
}
