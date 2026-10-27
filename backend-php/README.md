# PANDUAN INTEGRASI BACKEND PHP + MYSQL
## SIMPRES SMP NEGERI 1 PONTIANAK

Backend ini dibuat untuk menghubungkan aplikasi web **SIMPRES (Sistem Informasi Prestasi Siswa)** dengan server lokal (XAMPP / Laragon) maupun server online (Hosting cPanel sekolah / VPS).

---

### 📂 Struktur Berkas
- `database.sql` : Skrip pembuatan database MySQL `db_prestasi_smpn1`, tabel `prestasi_siswa`, dan data awal resmi SMPN 1 Pontianak.
- `koneksi.php`  : Konfigurasi koneksi database menggunakan PDO dengan proteksi SQL Injection dan header CORS.
- `api.php`      : REST API lengkap (GET, POST, DELETE, filter, dan sinkronisasi data online).

---

### 🚀 Cara Pasang di Server Lokal (XAMPP / Laragon)

1. **Nyalakan Apache & MySQL** pada XAMPP Control Panel.
2. **Import Database:**
   - Buka browser ke: `http://localhost/phpmyadmin`
   - Klik tab **Import** > Pilih berkas `database.sql` > Klik **Import** (atau buat database baru bernama `db_prestasi_smpn1` lalu import skrip).
3. **Salin Berkas PHP:**
   - Buat folder baru di dalam folder `htdocs`, misal: `C:\xampp\htdocs\prestasi\`
   - Masukkan berkas `koneksi.php` dan `api.php` ke dalam folder tersebut.
4. **Uji Coba API:**
   - Buka di browser: `http://localhost/prestasi/api.php`
   - Jika berhasil, Anda akan melihat data JSON berisi daftar prestasi siswa SMPN 1 Pontianak.
5. **Hubungkan ke Aplikasi Web:**
   - Di aplikasi web SIMPRES, buka menu **Akses Google / Cloud & MySQL** > Pilih tab **Server PHP + MySQL**.
   - Masukkan URL API: `http://localhost/prestasi/api.php`
   - Klik **Uji Koneksi** dan **Muat dari Server MySQL**.

---

### 🌐 Cara Pasang di cPanel Hosting Sekolah (Online)

1. **Buat Database MySQL di cPanel:**
   - Masuk ke cPanel hosting website sekolah Anda.
   - Buka menu **MySQL Databases** > Buat database baru (misal: `u123_prestasi`).
   - Buat user database baru dan berikan hak akses **ALL PRIVILEGES**.
2. **Import Data:**
   - Buka menu **phpMyAdmin** di cPanel.
   - Pilih database yang baru dibuat, klik **Import**, lalu unggah `database.sql`.
3. **Konfigurasi `koneksi.php`:**
   - Buka berkas `koneksi.php`, sesuaikan nama database, user, dan password:
     ```php
     $db_host = "localhost";
     $db_name = "nama_database_cpanel_anda";
     $db_user = "user_database_cpanel_anda";
     $db_pass = "password_database_anda";
     ```
4. **Unggah Berkas ke Hosting:**
   - Menggunakan **File Manager** cPanel, unggah `koneksi.php` dan `api.php` ke folder publik (misalnya folder `public_html/api/`).
5. **Hubungkan ke Aplikasi Web:**
   - Masukkan URL endpoint online Anda (contoh: `https://smpn1pontianak.sch.id/api/api.php`) pada menu sinkronisasi aplikasi.

---

### 📡 Daftar Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api.php` | Mengambil seluruh data prestasi dalam format JSON |
| `GET` | `/api.php?stats=true` | Mengambil ringkasan statistik dan jumlah medali |
| `GET` | `/api.php?id={ID}` | Mengambil detail 1 data prestasi siswa |
| `GET` | `/api.php?tingkat=Nasional` | Mengambil data berdasarkan tingkatan lomba |
| `POST` | `/api.php` | Menyimpan data prestasi baru atau pembaruan (upsert) |
| `DELETE` | `/api.php?id={ID}` | Menghapus 1 data prestasi dari database |
