import { PrestasiSiswa, BidangLomba, JenisLomba, CapaianPrestasi, TingkatPerlombaan } from '../types/prestasi';

/**
 * Menghitung estimasi poin pembinaan kesiswaan berdasarkan tingkat dan capaian juara.
 * Mengacu pada standar pembobotan portofolio prestasi Dinas Pendidikan Kota Pontianak.
 */
export function hitungPoinPrestasi(tingkat: TingkatPerlombaan, capaian: CapaianPrestasi): number {
  const table: Record<TingkatPerlombaan, Record<string, number>> = {
    'Internasional': {
      'Juara 1 (Emas)': 60,
      'Juara 2 (Perak)': 50,
      'Juara 3 (Perunggu)': 45,
      'Harapan 1': 35,
      'Harapan 2': 30,
      'Harapan 3': 25,
      'Finalis / Apresiasi': 20,
    },
    'Nasional': {
      'Juara 1 (Emas)': 45,
      'Juara 2 (Perak)': 35,
      'Juara 3 (Perunggu)': 30,
      'Harapan 1': 20,
      'Harapan 2': 18,
      'Harapan 3': 15,
      'Finalis / Apresiasi': 12,
    },
    'Provinsi Kalimantan Barat': {
      'Juara 1 (Emas)': 30,
      'Juara 2 (Perak)': 25,
      'Juara 3 (Perunggu)': 20,
      'Harapan 1': 12,
      'Harapan 2': 10,
      'Harapan 3': 8,
      'Finalis / Apresiasi': 5,
    },
    'Kota Pontianak': {
      'Juara 1 (Emas)': 20,
      'Juara 2 (Perak)': 15,
      'Juara 3 (Perunggu)': 10,
      'Harapan 1': 7,
      'Harapan 2': 5,
      'Harapan 3': 4,
      'Finalis / Apresiasi': 3,
    },
    'Kota Singkawang': {
      'Juara 1 (Emas)': 20,
      'Juara 2 (Perak)': 15,
      'Juara 3 (Perunggu)': 10,
      'Harapan 1': 7,
      'Harapan 2': 5,
      'Harapan 3': 4,
      'Finalis / Apresiasi': 3,
    },
    'Kabupaten': {
      'Juara 1 (Emas)': 20,
      'Juara 2 (Perak)': 15,
      'Juara 3 (Perunggu)': 10,
      'Harapan 1': 7,
      'Harapan 2': 5,
      'Harapan 3': 4,
      'Finalis / Apresiasi': 3,
    },
    'Kecamatan': {
      'Juara 1 (Emas)': 10,
      'Juara 2 (Perak)': 8,
      'Juara 3 (Perunggu)': 6,
      'Harapan 1': 4,
      'Harapan 2': 3,
      'Harapan 3': 2,
      'Finalis / Apresiasi': 1,
    }
  };

  return table[tingkat]?.[capaian] ?? 10;
}

