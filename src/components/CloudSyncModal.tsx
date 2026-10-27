import React, { useState, useEffect } from 'react';
import { PrestasiSiswa } from '../types/prestasi';
import { exportToCSV } from '../utils/helpers';
import { downloadDatabaseSQL, downloadKoneksiPHP, downloadApiPHP } from '../utils/phpMysqlExporter';
import { 
  googleSignIn, 
  logoutGoogle, 
  initAuth, 
  getCurrentUser, 
  getAccessToken 
} from '../services/googleAuth';
import { 
  createPrestasiSpreadsheet, 
  exportPrestasiToSpreadsheet, 
  readPrestasiFromSpreadsheet, 
  listUserSpreadsheets, 
  extractSpreadsheetId,
  DriveSpreadsheetFile
} from '../services/googleSheetsService';
import { User } from 'firebase/auth';
import { 
  Cloud, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  RefreshCw, 
  Database,
  FileSpreadsheet,
  Server,
  Lock,
  Globe,
  Copy,
  Check,
  FileCode,
  Layers,
  HelpCircle,
  Plus,
  UserCheck,
  FolderOpen
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrestasiSiswa[];
  onSyncData: (cloudData: PrestasiSiswa[]) => void;
  showToast: (msg: string) => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
  defaultTab?: 'google_sheets' | 'php_mysql';
}

