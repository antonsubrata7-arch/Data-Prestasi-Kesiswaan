/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - BACKEND API UNTUK SIMPRES SMPN 1 PONTIANAK
 * ============================================================================
 * Petunjuk Pemasangan di Google Spreadsheet:
 * 1. Buka Google Spreadsheet baru di Google Drive Anda.
 * 2. Pada menu atas, klik "Extensions" (Ekstensi) > "Apps Script".
 * 3. Hapus semua kode default, lalu salin (copy) dan tempel (paste) seluruh kode ini.
 * 4. Klik ikon Simpan (Floppy Disk).
 * 5. Klik "Deploy" (Penerapan) > "New deployment" (Penerapan baru).
 * 6. Pilih jenis: "Web app" (Aplikasi web).
 * 7. Isi Deskripsi (misal: "API Prestasi v1").
 * 8. Execute as: "Me" (Saya).
 * 9. Who has access: "Anyone" (Siapa saja - agar aplikasi web dapat membaca/menulis).
 * 10. Klik "Deploy", berikan izin akses (Authorize access), lalu salin URL Web App yang dihasilkan.
 * ============================================================================
 */

const SHEET_NAME = "Data_Prestasi";

/**
 * Menangani permintaan GET (Membaca data prestasi dari Spreadsheet)
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    
    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = rows[0];
    const data = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const item = {};
      for (let j = 0; j < headers.length; j++) {
        let headerKey = headers[j].toString().trim().toLowerCase().replace(/\s+/g, '_');
        item[headerKey] = row[j];
      }
      data.push(item);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", data: data }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Menangani permintaan POST (Menyimpan / Menambah data prestasi baru ke Spreadsheet)
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const postData = JSON.parse(e.postData.contents);
    
    // Jika data berupa array (sinkronisasi massal) atau objek tunggal
    const items = Array.isArray(postData) ? postData : [postData];
    
    items.forEach(item => {
      sheet.appendRow([
        item.id || ('SMPN1-' + Date.now() + '-' + Math.floor(Math.random()*1000)),
        item.namaSiswa || '',
        item.nisn || '',
        item.kelas || '',
        item.namaLomba || '',
        item.bidang || '',
        item.jenisLomba || '',
        item.cabangLomba || '',
        item.tingkat || '',
        item.capaian || '',
        item.penyelenggara || '',
        item.tanggal || '',
        item.tahunAjaran || '',
        item.guruPembimbing || '',
        item.nomorSertifikat || '',
        item.poinPrestasi || 0,
        item.catatan || '',
        new Date().toISOString()
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Data berhasil disimpan ke Spreadsheet!" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi helper untuk memastikan sheet dan header tersedia
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Buat Header Tabel Standar Kesiswaan SMPN 1 Pontianak
    const headers = [
      "ID",
      "Nama Siswa",
      "NISN",
      "Kelas",
      "Nama Lomba",
      "Bidang",
      "Jenis Lomba",
      "Cabang Lomba",
      "Tingkat",
      "Capaian",
      "Penyelenggara",
      "Tanggal",
      "Tahun Ajaran",
      "Guru Pembimbing",
      "No Sertifikat",
      "Poin Prestasi",
      "Catatan",
      "Created At"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
  }
  
}
