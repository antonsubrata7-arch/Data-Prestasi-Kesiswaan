import { PrestasiSiswa } from '../types/prestasi';

/**
 * Mengunduh berkas SQL dengan skrip database dan seluruh data prestasi saat ini
 */
export function downloadDatabaseSQL(data: PrestasiSiswa[]) {
  const sqlHeader = `-- ============================================================================
-- DATABASE SKRIP: SIMPRES SMP NEGERI 1 PONTIANAK (PHP + MySQL)
-- Diekspor pada: ${new Date().toLocaleString('id-ID')}
-- ============================================================================

CREATE DATABASE IF NOT EXISTS \`db_prestasi_smpn1\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`db_prestasi_smpn1\`;

DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`nama_lengkap\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('admin', 'operator', 'kepala_sekolah') DEFAULT 'admin',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`users\` (\`username\`, \`password\`, \`nama_lengkap\`, \`role\`) VALUES
('admin', '$2y$10$wT2lM8pmsKz17UqFwU1/eeu8B1yXkGkGgHj8dC6r/9VzS.HhE1X7G', 'Antonius Subrata, S.Pd. (Wakakesiswaan SMPN 1)', 'admin');

DROP TABLE IF EXISTS \`prestasi_siswa\`;
CREATE TABLE \`prestasi_siswa\` (
  \`id\` VARCHAR(60) NOT NULL PRIMARY KEY,
  \`nama_siswa\` VARCHAR(150) NOT NULL,
  \`nisn\` VARCHAR(20) DEFAULT '',
  \`kelas\` VARCHAR(50) DEFAULT '',
  \`nama_lomba\` VARCHAR(255) NOT NULL,
  \`bidang\` VARCHAR(50) NOT NULL,
  \`jenis_lomba\` VARCHAR(50) DEFAULT 'Individu (Perorangan)',
  \`cabang_lomba\` VARCHAR(100) DEFAULT '',
  \`tingkat\` VARCHAR(100) NOT NULL,
  \`capaian\` VARCHAR(100) NOT NULL,
  \`penyelenggara\` VARCHAR(255) DEFAULT '',
  \`tanggal\` DATE NOT NULL,
  \`tahun_ajaran\` VARCHAR(20) NOT NULL,
  \`guru_pembimbing\` VARCHAR(150) DEFAULT '',
  \`nomor_sertifikat\` VARCHAR(100) DEFAULT '',
  \`poin_prestasi\` INT DEFAULT 0,
  \`catatan\` TEXT DEFAULT NULL,
  \`foto_dokumentasi\` TEXT DEFAULT NULL,
  \`terverifikasi\` TINYINT(1) DEFAULT 1,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_tingkat\` (\`tingkat\`),
  INDEX \`idx_bidang\` (\`bidang\`),
  INDEX \`idx_tahun\` (\`tahun_ajaran\`),
  INDEX \`idx_tanggal\` (\`tanggal\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  let sqlInserts = '';
  if (data && data.length > 0) {
    sqlInserts = `INSERT INTO \`prestasi_siswa\` 
(\`id\`, \`nama_siswa\`, \`nisn\`, \`kelas\`, \`nama_lomba\`, \`bidang\`, \`jenis_lomba\`, \`cabang_lomba\`, \`tingkat\`, \`capaian\`, \`penyelenggara\`, \`tanggal\`, \`tahun_ajaran\`, \`guru_pembimbing\`, \`nomor_sertifikat\`, \`poin_prestasi\`, \`catatan\`, \`terverifikasi\`)
VALUES\n`;

    const rowStrings = data.map(item => {
      const escapeStr = (val: string = '') => "'" + val.replace(/'/g, "''") + "'";
      return `(${escapeStr(item.id)}, ${escapeStr(item.namaSiswa)}, ${escapeStr(item.nisn)}, ${escapeStr(item.kelas)}, ${escapeStr(item.namaLomba)}, ${escapeStr(item.bidang)}, ${escapeStr(item.jenisLomba)}, ${escapeStr(item.cabangLomba)}, ${escapeStr(item.tingkat)}, ${escapeStr(item.capaian)}, ${escapeStr(item.penyelenggara)}, ${escapeStr(item.tanggal)}, ${escapeStr(item.tahunAjaran)}, ${escapeStr(item.guruPembimbing)}, ${escapeStr(item.nomorSertifikat)}, ${Number(item.poinPrestasi) || 0}, ${escapeStr(item.catatan || '')}, 1)`;
    });

    sqlInserts += rowStrings.join(',\n') + ';\n';
  }

  const fullSQL = sqlHeader + sqlInserts;
  triggerFileDownload('database_prestasi_smpn1.sql', fullSQL, 'text/sql');
}