const STORAGE_SPREADSHEET_URL = 'smpn1_pontianak_spreadsheet_url_v1';
const STORAGE_GAS_URL = 'smpn1_pontianak_gas_url_v1';
const STORAGE_PHP_API_URL = 'smpn1_pontianak_php_api_url_v1';
const STORAGE_MYSQL_MODE = 'smpn1_pontianak_mysql_mode_v1';
const STORAGE_INTERNAL_MYSQL = 'smpn1_pontianak_internal_mysql_db';

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  data,
  onSyncData,
  showToast,
  isAdmin,
  onRequireAdmin,
  defaultTab = 'google_sheets'
}) => {
  const [activeTab, setActiveTab] = useState<'google_sheets' | 'php_mysql'>(defaultTab);
  
  // Google Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // Google Sheets state
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [gasUrl, setGasUrl] = useState('');
  const [showGasAdvanced, setShowGasAdvanced] = useState(false);
  
  // PHP + MySQL state
  const [mysqlMode, setMysqlMode] = useState<'internal' | 'external'>('internal');
  const [phpApiUrl, setPhpApiUrl] = useState('');
  
  // Loading & status
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setHasGoogleToken(!!token);
      },
      () => {
        setGoogleUser(getCurrentUser());
        setHasGoogleToken(false);
      }
    );

    // Initial check
    const current = getCurrentUser();
    if (current) setGoogleUser(current);
    getAccessToken().then(tok => setHasGoogleToken(!!tok));

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Restore saved config
  useEffect(() => {
    if (!isOpen) return;

    const savedSheetUrl = localStorage.getItem(STORAGE_SPREADSHEET_URL);
    if (savedSheetUrl) setSpreadsheetUrl(savedSheetUrl);

    const savedGasUrl = localStorage.getItem(STORAGE_GAS_URL);
    if (savedGasUrl) setGasUrl(savedGasUrl);

    const savedPhpUrl = localStorage.getItem(STORAGE_PHP_API_URL);
    if (savedPhpUrl) {
      setPhpApiUrl(savedPhpUrl);
    } else {
      setPhpApiUrl('http://localhost/prestasi/api.php');
    }

    const savedMode = localStorage.getItem(STORAGE_MYSQL_MODE);
    if (savedMode === 'external') {
      setMysqlMode('external');
    } else {
      setMysqlMode('internal');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCurrentPageHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isTargetHttp = phpApiUrl.trim().toLowerCase().startsWith('http://');
  const hasMixedContentRisk = isCurrentPageHttps && isTargetHttp;

  const handleSaveSpreadsheetUrl = (url: string) => {
    setSpreadsheetUrl(url);
    localStorage.setItem(STORAGE_SPREADSHEET_URL, url);
  };

  const handleSaveGasUrl = (url: string) => {
    setGasUrl(url);
    localStorage.setItem(STORAGE_GAS_URL, url);
  };

  const handleSavePhpApiUrl = (url: string) => {
    setPhpApiUrl(url);
    localStorage.setItem(STORAGE_PHP_API_URL, url);
  };

  const handleChangeMysqlMode = (mode: 'internal' | 'external') => {
    setMysqlMode(mode);
    localStorage.setItem(STORAGE_MYSQL_MODE, mode);
    setSyncStatus('idle');
    setStatusMessage('');
    setErrorDetails(null);
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setSyncStatus('idle');
    setStatusMessage('');
    setErrorDetails(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setHasGoogleToken(true);
        showToast(`Berhasil terhubung ke akun Google: ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setSyncStatus('error');
      setStatusMessage(`Gagal masuk dengan Google: ${err.message || 'Coba lagi.'}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setHasGoogleToken(false);
      setDriveFiles([]);
      setShowDrivePicker(false);
      showToast('Telah keluar dari akun Google.');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Create new Spreadsheet in Google Drive
  const handleCreateNewSpreadsheet = async () => {
    if (!hasGoogleToken) {
      await handleGoogleSignIn();
      const token = await getAccessToken();
      if (!token) return;
    }

    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);
    setStatusMessage('Membuat Google Spreadsheet baru di Google Drive...');

    try {
      const result = await createPrestasiSpreadsheet();
      handleSaveSpreadsheetUrl(result.url);
      setSyncStatus('success');
      setStatusMessage('Spreadsheet baru berhasil dibuat dan diformat untuk SMP Negeri 1 Pontianak!');
      showToast('Google Spreadsheet baru berhasil dibuat di Google Drive Anda.');
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal membuat spreadsheet: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Spreadsheets from Google Drive
  const handleLoadDriveSpreadsheets = async () => {
    if (!hasGoogleToken) {
      await handleGoogleSignIn();
      const token = await getAccessToken();
      if (!token) return;
    }

    setIsLoadingFiles(true);
    setShowDrivePicker(true);
    try {
      const files = await listUserSpreadsheets();
      setDriveFiles(files);
      if (files.length === 0) {
        showToast('Tidak ada file Google Spreadsheet yang ditemukan di Google Drive.');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Gagal memuat Drive: ${err.message}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Sync / Export data to Google Sheets (MUTATING OPERATION - REQUIRES CONFIRMATION)
  const handleExportToGoogleSheets = async () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }

    const sheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!sheetId) {
      alert('Masukkan atau buat Google Spreadsheet terlebih dahulu.');
      return;
    }

    if (!hasGoogleToken) {
      await handleGoogleSignIn();
      const token = await getAccessToken();
      if (!token) return;
    }

    // MANDATORY USER CONFIRMATION FOR MUTATING WORKSPACE DATA
    const confirmMsg = `PERINGATAN SINKRONISASI GOOGLE SHEETS:\n\nApakah Anda yakin ingin mengekspor dan menyinkronkan seluruh ${data.length} data prestasi ke Google Spreadsheet ini?\n\nData pada lembar kerja akan diperbarui sesuai data aplikasi saat ini.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);
    setStatusMessage('Menyinkronkan data ke Google Spreadsheet...');

    try {
      const result = await exportPrestasiToSpreadsheet(sheetId, data);
      setSyncStatus('success');
      setStatusMessage(`Berhasil menyinkronkan ${result.rowCount} data prestasi ke Google Spreadsheet!`);
      showToast(`Berhasil mengekspor ${result.rowCount} data ke Google Sheets.`);
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal ekspor ke Google Sheets: ${err.message}`);
      setErrorDetails('Pastikan akun Google Anda memiliki hak akses Edit (Editor) pada spreadsheet ini.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync / Import data from Google Sheets (MUTATING OPERATION - REQUIRES CONFIRMATION)
  const handleImportFromGoogleSheets = async () => {
    const sheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!sheetId) {
      alert('Masukkan atau pilih Google Spreadsheet terlebih dahulu.');
      return;
    }

    if (!hasGoogleToken) {
      await handleGoogleSignIn();
      const token = await getAccessToken();
      if (!token) return;
    }

    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);
    setStatusMessage('Membaca data dari Google Spreadsheet...');

    try {
      const result = await readPrestasiFromSpreadsheet(sheetId);
      
      if (result.items.length === 0) {
        setSyncStatus('warning');
        setStatusMessage(`Spreadsheet dibaca (Lembar: "${result.sheetTitle}"), namun tidak ditemukan baris data siswa yang valid.`);
        return;
      }

      // MANDATORY USER CONFIRMATION BEFORE REPLACING / UPDATING LOCAL DATA
      const confirmMsg = `KONFIRMASI IMPOR:\n\nDitemukan ${result.items.length} baris data prestasi dari lembar "${result.sheetTitle}".\n\nApakah Anda ingin memperbarui data aplikasi dengan data dari Google Spreadsheet ini?`;
      if (!window.confirm(confirmMsg)) {
        setIsLoading(false);
        return;
      }

      onSyncData(result.items);
      setSyncStatus('success');
      setStatusMessage(`Berhasil memuat ${result.items.length} data prestasi dari Google Spreadsheet (Lembar: ${result.sheetTitle})!`);
      showToast(`Berhasil mengimpor ${result.items.length} data dari Google Sheets.`);
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal impor dari Google Sheets: ${err.message}`);
      setErrorDetails('Pastikan spreadsheet memiliki akses baca dan format kolom sesuai.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSpreadsheet = () => {
    const sheetId = extractSpreadsheetId(spreadsheetUrl);
    if (sheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, '_blank', 'noopener,noreferrer');
    } else {
      alert('Masukkan atau buat URL Google Spreadsheet terlebih dahulu.');
    }
  };

  const handleCopySpreadsheetLink = () => {
    const sheetId = extractSpreadsheetId(spreadsheetUrl);
    if (sheetId) {
      const fullUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      showToast('Tautan Google Spreadsheet disalin ke papan klip.');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // --------------------------------------------------------------------------
  // OPERASI SERVER PHP + MYSQL (INTERNAL & EXTERNAL)
  // --------------------------------------------------------------------------
  const handleTestPhpConnection = async () => {
    if (!phpApiUrl.trim()) {
      alert('Masukkan URL endpoint API PHP terlebih dahulu.');
      return;
    }

    if (hasMixedContentRisk) {
      setSyncStatus('error');
      setStatusMessage('Peringatan Mixed Content: Browser memblokir panggilan HTTP dari halaman HTTPS.');
      setErrorDetails('Gunakan URL HTTPS dengan sertifikat SSL atau gunakan Mode Database Internal.');
      return;
    }

    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);
    setStatusMessage('Menguji koneksi ke endpoint PHP + MySQL...');

    try {
      const response = await fetch(phpApiUrl.trim(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setSyncStatus('success');
      setStatusMessage(`Koneksi PHP + MySQL Berhasil! Server merespons: ${result.message || 'Status OK'}. Ditemukan ${Array.isArray(result.data) ? result.data.length : 0} data.`);
      showToast('Koneksi ke endpoint PHP + MySQL berhasil!');
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal terhubung ke PHP + MySQL: ${err.message}`);
      setErrorDetails(
        'Penyebab umum: 1) XAMPP Apache/MySQL belum "Start". 2) CORS belum diizinkan pada api.php. 3) Browser HTTPS memblokir HTTP localhost.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFromPhp = async () => {
    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);

    // Internal Database Mode
    if (mysqlMode === 'internal') {
      setTimeout(() => {
        try {
          const savedInternal = localStorage.getItem(STORAGE_INTERNAL_MYSQL);
          if (savedInternal) {
            const parsed = JSON.parse(savedInternal);
            if (Array.isArray(parsed) && parsed.length > 0) {
              onSyncData(parsed);
              setSyncStatus('success');
              setStatusMessage(`Berhasil memuat ${parsed.length} data prestasi dari Database Internal MySQL!`);
              showToast(`Memuat ${parsed.length} data internal.`);
            } else {
              setSyncStatus('warning');
              setStatusMessage('Database Internal masih kosong. Lakukan "Simpan ke MySQL" terlebih dahulu.');
            }
          } else {
            setSyncStatus('warning');
            setStatusMessage('Database Internal belum memiliki cadangan.');
          }
        } catch (e: any) {
          setSyncStatus('error');
          setStatusMessage('Gagal membaca data internal: ' + e.message);
        }
        setIsLoading(false);
      }, 300);
      return;
    }

    // External Server Mode
    if (!phpApiUrl.trim()) {
      setIsLoading(false);
      alert('Masukkan URL endpoint API PHP terlebih dahulu.');
      return;
    }

    if (hasMixedContentRisk) {
      setIsLoading(false);
      setSyncStatus('error');
      setStatusMessage('Gagal mengambil data karena pembatasan HTTPS (Mixed Content).');
      setErrorDetails('Gunakan URL HTTPS atau beralih ke Mode Database Internal.');
      return;
    }

    setStatusMessage('Mengambil data dari server PHP MySQL...');

    try {
      const response = await fetch(phpApiUrl.trim(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        const mappedData: PrestasiSiswa[] = result.data.map((item: any, index: number) => ({
          id: item.id || `mysql-${Date.now()}-${index}`,
          namaSiswa: item.nama_siswa || item.namasiswa || item.namaSiswa || '',
          nisn: String(item.nisn || ''),
          kelas: item.kelas || '',
          namaLomba: item.nama_lomba || item.namalomba || item.namaLomba || '',
          bidang: item.bidang || 'Lainnya',
          jenisLomba: item.jenis_lomba || item.jenislomba || item.jenisLomba || 'Individu (Perorangan)',
          cabangLomba: item.cabang_lomba || item.cabanglomba || item.cabangLomba || '',
          tingkat: item.tingkat || 'Kota Pontianak',
          capaian: item.capaian || 'Juara 1 (Emas)',
          penyelenggara: item.penyelenggara || '',
          tanggal: item.tanggal ? String(item.tanggal).split('T')[0] : new Date().toISOString().split('T')[0],
          tahunAjaran: item.tahun_ajaran || item.tahunajaran || item.tahunAjaran || '2025/2026',
          guruPembimbing: item.guru_pembimbing || item.gurupembimbing || item.guruPembimbing || '',
          nomorSertifikat: item.no_sertifikat || item.nosertifikat || item.nomorSertifikat || '',
          poinPrestasi: 0,
          catatan: item.catatan || '',
          fotoDokumentasi: item.foto_dokumentasi || item.fotodokumentasi || '',
          terverifikasi: true,
          createdAt: item.created_at || item.createdat || new Date().toISOString()
        }));

        onSyncData(mappedData);
        setSyncStatus('success');
        setStatusMessage(`Berhasil memuat ${mappedData.length} data prestasi dari database MySQL!`);
        showToast(`Sinkronisasi sukses: ${mappedData.length} data dimuat dari MySQL.`);
      } else {
        throw new Error(result.message || 'Format data dari API PHP tidak valid.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal mengambil data dari MySQL: ${err.message}`);
      setErrorDetails('Periksa koneksi database MySQL, tabel prestasi_siswa, dan konfigurasi CORS di api.php.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToPhp = async () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }

    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);

    // Internal Database Mode
    if (mysqlMode === 'internal') {
      setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_INTERNAL_MYSQL, JSON.stringify(data));
          setSyncStatus('success');
          setStatusMessage(`Berhasil menyinkronkan seluruh ${data.length} data ke Database Internal MySQL!`);
          showToast(`Data tersimpan ke Database MySQL Internal.`);
        } catch (e: any) {
          setSyncStatus('error');
          setStatusMessage('Gagal menyimpan data internal: ' + e.message);
        }
        setIsLoading(false);
      }, 400);
      return;
    }

    // External Server Mode
    if (!phpApiUrl.trim()) {
      setIsLoading(false);
      alert('Masukkan URL endpoint API PHP terlebih dahulu.');
      return;
    }

    if (hasMixedContentRisk) {
      setIsLoading(false);
      setSyncStatus('error');
      setStatusMessage('Gagal mengirim data karena pembatasan HTTPS (Mixed Content).');
      setErrorDetails('Gunakan URL HTTPS atau beralih ke Mode Database Internal.');
      return;
    }

    if (!window.confirm(`Kirim dan perbarui ${data.length} data prestasi ke database MySQL eksternal?`)) {
      setIsLoading(false);
      return;
    }

    setStatusMessage('Menyimpan data ke database MySQL eksternal...');

    try {
      const response = await fetch(phpApiUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSyncStatus('success');
        setStatusMessage(result.message || `Berhasil menyimpan data ke database MySQL!`);
        showToast('Data berhasil disimpan ke database MySQL.');
      } else {
        throw new Error(result.message || 'Gagal menyimpan ke MySQL.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal mengirim data ke MySQL: ${err.message}`);
      setErrorDetails('Pastikan izin penulisan database MySQL dan koneksi PDO aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 text-amber-300 rounded-lg shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Google Sheets & Database Cloud</h3>
              <p className="text-xs text-emerald-200">Integrasi Langsung Google Workspace (Sheets & Drive) dan PHP + MySQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => { setActiveTab('google_sheets'); setSyncStatus('idle'); setErrorDetails(null); }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'google_sheets'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets (Workspace)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
              Resmi Google
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('php_mysql'); setSyncStatus('idle'); setErrorDetails(null); }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'php_mysql'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4 text-blue-700" />
            <span>Database PHP + MySQL</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-semibold">
              XAMPP / cPanel
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Status Alert Banner */}
          {syncStatus === 'success' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 font-medium leading-relaxed">
                {statusMessage}
              </div>
            </div>
          )}

          {syncStatus === 'error' && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 font-semibold">
                  {statusMessage}
                </div>
              </div>
              {errorDetails && (
                <div className="text-[11px] text-rose-700 pl-6.5 leading-relaxed font-mono">
                  {errorDetails}
                </div>
              )}
            </div>
          )}

          {syncStatus === 'warning' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 font-medium leading-relaxed">
                {statusMessage}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 1: GOOGLE SHEETS (WORKSPACE OAUTH INTEGRATION)               */}
          {/* ================================================================ */}
          {activeTab === 'google_sheets' && (
            <div className="space-y-5">
              
              {/* Google Account Authentication Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {googleUser ? (
                    <>
                      {googleUser.photoURL ? (
                        <img 
                          src={googleUser.photoURL} 
                          alt={googleUser.displayName || 'Google User'} 
                          className="w-10 h-10 rounded-full border-2 border-emerald-500 shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {googleUser.displayName ? googleUser.displayName.charAt(0).toUpperCase() : 'G'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">
                            {googleUser.displayName || 'Akun Google Terhubung'}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Terhubung</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {googleUser.email}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Masuk dengan Akun Google
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Otorisasi untuk membuat, membaca, dan menyinkronkan Google Sheets secara aman.
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {googleUser && hasGoogleToken ? (
                    <button
                      onClick={handleGoogleLogout}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Keluar Akun
                    </button>
                  ) : (
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isAuthLoading}
                      className="gsi-material-button cursor-pointer disabled:opacity-50"
                    >
                      <div className="gsi-material-button-state"></div>
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">
                          {isAuthLoading ? 'Menghubungkan...' : 'Sign in with Google'}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions: Buat Baru & Pilih dari Google Drive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCreateNewSpreadsheet}
                  disabled={isLoading}
                  className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-400 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer group disabled:opacity-50"
                >
                  <div className="p-2 bg-emerald-600 text-white rounded-lg group-hover:scale-105 transition-transform shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">
                      Buat Spreadsheet Baru
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Format resmi otomatis di Google Drive
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleLoadDriveSpreadsheets}
                  disabled={isLoadingFiles}
                  className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-400 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer group disabled:opacity-50"
                >
                  <div className="p-2 bg-blue-600 text-white rounded-lg group-hover:scale-105 transition-transform shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950">
                      Pilih dari Google Drive
                    </div>
                    <div className="text-[11px] text-blue-700">
                      Daftar spreadsheet yang ada di Drive Anda
                    </div>
                  </div>
                </button>
              </div>

              {/* Drive Picker Dropdown / List */}
              {showDrivePicker && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Pilih Spreadsheet dari Google Drive Anda:</span>
                    <button
                      onClick={() => setShowDrivePicker(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Tutup
                    </button>
                  </div>
                  {isLoadingFiles ? (
                    <div className="text-xs text-slate-500 py-2 text-center flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Memuat daftar spreadsheet dari Drive...</span>
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="text-xs text-slate-500 py-2 text-center">
                      Tidak ada file Google Spreadsheet yang ditemukan. Klik "Buat Spreadsheet Baru" di atas.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {driveFiles.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => {
                            handleSaveSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${file.id}/edit`);
                            setShowDrivePicker(false);
                            showToast(`Dipilih: "${file.name}"`);
                          }}
                          className="px-3 py-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium text-slate-900 truncate">{file.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('id-ID') : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Input URL atau ID Google Spreadsheet */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Tautan atau ID Google Spreadsheet</span>
                  </label>
                  {spreadsheetUrl && (
                    <button
                      onClick={handleCopySpreadsheetLink}
                      className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Tersalin' : 'Salin Tautan'}</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={spreadsheetUrl}
                    onChange={(e) => handleSaveSpreadsheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit atau ID Spreadsheet"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                  <button
                    onClick={handleOpenSpreadsheet}
                    disabled={!spreadsheetUrl.trim()}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all whitespace-nowrap"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Spreadsheet</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Format baris mencakup: No, Siswa, NISN, Kelas, Nama Lomba, Bidang, Jenis, Cabang, Tingkat, Capaian, Penyelenggara, Tanggal, Tahun Ajaran, Pembimbing, dan Sertifikat.
                </p>
              </div>

              {/* Sync Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Kirim ke Google Sheets */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Kirim Data ke Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-4">
                      Menyimpan seluruh ({data.length}) data prestasi siswa lokal langsung ke Google Spreadsheet.
                    </p>
                  </div>
                  <button
                    onClick={handleExportToGoogleSheets}
                    disabled={isLoading || !spreadsheetUrl.trim()}
                    className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAdmin ? 'Ekspor ke Google Sheets' : 'Masuk Admin untuk Ekspor'}</span>
                  </button>
                </div>

                {/* Tarik dari Google Sheets */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Tarik Data dari Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-4">
                      Mengunduh dan memperbarui daftar prestasi aplikasi dengan baris data dari Google Spreadsheet.
                    </p>
                  </div>
                  <button
                    onClick={handleImportFromGoogleSheets}
                    disabled={isLoading || !spreadsheetUrl.trim()}
                    className="w-full py-2.5 px-3 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Impor dari Google Sheets</span>
                  </button>
                </div>

              </div>

              {/* Opsi Tambahan: Google Apps Script Web App (Alternatif) */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <button
                  onClick={() => setShowGasAdvanced(!showGasAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-slate-500" />
                    <span>Opsi Alternatif: Google Apps Script Webhook (GAS)</span>
                  </span>
                  <span className="text-[11px] text-blue-700">{showGasAdvanced ? 'Sembunyikan' : 'Tampilkan'}</span>
                </button>

                {showGasAdvanced && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <label className="block text-[11px] font-bold text-slate-700">
                      URL Web App Google Apps Script:
                    </label>
                    <input
                      type="url"
                      value={gasUrl}
                      onChange={(e) => handleSaveGasUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-500">
                      Dapat digunakan jika Anda memiliki endpoint Google Apps Script mandiri dengan akses "Anyone".
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: DATABASE PHP + MYSQL (INTERNAL & EXTERNAL)                */}
          {/* ================================================================ */}
          {activeTab === 'php_mysql' && (
            <div className="space-y-5">
              
              {/* MySQL Server Mode Switcher */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-700" />
                  <span>Pilih Mode Database MySQL</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChangeMysqlMode('internal')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      mysqlMode === 'internal'
                        ? 'border-blue-700 bg-blue-50/80 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                        <CheckCircle2 className={`w-4 h-4 ${mysqlMode === 'internal' ? 'text-blue-700' : 'text-slate-300'}`} />
                        <span>Mode Database Internal</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Rekomendasi
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Langsung aktif tanpa error "Failed to fetch" dan tanpa konfigurasi server lokal.
                    </p>
                  </button>

                  <button
                    onClick={() => handleChangeMysqlMode('external')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      mysqlMode === 'external'
                        ? 'border-blue-700 bg-blue-50/80 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                        <Server className={`w-4 h-4 ${mysqlMode === 'external' ? 'text-blue-700' : 'text-slate-300'}`} />
                        <span>Mode Server Eksternal</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        XAMPP / Hosting
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Hubungkan ke XAMPP lokal (localhost) atau hosting cPanel via REST API PHP PDO.
                    </p>
                  </button>
                </div>
              </div>

              {/* Konfigurasi Server Eksternal */}
              {mysqlMode === 'external' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-blue-700" />
                      <span>URL Endpoint API PHP (api.php)</span>
                    </label>
                  </div>

                  {hasMixedContentRisk && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">Perhatian Keamanan Browser (Mixed Content):</strong>
                        Halaman ini berjalan di <code>https://</code>, sedangkan URL API Anda adalah <code>http://</code>. Disarankan beralih ke <strong>Mode Database Internal</strong> di atas atau gunakan domain HTTPS.
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={phpApiUrl}
                      onChange={(e) => handleSavePhpApiUrl(e.target.value)}
                      placeholder="http://localhost/prestasi/api.php"
                      className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleTestPhpConnection}
                        disabled={isLoading || !phpApiUrl.trim()}
                        className="px-3 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all whitespace-nowrap"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Uji Koneksi</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sync Actions Grid MySQL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Muat dari Database MySQL</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-4">
                      Mengambil dan memperbarui data prestasi dari database MySQL {mysqlMode === 'internal' ? 'internal' : 'server Anda'}.
                    </p>
                  </div>
                  <button
                    onClick={handleFetchFromPhp}
                    disabled={isLoading || (mysqlMode === 'external' && !phpApiUrl.trim())}
                    className="w-full py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tarik Data MySQL</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Simpan ke Database MySQL</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-4">
                      Menyimpan seluruh ({data.length}) data prestasi langsung ke tabel database MySQL.
                    </p>
                  </div>
                  <button
                    onClick={handlePushToPhp}
                    disabled={isLoading || (mysqlMode === 'external' && !phpApiUrl.trim())}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAdmin ? 'Simpan ke MySQL' : 'Masuk Admin untuk Simpan'}</span>
                  </button>
                </div>
              </div>

              {/* Unduh Paket Skrip PHP & MySQL */}
              <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-800" />
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                      Unduh Berkas Backend PHP + MySQL Siap Pasang
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => {
                      downloadDatabaseSQL(data);
                      showToast('Berkas database_prestasi_smpn1.sql berhasil diunduh.');
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-700" />
                    <span>1. database.sql</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadKoneksiPHP();
                      showToast('Berkas koneksi.php berhasil diunduh.');
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-700" />
                    <span>2. koneksi.php</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadApiPHP();
                      showToast('Berkas api.php berhasil diunduh.');
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>3. api.php</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Quick Offline CSV Export */}
          <div className="flex items-center justify-between p-3 bg-slate-100/80 rounded-xl text-xs">
            <span className="text-slate-600 font-medium">Cadangan Offline: Ekspor semua data ke file CSV</span>
            <button
              onClick={() => {
                exportToCSV(data);
                showToast('Berkas CSV berhasil diunduh.');
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isAdmin ? 'Mode: Administrator (Akses Penuh)' : 'Mode: Pengunjung Publik (Baca & Unduh)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
