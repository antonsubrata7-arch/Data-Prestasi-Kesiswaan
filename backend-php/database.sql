-- ============================================================================
-- DATABASE SKRIP: SIMPRES SMP NEGERI 1 PONTIANAK (PHP + MySQL)
-- ============================================================================
-- Karakteristik: UTF8MB4, Engine InnoDB, Relasi Terstruktur & Aman
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `db_prestasi_smpn1` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_prestasi_smpn1`;

-- ----------------------------------------------------------------------------
-- 1. Tabel: users (Autentikasi Administrator)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'operator', 'kepala_sekolah') DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kredensial default: username 'admin', password 'admin' (menggunakan MD5 dan hash standar)
INSERT INTO `users` (`username`, `password`, `nama_lengkap`, `role`) VALUES
('admin', '$2y$10$wT2lM8pmsKz17UqFwU1/eeu8B1yXkGkGgHj8dC6r/9VzS.HhE1X7G', 'Antonius Subrata, S.Pd. (Wakakesiswaan SMPN 1)', 'admin');

-- ----------------------------------------------------------------------------
-- 2. Tabel: prestasi_siswa (Data Hasil Perlombaan)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `prestasi_siswa`;
CREATE TABLE `prestasi_siswa` (
  `id` VARCHAR(60) NOT NULL PRIMARY KEY,
  `nama_siswa` VARCHAR(150) NOT NULL,
  `nisn` VARCHAR(20) DEFAULT '',
  `kelas` VARCHAR(50) DEFAULT '',
  `nama_lomba` VARCHAR(255) NOT NULL,
  `bidang` VARCHAR(50) NOT NULL,
  `jenis_lomba` VARCHAR(50) DEFAULT 'Individu (Perorangan)',
  `cabang_lomba` VARCHAR(100) DEFAULT '',
  `tingkat` VARCHAR(100) NOT NULL,
  `capaian` VARCHAR(100) NOT NULL,
  `penyelenggara` VARCHAR(255) DEFAULT '',
  `tanggal` DATE NOT NULL,
  `tahun_ajaran` VARCHAR(20) NOT NULL,
  `guru_pembimbing` VARCHAR(150) DEFAULT '',
  `nomor_sertifikat` VARCHAR(100) DEFAULT '',
  `poin_prestasi` INT DEFAULT 0,
  `catatan` TEXT DEFAULT NULL,
  `foto_dokumentasi` TEXT DEFAULT NULL,
  `terverifikasi` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tingkat` (`tingkat`),
  INDEX `idx_bidang` (`bidang`),
  INDEX `idx_tahun` (`tahun_ajaran`),
  INDEX `idx_tanggal` (`tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Data Awal Resmi (Seed Data SMPN 1 Pontianak)
-- ----------------------------------------------------------------------------
INSERT INTO `prestasi_siswa` 
(`id`, `nama_siswa`, `nisn`, `kelas`, `nama_lomba`, `bidang`, `jenis_lomba`, `cabang_lomba`, `tingkat`, `capaian`, `penyelenggara`, `tanggal`, `tahun_ajaran`, `guru_pembimbing`, `nomor_sertifikat`, `poin_prestasi`, `catatan`, `terverifikasi`)
VALUES
('SMPN1-PTK-2026-001', 'Muhammad Fadhil Al-Farisi', '0098234121', 'IX Unggulan A', 'Olimpiade Sains Nasional (OSN) Jenjang SMP Tingkat Kota Pontianak', 'Akademik', 'Individu (Perorangan)', 'IPA Terpadu (Fisika & Biologi)', 'Kota Pontianak', 'Juara 1 (Emas)', 'Dinas Pendidikan dan Kebudayaan Kota Pontianak & Balai Pengembangan Talenta Indonesia', '2026-05-18', '2025/2026', 'Drs. Hendra Setiawan, M.Pd.', '421.3/0892/DISDIK-PTK/OSN/2026', 20, 'Lolos mewakili Kota Pontianak ke tingkat Provinsi Kalimantan Barat.', 1),

('SMPN1-PTK-2026-002', 'Siti Najwa Aulia & Tim Tari Spensa', '0101823901', 'VIII C', 'Festival dan Lomba Seni Siswa Nasional (FLS2N) SMP', 'Seni & Budaya', 'Beregu (Tim / Kelompok)', 'Kreativitas Tari Tradisional Nusantara (Corak Melayu & Dayak Kalbar)', 'Provinsi Kalimantan Barat', 'Juara 1 (Emas)', 'Dinas Pendidikan dan Kebudayaan Provinsi Kalimantan Barat', '2026-06-12', '2025/2026', 'Nurul Hidayati, S.Pd., M.Sn.', '420/FLS2N-SMP/KALBAR/VI/2026', 30, 'Membawakan tari garapan "Harmoni Khatulistiwa" dan berhak maju ke FLS2N Tingkat Nasional.', 1),

('SMPN1-PTK-2026-003', 'Bagus Pratama Wijaya', '0097728192', 'IX B', 'Pekan Olahraga Pelajar Daerah (POPDA) Kota Pontianak', 'Olahraga', 'Individu (Perorangan)', 'Renang 100 Meter Gaya Bebas & 50 Meter Gaya Kupu-Kupu', 'Kota Pontianak', 'Juara 1 (Emas)', 'Disporapar Kota Pontianak & PRSI Pontianak', '2026-04-20', '2025/2026', 'Bambang Supriyadi, S.Pd.Jas.', '800/DISPORA-PTK/POPDA/04/2026', 20, 'Memecahkan rekor waktu kejuaraan renang antar-pelajar SMP se-Kota Pontianak.', 1),

('SMPN1-PTK-2026-004', 'Clarissa Aurelia Chandra', '0104518290', 'VIII A', 'National English Speech & Storytelling Competition for Junior High School', 'Akademik', 'Individu (Perorangan)', 'Storytelling & Speech Bahasa Inggris', 'Nasional', 'Juara 2 (Perak)', 'Pusat Prestasi Nasional (Puspresnas) & Universitas Indonesia', '2026-03-15', '2025/2026', 'Yuliana Kristanti, S.Pd.', 'UI-PEXT/ENG-COMP/2026/041', 35, 'Membawakan narasi legenda Sungai Kapuas dalam bahasa Inggris fasih.', 1),

('SMPN1-PTK-2026-005', 'Rizky Ramadhani Pratama', '0091129845', 'IX E', 'Kompetisi Robotika Remaja & STEM Inovasi Borneo', 'Teknologi & Riset', 'Beregu (Tim / Kelompok)', 'Line Follower Microcontroller & Eco-IoT Sensor', 'Provinsi Kalimantan Barat', 'Juara 1 (Emas)', 'Fakultas Teknik Universitas Tanjungpura (UNTAN)', '2026-02-28', '2025/2026', 'Achmad Faisal, S.T., Gr.', '129/FT-UNTAN/STEM-ROBOT/2026', 30, 'Inovasi prototype pemantau kualitas air Sungai Kapuas berbasis mikrokontroler.', 1),

('SMPN1-PTK-2026-006', 'Ahmad Zaki Mubarak', '0103348190', 'VII A', 'Musabaqah Tilawatil Quran (MTQ) Pelajar SMP Tingkat Kota Pontianak', 'Keagamaan', 'Individu (Perorangan)', 'Tilawah & Hifdzil Quran 5 Juz', 'Kota Pontianak', 'Juara 1 (Emas)', 'Lembaga Pengembangan Tilawatil Quran (LPTQ) & Kemenag Kota Pontianak', '2026-03-02', '2025/2026', 'Ust. M. Syukri S.Pd.I.', '088/LPTQ-PTK/MTQ-SMP/2026', 20, 'Mendapat apresiasi tinggi dari dewan hakim cabang Tilawah remaja.', 1),

('SMPN1-PTK-2026-007', 'Kezia Gracia Simanjuntak', '0096671234', 'IX C', 'Southeast Asian Mathematics Olympiad (SEAMO) Regional Kalimantan', 'Akademik', 'Individu (Perorangan)', 'Matematika Terapan & Logika Analitik', 'Internasional', 'Juara 3 (Perunggu)', 'SEAMO Committee & Terry Chew Academy Singapore', '2026-01-22', '2025/2026', 'Drs. Hendra Setiawan, M.Pd.', 'SEAMO-REG/ID-KALBAR/2026/902', 45, 'Meraih Bronze Medal bersaing dengan perwakilan sekolah se-Asia Tenggara.', 1);
