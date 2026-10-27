import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PrestasiSiswa } from '../types/prestasi';
import { SCHOOL_INFO } from '../data/initialData';
import { formatTanggalIndonesia } from './helpers';

export interface PDFExportOptions {
  data: PrestasiSiswa[];
  tahunAjaran: string;
  nomorLaporan?: string;
}

/**
 * Menghasilkan dan mengunduh dokumen PDF resmi Laporan Rekapitulasi Prestasi
 * SMP Negeri 1 Kota Pontianak berformat A4 Landscape dengan KOP surat resmi,
 * statistik ringkas, tabel rincian prestasi, dan tanda tangan legalitas.
 */
export function generateLaporanResmiPDF({
  data,
  tahunAjaran,
  nomorLaporan
}: PDFExportOptions): void {
  // Setup dokumen A4 Landscape (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. KOP SURAT RESMI SEKOLAH
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('PEMERINTAH KOTA PONTIANAK', pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DINAS PENDIDIKAN DAN KEBUDAYAAN', pageWidth / 2, 19, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('SMP NEGERI 1 KOTA PONTIANAK', pageWidth / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(
    `${SCHOOL_INFO.alamat} · Kode Pos: ${SCHOOL_INFO.kodePos}`,
    pageWidth / 2,
    31,
    { align: 'center' }
  );
  doc.text(
    `Telp: ${SCHOOL_INFO.telepon} · Surel: ${SCHOOL_INFO.email} · NPSN: ${SCHOOL_INFO.npsn} · Terakreditasi: ${SCHOOL_INFO.akreditasi}`,
    pageWidth / 2,
    35.5,
    { align: 'center' }
  );

  // Garis ganda pembatas KOP Surat
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(14, 38, pageWidth - 14, 38);
  doc.setLineWidth(0.2);
  doc.line(14, 39, pageWidth - 14, 39);

  // 2. JUDUL LAPORAN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(
    'LAPORAN REKAPITULASI PRESTASI & HASIL PERLOMBAAN SISWA',
    pageWidth / 2,
    46,
    { align: 'center' }
  );

  // 3. STATISTIK RINGKAS
  const totalJuara1 = data.filter(d => d.capaian.includes('Juara 1') || d.capaian.includes('Emas')).length;
  const totalJuara2 = data.filter(d => d.capaian.includes('Juara 2') || d.capaian.includes('Perak')).length;
  const totalJuara3 = data.filter(d => d.capaian.includes('Juara 3') || d.capaian.includes('Perunggu')).length;

  // Kotak ringkasan
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, 51, pageWidth - 28, 10, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const colStep = (pageWidth - 28) / 3;
  doc.text(`Total Kejuaraan: ${data.length}`, 18, 57.5);
  doc.text(`Juara 1 (Emas): ${totalJuara1}`, 18 + colStep, 57.5);
  doc.text(`Juara 2 & 3: ${totalJuara2 + totalJuara3}`, 18 + colStep * 2, 57.5);

  // 4. TABEL DATA HASIL PERLOMBAAN
  const tableRows = data.map((item, index) => [
    (index + 1).toString(),
    `${item.namaSiswa}\nNISN: ${item.nisn || '-'}`,
    item.kelas && item.kelas !== '-' ? item.kelas : '-',
    `${item.namaLomba}\n[${item.bidang} · ${item.cabangLomba}]`,
    item.tingkat,
    item.capaian,
    item.penyelenggara,
    item.tanggal
  ]);

  autoTable(doc, {
    startY: 64,
    head: [
      [
        'No',
        'Nama Siswa / Tim',
        'Kelas',
        'Nama Lomba & Cabang',
        'Tingkat',
        'Capaian Juara',
        'Penyelenggara',
        'Tanggal'
      ]
    ],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      1: { cellWidth: 48 },
      2: { halign: 'center', cellWidth: 16 },
      3: { cellWidth: 68 },
      4: { cellWidth: 35 },
      5: { fontStyle: 'bold', cellWidth: 30 },
      6: { cellWidth: 43 },
      7: { halign: 'center', cellWidth: 20 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: (dataInfo) => {
      // Footer halaman
      const str = `Halaman ${dataInfo.pageNumber}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 16, pageHeight - 6, { align: 'right' });
      doc.text(
        `Dokumen Resmi Kesiswaan SMP Negeri 1 Pontianak · Diunduh: ${new Date().toLocaleDateString('id-ID')}`,
        14,
        pageHeight - 6
      );
    }
  });

  // 5. BLOK TANDA TANGAN LEGALITAS
  // @ts-expect-error autoTable attaches lastAutoTable to doc
  const finalY = doc.lastAutoTable?.finalY || 150;
  
  let sigY = finalY + 8;
  if (sigY + 42 > pageHeight - 12) {
    doc.addPage();
    sigY = 18;
  }

  const leftColX = 55;
  const rightColX = pageWidth - 65;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  // Kiri: Mengetahui Kepala Sekolah
  doc.text('Mengetahui,', leftColX, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala SMP Negeri 1 Pontianak', leftColX, sigY + 4.5, { align: 'center' });
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.3);
  doc.line(leftColX - 30, sigY + 26, leftColX + 30, sigY + 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(SCHOOL_INFO.kepalaSekolah, leftColX, sigY + 30, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NIP. ${SCHOOL_INFO.nipKepalaSekolah}`, leftColX, sigY + 34, { align: 'center' });

  // Kanan: Wakakesiswaan
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Pontianak, ${formatTanggalIndonesia(new Date().toISOString().split('T')[0])}`, rightColX, sigY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Wakil Kepala Sekolah Bidang Kesiswaan', rightColX, sigY + 4.5, { align: 'center' });
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.3);
  doc.line(rightColX - 30, sigY + 26, rightColX + 30, sigY + 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(SCHOOL_INFO.wakakesiswaan, rightColX, sigY + 30, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NIP. ${SCHOOL_INFO.nipWakakesiswaan}`, rightColX, sigY + 34, { align: 'center' });

  // Unduh dokumen PDF
  const sanitizedTahun = tahunAjaran.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Laporan_Resmi_Prestasi_SMPN1_Pontianak_${sanitizedTahun}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
