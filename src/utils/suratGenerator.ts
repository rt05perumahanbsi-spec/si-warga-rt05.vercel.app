import { jsPDF } from 'jspdf';

/**
 * Generate official printable HTML content for Surat Pengantar RT 05 Blok E
 */
export function generateSuratHtml(surat: {
  nomorSurat?: string;
  namaPemohon: string;
  nikPemohon?: string;
  gang: string;
  nomorRumah: string;
  jenisSurat: string;
  keperluan: string;
  tanggalPengajuan?: string;
  keteranganTambahan?: string;
}): string {
  const tanggal =
    surat.tanggalPengajuan ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const nomorSurat =
    surat.nomorSurat ||
    `470/${Math.floor(100 + Math.random() * 900)}/RT.005-BSI/${new Date().getFullYear()}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${surat.jenisSurat} - ${surat.namaPemohon} - RT 05 Blok E Bumi Setia Insani</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 20mm 20mm 20mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 750px;
      margin: 0 auto;
      background: #fff;
    }
    /* KOP SURAT */
    .kop {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .kop h3 {
      margin: 0;
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .kop h2 {
      margin: 2px 0;
      font-size: 15pt;
      font-weight: 900;
      text-transform: uppercase;
    }
    .kop p {
      margin: 0;
      font-size: 10pt;
      font-style: italic;
    }

    /* JUDUL SURAT */
    .judul-surat {
      text-align: center;
      margin: 20px 0 25px 0;
    }
    .judul-surat h4 {
      margin: 0;
      font-size: 13pt;
      text-decoration: underline;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .judul-surat .nomor {
      margin-top: 3px;
      font-size: 11pt;
    }

    /* ISI */
    p.opening {
      text-align: justify;
      margin-bottom: 12px;
    }
    table.data-warga {
      width: 100%;
      margin: 10px 0 16px 20px;
      border-collapse: collapse;
    }
    table.data-warga td {
      padding: 3px 0;
      vertical-align: top;
      font-size: 12pt;
    }
    table.data-warga td.label {
      width: 170px;
    }
    table.data-warga td.separator {
      width: 15px;
      text-align: center;
    }
    .keperluan-box {
      margin: 14px 0;
      padding: 10px 14px;
      background: #fbfbfb;
      border-left: 3px solid #333;
      font-weight: bold;
      font-style: italic;
    }
    p.closing {
      text-align: justify;
      margin-top: 14px;
      text-indent: 30px;
    }

    /* TANDA TANGAN */
    .ttd-container {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .ttd-box {
      width: 45%;
      text-align: center;
    }
    .ttd-box .space {
      height: 75px;
    }
    .ttd-box .nama {
      font-weight: bold;
      text-decoration: underline;
    }

    /* PRINT BUTTON (Screen Only) */
    .no-print {
      margin-bottom: 20px;
      padding: 12px 18px;
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: sans-serif;
      font-size: 13px;
    }
    .btn {
      padding: 8px 16px;
      background: #f59e0b;
      color: #000;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-secondary {
      background: #18181b;
      color: #fff;
      margin-left: 8px;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print">
      <div>
        <strong>Dokumen Surat Pengantar RT 05 Blok E</strong> — Format A4 Resmi.
      </div>
      <div>
        <button class="btn" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
        <button class="btn btn-secondary" onclick="window.close()">Tutup</button>
      </div>
    </div>

    <!-- KOP SURAT RESMI -->
    <div class="kop">
      <h3>RUKUN TETANGGA 05 BLOK E / RW 12</h3>
      <h2>PERUMAHAN BUMI SETIA INSANI</h2>
      <p>Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi, Jawa Barat 17215</p>
    </div>

    <!-- JUDUL DAN NOMOR SURAT -->
    <div class="judul-surat">
      <h4>${surat.jenisSurat}</h4>
      <div class="nomor">Nomor: ${nomorSurat}</div>
    </div>

    <!-- ISI SURAT -->
    <p class="opening">
      Yang bertanda tangan di bawah ini Pengurus Rukun Tetangga (RT) 05 Blok E Perumahan Bumi Setia Insani, Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi, menerangkan dengan sebenarnya bahwa:
    </p>

    <table class="data-warga">
      <tr>
        <td class="label">Nama Lengkap</td>
        <td class="separator">:</td>
        <td><strong>${surat.namaPemohon}</strong></td>
      </tr>
      ${
        surat.nikPemohon
          ? `<tr>
        <td class="label">NIK (No. KTP)</td>
        <td class="separator">:</td>
        <td>${surat.nikPemohon}</td>
      </tr>`
          : ''
      }
      <tr>
        <td class="label">Alamat Rumah</td>
        <td class="separator">:</td>
        <td>${surat.gang}, Nomor ${surat.nomorRumah}</td>
      </tr>
      <tr>
        <td class="label">RT / RW</td>
        <td class="separator">:</td>
        <td>RT 05 / RW 12</td>
      </tr>
      <tr>
        <td class="label">Komplek / Perumahan</td>
        <td class="separator">:</td>
        <td>Perumahan Bumi Setia Insani, Blok E</td>
      </tr>
      <tr>
        <td class="label">Desa / Kelurahan</td>
        <td class="separator">:</td>
        <td>Pahlawan Setia</td>
      </tr>
      <tr>
        <td class="label">Kecamatan</td>
        <td class="separator">:</td>
        <td>Tarumajaya</td>
      </tr>
      <tr>
        <td class="label">Kabupaten</td>
        <td class="separator">:</td>
        <td>Bekasi</td>
      </tr>
    </table>

    <p class="opening">
      Bahwa nama tersebut di atas adalah benar warga yang berdomisili / bertempat tinggal di lingkungan RT 05 Blok E Perumahan Bumi Setia Insani. Surat keterangan pengantar ini dibuat dan diberikan untuk keperluan:
    </p>

    <div class="keperluan-box">
      "${surat.keperluan}"
      ${surat.keteranganTambahan ? `<div style="font-size: 11pt; font-weight: normal; margin-top: 4px;">Catatan: ${surat.keteranganTambahan}</div>` : ''}
    </div>

    <p class="closing">
      Demikian surat pengantar ini kami berikan dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.
    </p>

    <!-- TANDA TANGAN -->
    <div class="ttd-container">
      <div class="ttd-box">
        <div>Mengetahui / Pemohon,</div>
        <div class="space"></div>
        <div class="nama">${surat.namaPemohon}</div>
        <div style="font-size: 10pt; color: #555;">Warga Pemohon</div>
      </div>

      <div class="ttd-box">
        <div>Bekasi, ${tanggal}</div>
        <div>Pengurus RT 05 Blok E,</div>
        <div class="space" style="display: flex; align-items: center; justify-content: center; color: #888; font-style: italic; font-size: 10pt;">
          (Cap & Tanda Tangan)
        </div>
        <div class="nama">Arif Wahyudi</div>
        <div style="font-size: 10pt; color: #555;">Ketua RT 05 Blok E</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Download Surat Pengantar directly as A4 PDF document using jsPDF
 */
export function downloadSuratPdf(surat: {
  nomorSurat?: string;
  namaPemohon: string;
  nikPemohon?: string;
  gang: string;
  nomorRumah: string;
  jenisSurat: string;
  keperluan: string;
  tanggalPengajuan?: string;
  keteranganTambahan?: string;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210mm x 297mm
  });

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const tanggal =
    surat.tanggalPengajuan ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const nomorSurat =
    surat.nomorSurat ||
    `470/${Math.floor(100 + Math.random() * 900)}/RT.005-BSI/${new Date().getFullYear()}`;

  // 1. KOP SURAT RESMI RT 05 BLOK E
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('RUKUN TETANGGA 05 BLOK E / RW 12', pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  doc.setFontSize(14);
  doc.text('PERUMAHAN BUMI SETIA INSANI', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.text('Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi 17215', pageWidth / 2, y, { align: 'center' });
  y += 3.5;

  // Garis Ganda Kop Surat
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageWidth - margin, y);
  y += 0.8;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // 2. JUDUL DAN NOMOR SURAT
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  const judulUpper = surat.jenisSurat.toUpperCase();
  doc.text(judulUpper, pageWidth / 2, y, { align: 'center' });
  const titleWidth = doc.getTextWidth(judulUpper);
  doc.setLineWidth(0.3);
  doc.line((pageWidth - titleWidth) / 2, y + 1, (pageWidth + titleWidth) / 2, y + 1);
  y += 5.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text(`Nomor: ${nomorSurat}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // 3. PARAGRAF PEMBUKA
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  const p1 =
    'Yang bertanda tangan di bawah ini Pengurus Rukun Tetangga (RT) 05 Blok E Perumahan Bumi Setia Insani, Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi, menerangkan dengan sebenarnya bahwa:';
  const splitP1 = doc.splitTextToSize(p1, contentWidth);
  doc.text(splitP1, margin, y);
  y += splitP1.length * 5.2 + 3;

  // 4. DATA IDENTITAS WARGA
  const labelX = margin + 5;
  const colonX = margin + 52;
  const valueX = margin + 56;

  const dataRows: Array<[string, string]> = [
    ['Nama Lengkap', surat.namaPemohon],
    ...(surat.nikPemohon ? ([['NIK (No. KTP)', surat.nikPemohon]] as Array<[string, string]>) : []),
    ['Alamat Rumah', `${surat.gang}, Nomor ${surat.nomorRumah}`],
    ['RT / RW', 'RT 05 / RW 12'],
    ['Komplek / Perumahan', 'Perumahan Bumi Setia Insani, Blok E'],
    ['Desa / Kelurahan', 'Pahlawan Setia'],
    ['Kecamatan', 'Tarumajaya'],
    ['Kabupaten', 'Bekasi'],
  ];

  dataRows.forEach(([lbl, val]) => {
    doc.setFont('times', 'normal');
    doc.text(lbl, labelX, y);
    doc.text(':', colonX, y);
    doc.setFont('times', lbl === 'Nama Lengkap' ? 'bold' : 'normal');
    doc.text(val, valueX, y);
    y += 5.2;
  });

  y += 3;

  // 5. PARAGRAF KEPERLUAN
  doc.setFont('times', 'normal');
  const p2 =
    'Bahwa nama tersebut di atas adalah benar warga yang berdomisili / bertempat tinggal di lingkungan RT 05 Blok E Perumahan Bumi Setia Insani. Surat keterangan pengantar ini dibuat dan diberikan untuk keperluan:';
  const splitP2 = doc.splitTextToSize(p2, contentWidth);
  doc.text(splitP2, margin, y);
  y += splitP2.length * 5.2 + 3;

  // Kotak Keperluan
  const keperluanText =
    `"${surat.keperluan}"` +
    (surat.keteranganTambahan ? ` (Catatan: ${surat.keteranganTambahan})` : '');
  const splitKeperluan = doc.splitTextToSize(keperluanText, contentWidth - 10);
  const boxHeight = splitKeperluan.length * 5.2 + 6;

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y, contentWidth, boxHeight, 'FD');
  doc.setFont('times', 'bolditalic');
  doc.text(splitKeperluan, margin + 5, y + 4.8);
  y += boxHeight + 5;

  // 6. PARAGRAF PENUTUP
  doc.setFont('times', 'normal');
  const p3 =
    'Demikian surat pengantar ini kami berikan dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.';
  const splitP3 = doc.splitTextToSize(p3, contentWidth);
  doc.text(splitP3, margin, y);
  y += splitP3.length * 5.2 + 14;

  // 7. TANDA TANGAN
  const leftX = margin + 25;
  const rightX = pageWidth - margin - 35;

  doc.setFont('times', 'normal');
  doc.text('Mengetahui / Pemohon,', leftX, y, { align: 'center' });
  doc.text(`Bekasi, ${tanggal}`, rightX, y, { align: 'center' });
  doc.text('Pengurus RT 05 Blok E,', rightX, y + 4.5, { align: 'center' });

  y += 24;
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(130, 130, 130);
  doc.text('(Cap & Tanda Tangan)', rightX, y - 5, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  doc.setFont('times', 'bold');
  doc.text(`( ${surat.namaPemohon} )`, leftX, y, { align: 'center' });
  doc.text('Arif Wahyudi', rightX, y, { align: 'center' });

  // Underlines for signatures
  const leftNameWidth = doc.getTextWidth(`( ${surat.namaPemohon} )`);
  doc.line(leftX - leftNameWidth / 2, y + 0.8, leftX + leftNameWidth / 2, y + 0.8);
  const rightNameWidth = doc.getTextWidth('Arif Wahyudi');
  doc.line(rightX - rightNameWidth / 2, y + 0.8, rightX + rightNameWidth / 2, y + 0.8);

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Warga Pemohon', leftX, y + 4.5, { align: 'center' });
  doc.text('Ketua RT 05 Blok E', rightX, y + 4.5, { align: 'center' });

  // SIMPAN BERKAS PDF
  const cleanName = (surat.namaPemohon || 'Warga')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  const cleanSurat = (surat.jenisSurat || 'Surat_Pengantar')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');

  doc.save(`${cleanSurat}_rt05_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Trigger file download directly in browser as HTML format
 */
export function downloadSuratFile(surat: {
  nomorSurat?: string;
  namaPemohon: string;
  nikPemohon?: string;
  gang: string;
  nomorRumah: string;
  jenisSurat: string;
  keperluan: string;
  tanggalPengajuan?: string;
  keteranganTambahan?: string;
}) {
  const htmlContent = generateSuratHtml(surat);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanName = (surat.namaPemohon || 'Warga')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  const cleanSurat = (surat.jenisSurat || 'Surat_Pengantar')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');

  link.href = url;
  link.download = `${cleanSurat}_rt05_${cleanName}_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Open official printable document in new tab / print dialog
 */
export function printSuratDocument(surat: {
  nomorSurat?: string;
  namaPemohon: string;
  nikPemohon?: string;
  gang: string;
  nomorRumah: string;
  jenisSurat: string;
  keperluan: string;
  tanggalPengajuan?: string;
  keteranganTambahan?: string;
}) {
  const htmlContent = generateSuratHtml(surat);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
