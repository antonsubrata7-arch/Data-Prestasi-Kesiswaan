import { getAccessToken } from './googleAuth';
import { PrestasiSiswa, BidangLomba, JenisLomba, TingkatPerlombaan, CapaianPrestasi } from '../types/prestasi';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

// Extract Google Spreadsheet ID from URL or bare ID
export const extractSpreadsheetId = (input: string): string => {
  if (!input) return '';
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return input.trim();
};

export const SPREADSHEET_COLUMNS = [
  'No',
  'Nama Siswa',
  'NISN',
  'Kelas',
  'Nama Lomba',
  'Bidang',
  'Jenis Lomba',
  'Cabang Lomba',
  'Tingkat',
  'Capaian Prestasi',
  'Penyelenggara',
  'Tanggal Pelaksanaan',
  'Tahun Ajaran',
  'Guru Pembimbing',
  'Nomor Sertifikat',
  'Catatan',
  'Status Verifikasi',
  'ID Sistem'
];

/**
 * List spreadsheets from user's Google Drive
 */
export const listUserSpreadsheets = async (): Promise<DriveSpreadsheetFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum terhubung ke Google. Silakan masuk dengan Google terlebih dahulu.');
  }

  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,modifiedTime)&orderBy=modifiedTime%20desc&pageSize=25`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gagal memuat daftar Google Spreadsheet: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return (data.files || []) as DriveSpreadsheetFile[];
};

/**
 * Create a brand new Google Spreadsheet in user's Drive with official SMPN 1 Pontianak formatting
 */
export const createPrestasiSpreadsheet = async (title?: string): Promise<{ id: string; url: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum terhubung ke Google. Silakan login terlebih dahulu.');
  }

  const sheetTitle = 'Data Prestasi SMPN 1';
  const spreadsheetTitle = title || `Data Prestasi Siswa - SMP Negeri 1 Pontianak (${new Date().toLocaleDateString('id-ID')})`;

  const createPayload = {
    properties: {
      title: spreadsheetTitle,
    },
    sheets: [
      {
        properties: {
          title: sheetTitle,
          gridProperties: {
            frozenRowCount: 1,
            columnCount: SPREADSHEET_COLUMNS.length,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gagal membuat Google Spreadsheet baru: ${err}`);
  }

  const result = await response.json();
  const spreadsheetId = result.spreadsheetId;
  const sheetId = result.sheets?.[0]?.properties?.sheetId || 0;

  // Insert header row values
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:${String.fromCharCode(64 + SPREADSHEET_COLUMNS.length)}1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${sheetTitle}!A1:${String.fromCharCode(64 + SPREADSHEET_COLUMNS.length)}1`,
        majorDimension: 'ROWS',
        values: [SPREADSHEET_COLUMNS],
      }),
    }
  );

  // Apply styling to header: navy blue background, white bold text
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.11, green: 0.22, blue: 0.54 }, // SMPN 1 Pontianak Navy
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    bold: true,
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.warn('Optional batchUpdate styling skipped:', e);
  }

  return {
    id: spreadsheetId,
    url: result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
};

/**
 * Export/Sync prestasi items into a Google Spreadsheet
 */
export const exportPrestasiToSpreadsheet = async (
  spreadsheetInput: string,
  items: PrestasiSiswa[]
): Promise<{ rowCount: number; url: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum terhubung ke Google. Silakan masuk terlebih dahulu.');
  }

  const spreadsheetId = extractSpreadsheetId(spreadsheetInput);
  if (!spreadsheetId) {
    throw new Error('ID atau URL Google Spreadsheet tidak valid.');
  }

  // 1. Fetch spreadsheet metadata to get the first sheet's real title (Best Practice)
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Tidak dapat membuka spreadsheet (${metaRes.status}): ${errText}`);
  }

  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];
  if (sheets.length === 0) {
    throw new Error('Spreadsheet tidak memiliki lembar kerja (sheet).');
  }

  const firstSheetTitle = sheets[0]?.properties?.title || 'Sheet1';

  // 2. Clear old data from row 2 downwards or entire range
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}!A2:Z10000:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // 3. Write Header at A1
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}!A1:${String.fromCharCode(64 + SPREADSHEET_COLUMNS.length)}1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [SPREADSHEET_COLUMNS],
      }),
    }
  );

  // 4. Format rows from items (NO POIN/POINT column!)
  const rows = items.map((item, index) => [
    index + 1,
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
    item.catatan || '',
    item.terverifikasi ? 'Terverifikasi' : 'Belum Diverifikasi',
    item.id || ''
  ]);

  if (rows.length > 0) {
    const endColLetter = String.fromCharCode(64 + SPREADSHEET_COLUMNS.length);
    const range = `${firstSheetTitle}!A2:${endColLetter}${rows.length + 1}`;

    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: range,
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Gagal menyimpan baris data: ${err}`);
    }
  }

  return {
    rowCount: rows.length,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
};

/**
 * Read and import Prestasi records from a Google Spreadsheet
 */
export const readPrestasiFromSpreadsheet = async (
  spreadsheetInput: string
): Promise<{ items: PrestasiSiswa[]; sheetTitle: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum terhubung ke Google. Silakan masuk terlebih dahulu.');
  }

  const spreadsheetId = extractSpreadsheetId(spreadsheetInput);
  if (!spreadsheetId) {
    throw new Error('ID atau URL Google Spreadsheet tidak valid.');
  }

  // 1. Fetch metadata to get the first sheet's name
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Tidak dapat membuka spreadsheet (${metaRes.status}): ${errText}`);
  }

  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];
  if (sheets.length === 0) {
    throw new Error('Spreadsheet kosong atau tidak memiliki lembar kerja.');
  }

  const sheetTitle = sheets[0]?.properties?.title || 'Sheet1';

  // 2. Fetch all values
  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:Z1000`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!valuesRes.ok) {
    const err = await valuesRes.text();
    throw new Error(`Gagal membaca data dari spreadsheet: ${err}`);
  }

  const data = await valuesRes.json();
  const rawRows: any[][] = data.values || [];

  if (rawRows.length < 2) {
    return { items: [], sheetTitle };
  }

  // Find column indices by header row (case insensitive)
  const headerRow = rawRows[0].map((h: any) => String(h || '').trim().toLowerCase());
  
  const findCol = (keywords: string[]): number => {
    for (const kw of keywords) {
      const idx = headerRow.findIndex(h => h.includes(kw.toLowerCase()));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const colNama = findCol(['nama siswa', 'siswa', 'nama']);
  const colNisn = findCol(['nisn']);
  const colKelas = findCol(['kelas']);
  const colLomba = findCol(['nama lomba', 'lomba', 'kejuaraan', 'kegiatan']);
  const colBidang = findCol(['bidang']);
  const colJenis = findCol(['jenis lomba', 'jenis']);
  const colCabang = findCol(['cabang lomba', 'cabang']);
  const colTingkat = findCol(['tingkat']);
  const colCapaian = findCol(['capaian', 'juara', 'peringkat', 'prestasi']);
  const colPenyelenggara = findCol(['penyelenggara', 'instansi']);
  const colTanggal = findCol(['tanggal', 'tgl', 'waktu']);
  const colTahunAjaran = findCol(['tahun ajaran', 'tahun']);
  const colPembimbing = findCol(['guru pembimbing', 'pembimbing', 'pelatih']);
  const colSertifikat = findCol(['nomor sertifikat', 'no sertifikat', 'sertifikat']);
  const colCatatan = findCol(['catatan', 'keterangan']);
  const colId = findCol(['id sistem', 'id']);

  const parsedItems: PrestasiSiswa[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const namaSiswa = (colNama >= 0 ? row[colNama] : row[1]) || '';
    if (!namaSiswa || String(namaSiswa).trim() === '') {
      continue; // Skip blank rows
    }

    const id = (colId >= 0 ? row[colId] : row[17]) || `gsheet-${Date.now()}-${i}`;
    const nisn = String((colNisn >= 0 ? row[colNisn] : row[2]) || '');
    const kelas = String((colKelas >= 0 ? row[colKelas] : row[3]) || 'VIII A');
    const namaLomba = String((colLomba >= 0 ? row[colLomba] : row[4]) || 'Perlombaan');
    const bidang = (colBidang >= 0 ? row[colBidang] : row[5]) || 'Akademik';
    const jenisLomba = (colJenis >= 0 ? row[colJenis] : row[6]) || 'Individu (Perorangan)';
    const cabangLomba = String((colCabang >= 0 ? row[colCabang] : row[7]) || namaLomba);
    const tingkat = (colTingkat >= 0 ? row[colTingkat] : row[8]) || 'Kota Pontianak';
    const capaian = (colCapaian >= 0 ? row[colCapaian] : row[9]) || 'Juara 1 (Emas)';
    const penyelenggara = String((colPenyelenggara >= 0 ? row[colPenyelenggara] : row[10]) || 'Dinas Pendidikan');
    
    let tanggal = String((colTanggal >= 0 ? row[colTanggal] : row[11]) || new Date().toISOString().split('T')[0]);
    if (tanggal.includes('/')) {
      const parts = tanggal.split('/');
      if (parts.length === 3) {
        // e.g. DD/MM/YYYY
        tanggal = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    const tahunAjaran = String((colTahunAjaran >= 0 ? row[colTahunAjaran] : row[12]) || '2025/2026');
    const guruPembimbing = String((colPembimbing >= 0 ? row[colPembimbing] : row[13]) || 'Antonius Subrata, S.Pd.');
    const nomorSertifikat = String((colSertifikat >= 0 ? row[colSertifikat] : row[14]) || `421.3/SMPN1/${i}/2025`);
    const catatan = String((colCatatan >= 0 ? row[colCatatan] : row[15]) || '');

    parsedItems.push({
      id: String(id),
      namaSiswa: String(namaSiswa).trim(),
      nisn: nisn.trim(),
      kelas: kelas.trim(),
      namaLomba: namaLomba.trim(),
      bidang: bidang as BidangLomba,
      jenisLomba: jenisLomba as JenisLomba,
      cabangLomba: cabangLomba.trim(),
      tingkat: tingkat as TingkatPerlombaan,
      capaian: capaian as CapaianPrestasi,
      penyelenggara: penyelenggara.trim(),
      tanggal: tanggal.trim(),
      tahunAjaran: tahunAjaran.trim(),
      guruPembimbing: guruPembimbing.trim(),
      nomorSertifikat: nomorSertifikat.trim(),
      poinPrestasi: 0, // No poin
      catatan: catatan.trim(),
      terverifikasi: true,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    items: parsedItems,
    sheetTitle,
  };
};
