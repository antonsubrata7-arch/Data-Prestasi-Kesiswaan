export type BidangLomba = 
  | 'Akademik'
  | 'Olahraga'
  | 'Seni & Budaya'
  | 'Teknologi & Riset'
  | 'Keagamaan'
  | 'Lainnya'
  | (string & {});

export type TingkatPerlombaan = 
  | 'Kecamatan'
  | 'Kota Pontianak'
  | 'Kota Singkawang'
  | 'Kabupaten'
  | 'Provinsi Kalimantan Barat'
  | 'Nasional'
  | 'Internasional';

export type CapaianPrestasi = 
  | 'Juara 1 (Emas)'
  | 'Juara 2 (Perak)'
  | 'Juara 3 (Perunggu)'
  | 'Harapan 1'
  | 'Harapan 2'
  | 'Harapan 3'
  | 'Finalis / Apresiasi';

export type JenisLomba = 
  | 'Individu (Perorangan)'
  | 'Beregu (Tim / Kelompok)'
  | 'Ganda (Pasangan)';

export interface PrestasiSiswa {
  id: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  namaLomba: string;
  bidang: BidangLomba;
  jenisLomba: JenisLomba;
  cabangLomba: string;
  tingkat: TingkatPerlombaan;
  capaian: CapaianPrestasi;
  penyelenggara: string;
  tanggal: string; // YYYY-MM-DD
  tahunAjaran: string; // e.g. "2025/2026", "2026/2027"
  guruPembimbing: string;
  nomorSertifikat: string;
  poinPrestasi: number;
  catatan?: string;
  fotoDokumentasi?: string;
  terverifikasi: boolean;
  createdAt: string;
}

export type ViewSubHalaman = 
  | 'dashboard'
  | 'rekap-hasil'
  | 'papan-kejuaraan'
  | 'laporan-resmi';

export interface FilterPrestasiState {
  searchQuery: string;
  tingkat: string;
  bidang: string;
  jenisLomba?: string;
  capaian: string;
  tahunAjaran: string;
  kelas: string;
}
