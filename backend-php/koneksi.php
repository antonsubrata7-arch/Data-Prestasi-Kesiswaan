<?php
/**
 * ============================================================================
 * KONEKSI DATABASE & HEADER CORS (PHP + MySQL PDO)
 * SIMPRES SMP NEGERI 1 PONTIANAK
 * ============================================================================
 */

// 1. Konfigurasi Header CORS agar dapat diakses dari Web Frontend (React / Vercel / Localhost)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Menangani permintaan OPTIONS preflight browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Pengaturan Parameter Database MySQL
// Sesuaikan dengan konfigurasi server XAMPP / cPanel hosting Anda
$db_host = "localhost";
$db_name = "db_prestasi_smpn1";
$db_user = "root";       // Default XAMPP: root. Pada cPanel: user database Anda
$db_pass = "";           // Default XAMPP: kosong (""). Pada cPanel: password database Anda

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
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}
