<?php
/**
 * ============================================================================
 * REST API ENDPOINT PHP + MYSQL
 * SIMPRES SMP NEGERI 1 PONTIANAK
 * ============================================================================
 * Menyediakan layanan CRUD (Create, Read, Update, Delete) & Sinkronisasi
 * Kompatibel dengan aplikasi frontend React, Google Spreadsheet, dan cPanel
 * ============================================================================
 */

require_once __DIR__ . '/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ----------------------------------------------------------------------------
// METHOD: GET (Membaca Data Prestasi & Statistik)
// ----------------------------------------------------------------------------
if ($method === 'GET') {
    try {
        // 1. Endpoint Statistik Cepat
        if ($action === 'stats') {
            $totalStmt = $pdo->query("SELECT COUNT(*) AS total FROM prestasi_siswa");
            $total = (int)$totalStmt->fetch()['total'];

            $emasStmt = $pdo->query("SELECT COUNT(*) AS emas FROM prestasi_siswa WHERE capaian LIKE '%Juara 1%' OR capaian LIKE '%Emas%'");
            $emas = (int)$emasStmt->fetch()['emas'];

            $bidangStmt = $pdo->query("SELECT bidang, COUNT(*) as jumlah FROM prestasi_siswa GROUP BY bidang");
            $bidangData = $bidangStmt->fetchAll();

            $tingkatStmt = $pdo->query("SELECT tingkat, COUNT(*) as jumlah FROM prestasi_siswa GROUP BY tingkat");
            $tingkatData = $tingkatStmt->fetchAll();

            echo json_encode([
                "status" => "success",
                "stats"  => [
                    "total"       => $total,
                    "emas"        => $emas,
                    "bidangData"  => $bidangData,
                    "tingkatData" => $tingkatData
                ]
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit();
        }

        // 2. Mengambil Detail 1 Prestasi berdasarkan ID
        if (isset($_GET['id']) && !empty($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM prestasi_siswa WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $item = $stmt->fetch();

            if ($item) {
                echo json_encode([
                    "status" => "success",
                    "data"   => formatPrestasiItem($item)
                ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Data tidak ditemukan"]);
            }
            exit();
        }

        // 3. Mengambil Semua Data Prestasi (dengan filter opsional)
        $sql = "SELECT * FROM prestasi_siswa WHERE 1=1";
        $params = [];

        if (!empty($_GET['tingkat']) && $_GET['tingkat'] !== 'SEMUA') {
            $sql .= " AND tingkat = ?";
            $params[] = $_GET['tingkat'];
        }
        if (!empty($_GET['bidang']) && $_GET['bidang'] !== 'SEMUA') {
            $sql .= " AND bidang = ?";
            $params[] = $_GET['bidang'];
        }
        if (!empty($_GET['tahunAjaran']) && $_GET['tahunAjaran'] !== 'SEMUA') {
            $sql .= " AND tahun_ajaran = ?";
            $params[] = $_GET['tahunAjaran'];
        }
        if (!empty($_GET['q'])) {
            $sql .= " AND (nama_siswa LIKE ? OR nama_lomba LIKE ? OR cabang_lomba LIKE ?)";
            $searchTerm = '%' . $_GET['q'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY tanggal DESC, created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $data = array_map('formatPrestasiItem', $rows);

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

// ----------------------------------------------------------------------------
// METHOD: POST (Simpan Baru, Edit Upsert, atau Sinkronisasi Massal)
// ----------------------------------------------------------------------------
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format JSON payload tidak valid"]);
        exit();
    }

    // 1. Aksi Autentikasi Login Admin
    if ($action === 'login' || (isset($input['action']) && $input['action'] === 'login')) {
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if ($username === 'admin' && $password === 'admin') {
            echo json_encode([
                "status"  => "success",
                "message" => "Login administrator berhasil",
                "token"   => "smpn1-ptk-token-" . bin2hex(random_bytes(16)),
                "user"    => [
                    "username" => "admin",
                    "nama"     => "Antonius Subrata, S.Pd. (Wakakesiswaan SMPN 1 Pontianak)",
                    "role"     => "admin"
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Username atau password salah"]);
        }
        exit();
    }

    // 2. Aksi Sinkronisasi atau Simpan Data Prestasi
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
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------------------------------
// METHOD: DELETE (Menghapus Data Prestasi)
// ----------------------------------------------------------------------------
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
            "message" => "Data prestasi ID {$id} berhasil dihapus dari database MySQL"
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// ----------------------------------------------------------------------------
// Helper Function: Konversi Kolom DB snake_case ke camelCase untuk Frontend React
// ----------------------------------------------------------------------------
function formatPrestasiItem($row) {
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
}