export function formatTanggalIndonesia(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function exportToCSV(data: any[], filename: string = 'Rekapitulasi_Prestasi_SMPN1_Pontianak') {
  if (!data || data.length === 0) return;
  const headers = [
    'No',
    'Nama Siswa',
    'NISN',
    'Kelas',
    'Nama Perlombaan',
    'Bidang',
    'Jenis Lomba',
    'Cabang',
    'Tingkat',
    'Capaian Juara',
    'Penyelenggara',
    'Tanggal Lomba',
    'Tahun Ajaran',
    'Guru Pembimbing',
    'No Sertifikat'
  ];

  const rows = data.map((item, index) => [
    index + 1,
    `"${item.namaSiswa.replace(/"/g, '""')}"`,
    `"${item.nisn}"`,
    `"${item.kelas}"`,
    `"${item.namaLomba.replace(/"/g, '""')}"`,
    `"${item.bidang}"`,
    `"${item.jenisLomba || 'Individu (Perorangan)'}"`,
    `"${item.cabangLomba.replace(/"/g, '""')}"`,
    `"${item.tingkat}"`,
    `"${item.capaian}"`,
    `"${item.penyelenggara.replace(/"/g, '""')}"`,
    `"${item.tanggal}"`,
    `"${item.tahunAjaran}"`,
    `"${item.guruPembimbing.replace(/"/g, '""')}"`,
    `"${item.nomorSertifikat || '-'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Mengunduh berkas template resmi CSV untuk penginputan data prestasi siswa SMPN 1 Pontianak
 */
export function downloadCSVTemplate() {
  const headers = [
    'Nama Siswa',
    'NISN',
    'Kelas',
    'Nama Perlombaan',
    'Bidang',
    'Jenis Lomba',
    'Cabang',
    'Tingkat',
    'Capaian Juara',
    'Penyelenggara',
    'Tanggal Lomba (YYYY-MM-DD)',
    'Tahun Ajaran',
    'Guru Pembimbing',
    'No Sertifikat',
    'Catatan'
  ];

  const sampleRows = [
    [
      '"Ahmad Fauzan Pratama"',
      '"0098234121"',
      '"IX Unggulan A"',
      '"Olimpiade Sains Nasional (OSN) Jenjang SMP Tingkat Kota Pontianak"',
      '"Akademik"',
      '"Individu (Perorangan)"',
      '"IPA Terpadu"',
      '"Kota Pontianak"',
      '"Juara 1 (Emas)"',
      '"Balai Pengembangan Talenta Indonesia & Disdikbud Pontianak"',
      '"2026-05-18"',
      '"2025/2026"',
      '"Drs. Hendra Setiawan, M.Pd."',
      '"421.3/0892/DISDIK-PTK/2026"',
      '"Mewakili sekolah ke tingkat Provinsi Kalimantan Barat"'
    ],
    [
      '"Siti Nurhaliza & Tim"',
      '"0101823901"',
      '"VIII B"',
      '"Festival dan Lomba Seni Siswa (FLS2N) Tingkat Kota Singkawang Open"',
      '"Seni & Budaya"',
      '"Beregu (Tim / Kelompok)"',
      '"Tari Tradisional Nusantara"',
      '"Kota Singkawang"',
      '"Juara 2 (Perak)"',
      '"Dinas Pendidikan dan Kebudayaan Kota Singkawang"',
      '"2026-04-12"',
      '"2025/2026"',
      '"Nurul Hidayati, S.Pd."',
      '"024/FLS-SKW/IV/2026"',
      '"Koreografi kreasi corak Melayu-Dayak"'
    ],
    [
      '"Rizky Adiputra"',
      '"0097728192"',
      '"IX C"',
      '"Turnamen Sepak Bola Pelajar Piala Bupati (Tingkat Kabupaten)"',
      '"Olahraga"',
      '"Beregu (Tim / Kelompok)"',
      '"Sepak Bola Pelajar U-15"',
      '"Kabupaten"',
      '"Juara 1 (Emas)"',
      '"Disporapar & PSSI Kabupaten"',
      '"2026-06-20"',
      '"2025/2026"',
      '"Agus Salim, S.Pd."',
      '"055/ASKAB-PELAJAR/VI/2026"',
      '"Pencetak gol terbanyak turnamen"'
    ]
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Template_Data_Prestasi_SMPN1_Pontianak.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parser file CSV impor untuk data prestasi siswa
 */
export function parseCSVImport(csvText: string): PrestasiSiswa[] {
  if (!csvText) return [];
  
  // Clean BOM if present
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: PrestasiSiswa[] = [];

  // Helper to split CSV row respecting double quotes
  const parseCSVLine = (line: string): string[] => {
    const entries: string[] = [];
    let current = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        entries.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    entries.push(current.trim());
    return entries;
  };

  // Start from line 1 (skipping header)
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (!cols[0] || cols[0].length === 0) continue;

    const namaSiswa = cols[0] || 'Nama Siswa';
    const nisn = cols[1] || '';
    const kelas = cols[2] || 'VII A';
    const namaLomba = cols[3] || 'Lomba Kesiswaan';
    const bidang = (cols[4] as BidangLomba) || 'Akademik';
    const jenisLomba = (cols[5] as JenisLomba) || 'Individu (Perorangan)';
    const cabangLomba = cols[6] || namaLomba;
    const tingkat = (cols[7] as TingkatPerlombaan) || 'Kota Pontianak';
    const capaian = (cols[8] as CapaianPrestasi) || 'Juara 1 (Emas)';
    const penyelenggara = cols[9] || 'Dinas Pendidikan dan Kebudayaan Kota Pontianak';
    const tanggal = cols[10] || new Date().toISOString().split('T')[0];
    const tahunAjaran = cols[11] || '2025/2026';
    const guruPembimbing = cols[12] || 'Guru Pembimbing SMPN 1 Pontianak';
    const nomorSertifikat = cols[13] || '-';
    const catatan = cols[14] || '';

    const poin = hitungPoinPrestasi(tingkat, capaian);

    results.push({
      id: `SMPN1-PTK-IMP-${Date.now().toString(36)}-${i}`,
      namaSiswa,
      nisn,
      kelas,
      namaLomba,
      bidang,
      jenisLomba,
      cabangLomba,
      tingkat,
      capaian,
      penyelenggara,
      tanggal,
      tahunAjaran,
      guruPembimbing,
      nomorSertifikat,
      poinPrestasi: poin,
      catatan,
      terverifikasi: true,
      createdAt: new Date().toISOString()
    });
  }

  return results;
}
