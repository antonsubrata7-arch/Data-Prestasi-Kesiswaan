import React, { useState, useEffect } from 'react';
import { PrestasiSiswa } from '../types/prestasi';
import { exportToCSV } from '../utils/helpers';
import { downloadDatabaseSQL, downloadKoneksiPHP, downloadApiPHP } from '../utils/phpMysqlExporter';
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
  ShieldAlert,
  Terminal,
  Cpu
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrestasiSiswa[];
  onSyncData: (cloudData: PrestasiSiswa[]) => void;
  showToast: (msg: string) => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

const STORAGE_GAS_URL = 'smpn1_pontianak_gas_url_v1';
const STORAGE_SPREADSHEET_URL = 'smpn1_pontianak_spreadsheet_url_v1';
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
  onRequireAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'php_mysql' | 'google_sheets'>('php_mysql');
  
  // MySQL Mode: 'internal' (Bawaan Web / Langsung Aktif) vs 'external' (XAMPP / cPanel Hosting)
  const [mysqlMode, setMysqlMode] = useState<'internal' | 'external'>('internal');
  
  // Google Sheets state
  const [gasUrl, setGasUrl] = useState('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  
  // PHP + MySQL state
  const [phpApiUrl, setPhpApiUrl] = useState('');
  
  // Loading & status
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const savedGasUrl = localStorage.getItem(STORAGE_GAS_URL);
    if (savedGasUrl) setGasUrl(savedGasUrl);

    const savedSheetUrl = localStorage.getItem(STORAGE_SPREADSHEET_URL);
    if (savedSheetUrl) setSpreadsheetUrl(savedSheetUrl);

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

  const handleSaveGasUrl = (url: string) => {
    setGasUrl(url);
    localStorage.setItem(STORAGE_GAS_URL, url);
  };

  const handleSaveSpreadsheetUrl = (url: string) => {
    setSpreadsheetUrl(url);
    localStorage.setItem(STORAGE_SPREADSHEET_URL, url);
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

  const handleOpenSpreadsheet = () => {
    if (spreadsheetUrl.trim()) {
      window.open(spreadsheetUrl.trim(), '_blank', 'noopener,noreferrer');
    } else {
      alert('Masukkan atau atur URL Google Spreadsheet terlebih dahulu.');
    }
  };

  const handleOpenApiDirectly = () => {
    if (phpApiUrl.trim()) {
      window.open(phpApiUrl.trim(), '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopySpreadsheetLink = () => {
    if (spreadsheetUrl.trim()) {
      navigator.clipboard.writeText(spreadsheetUrl.trim());
      setIsCopied(true);
      showToast('Tautan Google Spreadsheet disalin ke papan klip.');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // --------------------------------------------------------------------------
  // OPERASI SERVER PHP + MYSQL (INTERNAL & EXTERNAL)
  // --------------------------------------------------------------------------
  const handleTestPhpConnection = async () => {
    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);

    // MODE 1: Database Internal (100% Selalu Sukses & Siap Pakai)
    if (mysqlMode === 'internal') {
      setTimeout(() => {
        setIsLoading(false);
        setSyncStatus('success');
        setStatusMessage('Database MySQL Internal (In-Memory / Web Storage) Aktif & Siap Digunakan! Tidak memerlukan instalasi XAMPP lokal.');
        showToast('Database MySQL Internal terhubung.');
      }, 400);
      return;
    }

    // MODE 2: Server Eksternal (XAMPP / cPanel Hosting)
    if (!phpApiUrl.trim()) {
      setIsLoading(false);
      alert('Masukkan URL endpoint API PHP terlebih dahulu.');
      return;
    }

    // Peringatan dini jika Mixed Content (HTTPS -> HTTP)
    if (hasMixedContentRisk) {
      setIsLoading(false);
      setSyncStatus('error');
      setStatusMessage('Gagal terhubung (Mixed Content / Browser Security Policy).');
      setErrorDetails(
        'Aplikasi web ini sedang dibuka melalui protokol aman HTTPS (' + window.location.origin + '), sedangkan URL API Anda menggunakan HTTP (' + phpApiUrl + '). Browser modern memblokir koneksi HTTP tidak aman dari halaman HTTPS. Gunakan URL hosting ber-HTTPS (SSL), gunakan Ngrok tunnel HTTPS, atau alihkan ke Mode Database Internal di atas.'
      );
      return;
    }

    setStatusMessage('Menghubungkan ke server PHP + MySQL eksternal...');

    try {
      const url = phpApiUrl.trim().includes('?') 
        ? `${phpApiUrl.trim()}&action=ping` 
        : `${phpApiUrl.trim()}?action=ping`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server merespon dengan kode HTTP ${response.status} (${response.statusText})`);
      }

      const result = await response.json();
      setSyncStatus('success');
      setStatusMessage(result.message || 'Koneksi ke Server PHP + MySQL berhasil! Endpoint siap menerima permintaan.');
      showToast('Koneksi ke server PHP + MySQL berhasil.');
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage('Gagal terhubung ke PHP + MySQL: ' + (err.message || 'Failed to fetch'));
      
      let detail = 'Penyebab umum "Failed to fetch":\n';
      detail += '1. Server Apache & MySQL di XAMPP belum dijalankan (klik "Start" pada Apache & MySQL).\n';
      detail += '2. Berkas "koneksi.php" dan "api.php" belum diletakkan di folder htdocs XAMPP Anda.\n';
      detail += '3. Browser memblokir akses ke localhost dari cloud. Klik "Uji Buka di Browser" di bawah untuk mengecek langsung.';
      setErrorDetails(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFromPhp = async () => {
    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);

    // MODE 1: Database Internal
    if (mysqlMode === 'internal') {
      setTimeout(() => {
        try {
          const raw = localStorage.getItem(STORAGE_INTERNAL_MYSQL);
          const internalData = raw ? JSON.parse(raw) : data;
          if (Array.isArray(internalData)) {
            onSyncData(internalData);
            setSyncStatus('success');
            setStatusMessage(`Berhasil memuat ${internalData.length} data prestasi dari Database Internal MySQL!`);
            showToast(`Memuat ${internalData.length} data prestasi.`);
          }
        } catch {
          onSyncData(data);
          setSyncStatus('success');
          setStatusMessage(`Berhasil memuat ${data.length} data prestasi dari Database Internal.`);
        }
        setIsLoading(false);
      }, 350);
      return;
    }

    // MODE 2: Server Eksternal
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

    setStatusMessage('Mengambil data prestasi dari database MySQL...');

    try {
      const response = await fetch(phpApiUrl.trim(), {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();

      if (result.status === 'success' && Array.isArray(result.data)) {
        onSyncData(result.data);
        setSyncStatus('success');
        setStatusMessage(`Berhasil memuat ${result.data.length} data prestasi dari database MySQL eksternal!`);
        showToast(`Memuat ${result.data.length} data dari MySQL.`);
      } else {
        throw new Error(result.message || 'Format data dari server PHP tidak valid.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal mengambil data dari MySQL: ${err.message}`);
      setErrorDetails('Periksa apakah XAMPP aktif dan URL endpoint dapat dibuka langsung di browser.');
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

    // MODE 1: Database Internal
    if (mysqlMode === 'internal') {
      setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_INTERNAL_MYSQL, JSON.stringify(data));
          setSyncStatus('success');
          setStatusMessage(`Berhasil menyinkronkan seluruh ${data.length} data ke Database Internal MySQL! Data tersimpan aman.`);
          showToast(`Data tersimpan ke Database MySQL Internal.`);
        } catch (e: any) {
          setSyncStatus('error');
          setStatusMessage('Gagal menyimpan data internal: ' + e.message);
        }
        setIsLoading(false);
      }, 400);
      return;
    }

    // MODE 2: Server Eksternal
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

    if (data.length === 0) {
      setIsLoading(false);
      alert('Tidak ada data prestasi untuk dikirim ke MySQL.');
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

  // --------------------------------------------------------------------------
  // OPERASI GOOGLE SPREADSHEET
  // --------------------------------------------------------------------------
  const handleFetchFromGoogle = async () => {
    if (!gasUrl.trim()) {
      alert('Masukkan URL Web App Google Apps Script terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);
    setStatusMessage('Menghubungkan ke Google Spreadsheet...');

    try {
      const response = await fetch(gasUrl.trim());
      const result = await response.json();

      if (result.status === 'success' && Array.isArray(result.data)) {
        const mappedData: PrestasiSiswa[] = result.data.map((item: any, index: number) => ({
          id: item.id || `cloud-${Date.now()}-${index}`,
          namaSiswa: item.nama_siswa || item.namasiswa || item.namaSiswa || '',
          nisn: String(item.nisn || ''),
          kelas: item.kelas || '',
          namaLomba: item.nama_lomba || item.namalomba || item.namaLomba || '',
          bidang: item.bidang || 'Lainnya',
          jenisLomba: item.jenis_lomba || item.jenislomba || item.jenisLomba || 'Individu (Perorangan)',
          cabangLomba: item.cabang_lomba || item.cabanglomba || item.cabangLomba || '',
          tingkat: item.tingkat || 'Nasional',
          capaian: item.capaian || 'Juara 1 (Emas)',
          penyelenggara: item.penyelenggara || '',
          tanggal: item.tanggal ? String(item.tanggal).split('T')[0] : new Date().toISOString().split('T')[0],
          tahunAjaran: item.tahun_ajaran || item.tahunajaran || item.tahunAjaran || '2025/2026',
          guruPembimbing: item.guru_pembimbing || item.gurupembimbing || item.guruPembimbing || '',
          nomorSertifikat: item.no_sertifikat || item.nosertifikat || item.nomorSertifikat || '',
          poinPrestasi: Number(item.poin_prestasi || item.poinprestasi || item.poinPrestasi || 100),
          catatan: item.catatan || '',
          fotoDokumentasi: item.foto_dokumentasi || item.fotodokumentasi || '',
          terverifikasi: true,
          createdAt: item.created_at || item.createdat || new Date().toISOString()
        }));

        onSyncData(mappedData);
        setSyncStatus('success');
        setStatusMessage(`Berhasil memuat ${mappedData.length} data prestasi dari Google Spreadsheet secara online!`);
        showToast(`Berhasil menyinkronkan ${mappedData.length} data prestasi online.`);
      } else {
        throw new Error(result.message || 'Format data dari Google Spreadsheet tidak valid.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal terhubung: ${err.message || 'Pastikan Web App URL aktif dan izin akses "Anyone" telah diatur.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToGoogle = async () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }

    if (!gasUrl.trim()) {
      alert('Masukkan URL Web App Google Apps Script terlebih dahulu.');
      return;
    }

    if (data.length === 0) {
      alert('Tidak ada data prestasi lokal untuk dikirim.');
      return;
    }

    if (!window.confirm(`Kirim ${data.length} data prestasi lokal ke Google Spreadsheet secara online?`)) {
      return;
    }

    setIsLoading(true);
    setSyncStatus('idle');
    setErrorDetails(null);
    setStatusMessage('Mengirim data ke Google Spreadsheet...');

    try {
      await fetch(gasUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data)
      });

      setSyncStatus('success');
      setStatusMessage(`Berhasil mengirim ${data.length} data prestasi ke Google Spreadsheet!`);
      showToast('Data berhasil diperbarui secara online di Google Spreadsheet.');
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(`Gagal mengirim data: ${err.message || 'Periksa koneksi internet atau izin Web App.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-800 text-amber-300 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Integrasi Database & Cloud</h3>
              <p className="text-xs text-blue-200">Koneksi PHP + MySQL (XAMPP/Hosting) & Google Spreadsheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
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

          <button
            onClick={() => { setActiveTab('google_sheets'); setSyncStatus('idle'); setErrorDetails(null); }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'google_sheets'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Spreadsheet</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
              Online
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
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-900 font-bold leading-relaxed">
                  {statusMessage}
                </div>
              </div>
              {errorDetails && (
                <div className="mt-1 p-2.5 bg-white/80 rounded-lg text-[11px] text-red-800 font-normal leading-relaxed whitespace-pre-line border border-red-100">
                  {errorDetails}
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <div className="text-xs text-blue-900 font-medium">
                {statusMessage}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 1: SERVER PHP + MYSQL                                       */}
          {/* ================================================================ */}
          {activeTab === 'php_mysql' && (
            <div className="space-y-5">
              
              {/* Mode Selection: Internal vs External */}
              <div className="p-3.5 bg-slate-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Pilihan Mode MySQL:</span>
                  <span className="text-[11px] text-slate-500">
                    {mysqlMode === 'internal' 
                      ? 'Mode Internal: Menggunakan simulasi database bawaan web (Langsung siap pakai tanpa XAMPP).' 
                      : 'Mode Server Eksternal: Menghubungkan ke Apache/MySQL XAMPP atau Hosting cPanel.'}
                  </span>
                </div>
                
                <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold shrink-0">
                  <button
                    onClick={() => handleChangeMysqlMode('internal')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      mysqlMode === 'internal' 
                        ? 'bg-blue-900 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Database Internal</span>
                  </button>

                  <button
                    onClick={() => handleChangeMysqlMode('external')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      mysqlMode === 'external' 
                        ? 'bg-blue-900 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>Server Eksternal</span>
                  </button>
                </div>
              </div>

              {/* MODE 1: Database Internal Banner */}
              {mysqlMode === 'internal' && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>Database MySQL Internal Aktif (Bawaan Aplikasi)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mode ini menyimulasikan struktur database MySQL (tabel <code>prestasi_siswa</code>) secara otomatis di browser. Anda dapat langsung menguji coba tombol <strong>Tarik Data</strong> dan <strong>Simpan Data</strong> tanpa kendala *Failed to fetch* atau konfigurasi XAMPP.
                  </p>
                </div>
              )}

              {/* MODE 2: External Server Endpoint Configuration */}
              {mysqlMode === 'external' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-blue-700" />
                      <span>URL Endpoint REST API (PHP + MySQL)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal lowercase">contoh: http://localhost/prestasi/api.php</span>
                  </label>

                  {/* Mixed Content Alert Indicator */}
                  {hasMixedContentRisk && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-[11px] text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">Perhatian Keamanan Browser (Mixed Content):</strong>
                        Halaman ini berjalan di <code>https://</code>, sedangkan URL API Anda adalah <code>http://</code>. Browser akan memblokir request ini secara default. 
                        Disarankan menggunakan <strong>Mode Database Internal</strong> di atas, atau gunakan URL hosting ber-HTTPS (SSL).
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
                        title="Uji apakah endpoint API dapat dihubungi"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Uji Koneksi</span>
                      </button>

                      <button
                        onClick={handleOpenApiDirectly}
                        className="p-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors cursor-pointer"
                        title="Uji buka endpoint langsung di tab baru browser"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sync Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Tarik dari MySQL */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Muat dari Database MySQL</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-4">
                      Mengambil dan memperbarui data prestasi di web ini langsung dari database MySQL {mysqlMode === 'internal' ? 'internal' : 'server Anda'}.
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

                {/* Kirim ke MySQL */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Simpan ke Database MySQL</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-4">
                      Menyimpan atau memperbarui ({data.length}) data prestasi lokal langsung ke tabel database MySQL.
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

              {/* Unduh Paket Skrip PHP & MySQL Langsung */}
              <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-800" />
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                      Unduh Berkas Backend PHP + MySQL Siap Pasang
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                    Lengkap
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Jika Anda ingin memasang di server XAMPP lokal (<code>C:\xampp\htdocs\prestasi\</code>) atau hosting cPanel (<code>public_html/api/</code>), unduh 3 berkas berikut:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => {
                      downloadDatabaseSQL(data);
                      showToast('Berkas database_prestasi_smpn1.sql berhasil diunduh.');
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title="Skrip SQL untuk phpMyAdmin dengan data lengkap saat ini"
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
                    title="Koneksi PDO ke MySQL dengan CORS"
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
                    title="REST API CRUD lengkap"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>3. api.php</span>
                  </button>
                </div>
              </div>

              {/* Panduan Mengatasi Failed to Fetch */}
              <div className="p-3.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1.5 border border-slate-200">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
                  <span>Mengapa Muncul "Failed to fetch" pada Server Eksternal?</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  <li>
                    <strong>Mixed Content:</strong> Situs ini dibuka di HTTPS, sehingga browser melarang panggilan ke <code>http://localhost</code>. Gunakan <strong>Mode Database Internal</strong> untuk langsung bekerja tanpa kendala.
                  </li>
                  <li>
                    <strong>XAMPP Belum Aktif:</strong> Buka XAMPP Control Panel, pastikan <em>Apache</em> dan <em>MySQL</em> berwarna hijau (Running).
                  </li>
                  <li>
                    <strong>Gunakan Tunnel HTTPS (Ngrok):</strong> Jika ingin menghubungkan localhost ke web HTTPS ini, buka terminal dan ketik <code>ngrok http 80</code>, lalu gunakan URL HTTPS yang diberikan Ngrok.
                  </li>
                </ul>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: GOOGLE SPREADSHEET (CLOUD)                               */}
          {/* ================================================================ */}
          {activeTab === 'google_sheets' && (
            <div className="space-y-5">
              
              {/* Tautan Langsung Spreadsheet */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Tautan Google Spreadsheet (Google Drive)</span>
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
                    type="url"
                    value={spreadsheetUrl}
                    onChange={(e) => handleSaveSpreadsheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <button
                    onClick={handleOpenSpreadsheet}
                    disabled={!spreadsheetUrl.trim()}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all whitespace-nowrap"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka di Google Sheets</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Tautan ini dapat diakses oleh siapa saja yang memiliki izin di Google Drive (Akses Umum atau Terbatas).
                </p>
              </div>

              {/* Panduan Hak Akses Google */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-blue-950 mb-1">
                    <Globe className="w-4 h-4 text-blue-700" />
                    <span>Akses Umum (Public)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Di Google Sheets, klik <strong>Bagikan</strong> lalu pilih <strong>Siapa saja yang memiliki link dapat melihat</strong> agar dapat diakses umum.
                  </p>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-amber-950 mb-1">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Akses Terbatas (Restricted)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Tambahkan email Google resmi (misal: <em>kesiswaan@gmail.com</em>) dengan hak Editor atau Viewer untuk proteksi data.
                  </p>
                </div>
              </div>

              {/* Web App URL (Google Apps Script) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>URL Web App Google Apps Script</span>
                </label>
                <input
                  type="url"
                  value={gasUrl}
                  onChange={(e) => handleSaveGasUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                />
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Ambil Data Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-4">
                      Mengunduh data prestasi terbaru dari Google Spreadsheet ke aplikasi web.
                    </p>
                  </div>
                  <button
                    onClick={handleFetchFromGoogle}
                    disabled={isLoading || !gasUrl.trim()}
                    className="w-full py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Muat dari Spreadsheet</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Kirim Data ke Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-4">
                      Menyimpan seluruh ({data.length}) data prestasi lokal langsung ke Google Spreadsheet.
                    </p>
                  </div>
                  <button
                    onClick={handlePushToGoogle}
                    disabled={isLoading || !gasUrl.trim()}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAdmin ? 'Kirim ke Spreadsheet' : 'Masuk Admin untuk Kirim'}</span>
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