/**
 * Mengunduh berkas koneksi.php
 */
export function downloadKoneksiPHP() {
  const content = `<?php
/**
 * KONEKSI DATABASE & HEADER CORS (PHP + MySQL PDO)
 * SIMPRES SMP NEGERI 1 PONTIANAK
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = "localhost";
$db_name = "db_prestasi_smpn1";
$db_user = "root";
$db_pass = "";

try {
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Koneksi ke database MySQL gagal: " . $e->getMessage()
    ]);
    exit();
}
`;
  triggerFileDownload('koneksi.php', content, 'application/x-php');
}

/**
 * Mengunduh berkas api.php
 */
export function downloadApiPHP() {
  const content = `<?php
/**
 * REST API ENDPOINT PHP + MYSQL
 * SIMPRES SMP NEGERI 1 PONTIANAK
 */

require_once __DIR__ . '/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'GET') {
    try {
        if ($action === 'ping') {
            echo json_encode(["status" => "success", "message" => "Server PHP + MySQL terhubung dengan baik!"]);
            exit();
        }

        $sql = "SELECT * FROM prestasi_siswa WHERE 1=1 ORDER BY tanggal DESC, created_at DESC";
        $stmt = $pdo->query($sql);
        $rows = $stmt->fetchAll();

        $data = array_map(function($row) {
            return [
                'id'              => $row['id'],
                'namaSiswa'       => $row['nama_siswa'],
                'nisn'            => $row['nisn'],
                'kelas'           => $row['kelas'],
                'namaLomba'       => $row['nama_lomba'],
                'bidang'          => $row['bidang'],
                'jenisLomba'      => $row['jenis_lomba'],
                'cabangLomba'     => $row['cabang_lomba'],
                'tingkat'         => $row['tingkat'],
                'capaian'         => $row['capaian'],
                'penyelenggara'   => $row['penyelenggara'],
                'tanggal'         => $row['tanggal'],
                'tahunAjaran'     => $row['tahun_ajaran'],
                'guruPembimbing'  => $row['guru_pembimbing'],
                'nomorSertifikat' => $row['nomor_sertifikat'],
                'poinPrestasi'    => (int)$row['poin_prestasi'],
                'catatan'         => $row['catatan'] ?? '',
                'fotoDokumentasi' => $row['foto_dokumentasi'] ?? '',
                'terverifikasi'   => (bool)$row['terverifikasi'],
                'createdAt'       => $row['created_at']
            ];
        }, $rows);

        echo json_encode([
            "status" => "success",
            "total"  => count($data),
            "data"   => $data
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format JSON payload tidak valid"]);
        exit();
    }

    try {
        $items = isset($input[0]) && is_array($input[0]) ? $input : [$input];

        $stmt = $pdo->prepare("
            INSERT INTO prestasi_siswa (
                id, nama_siswa, nisn, kelas, nama_lomba, bidang, 
                jenis_lomba, cabang_lomba, tingkat, capaian, penyelenggara, 
                tanggal, tahun_ajaran, guru_pembimbing, nomor_sertifikat, 
                poin_prestasi, catatan, foto_dokumentasi, terverifikasi
            ) VALUES (
                :id, :nama_siswa, :nisn, :kelas, :nama_lomba, :bidang,
                :jenis_lomba, :cabang_lomba, :tingkat, :capaian, :penyelenggara,
                :tanggal, :tahun_ajaran, :guru_pembimbing, :nomor_sertifikat,
                :poin_prestasi, :catatan, :foto_dokumentasi, :terverifikasi
            )
            ON DUPLICATE KEY UPDATE
                nama_siswa       = VALUES(nama_siswa),
                nisn             = VALUES(nisn),
                kelas            = VALUES(kelas),
                nama_lomba       = VALUES(nama_lomba),
                bidang           = VALUES(bidang),
                jenis_lomba      = VALUES(jenis_lomba),
                cabang_lomba     = VALUES(cabang_lomba),
                tingkat          = VALUES(tingkat),
                capaian          = VALUES(capaian),
                penyelenggara    = VALUES(penyelenggara),
                tanggal          = VALUES(tanggal),
                tahun_ajaran     = VALUES(tahun_ajaran),
                guru_pembimbing  = VALUES(guru_pembimbing),
                nomor_sertifikat = VALUES(nomor_sertifikat),
                poin_prestasi    = VALUES(poin_prestasi),
                catatan          = VALUES(catatan),
                foto_dokumentasi = VALUES(foto_dokumentasi),
                terverifikasi    = VALUES(terverifikasi)
        ");

        $pdo->beginTransaction();
        $savedCount = 0;

        foreach ($items as $item) {
            $id = $item['id'] ?? ('SMPN1-' . round(microtime(true) * 1000) . '-' . mt_rand(100, 999));
            $tanggal = !empty($item['tanggal']) ? substr($item['tanggal'], 0, 10) : date('Y-m-d');

            $stmt->execute([
                ':id'               => $id,
                ':nama_siswa'       => $item['namaSiswa'] ?? $item['nama_siswa'] ?? 'Tanpa Nama',
                ':nisn'             => $item['nisn'] ?? '',
                ':kelas'            => $item['kelas'] ?? '',
                ':nama_lomba'       => $item['namaLomba'] ?? $item['nama_lomba'] ?? 'Perlombaan',
                ':bidang'           => $item['bidang'] ?? 'Lainnya',
                ':jenis_lomba'      => $item['jenisLomba'] ?? $item['jenis_lomba'] ?? 'Individu (Perorangan)',
                ':cabang_lomba'     => $item['cabangLomba'] ?? $item['cabang_lomba'] ?? '',
                ':tingkat'          => $item['tingkat'] ?? 'Kota Pontianak',
                ':capaian'          => $item['capaian'] ?? 'Juara 1 (Emas)',
                ':penyelenggara'    => $item['penyelenggara'] ?? '',
                ':tanggal'          => $tanggal,
                ':tahun_ajaran'     => $item['tahunAjaran'] ?? $item['tahun_ajaran'] ?? '2025/2026',
                ':guru_pembimbing'  => $item['guruPembimbing'] ?? $item['guru_pembimbing'] ?? '',
                ':nomor_sertifikat' => $item['nomorSertifikat'] ?? $item['nomor_sertifikat'] ?? '',
                ':poin_prestasi'    => (int)($item['poinPrestasi'] ?? $item['poin_prestasi'] ?? 0),
                ':catatan'          => $item['catatan'] ?? '',
                ':foto_dokumentasi' => $item['fotoDokumentasi'] ?? $item['foto_dokumentasi'] ?? '',
                ':terverifikasi'    => isset($item['terverifikasi']) ? ($item['terverifikasi'] ? 1 : 0) : 1
            ]);
            $savedCount++;
        }

        $pdo->commit();

        echo json_encode([
            "status"  => "success",
            "message" => "Berhasil menyimpan {$savedCount} data prestasi ke MySQL",
            "count"   => $savedCount
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        $id = $input['id'] ?? null;
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Parameter ID prestasi wajib disertakan"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM prestasi_siswa WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode([
            "status"  => "success",
            "message" => "Data ID {$id} berhasil dihapus dari MySQL"
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
`;
  triggerFileDownload('api.php', content, 'application/x-php');
}

function triggerFileDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
