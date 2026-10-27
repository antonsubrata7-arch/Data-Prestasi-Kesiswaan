import React, { useState, useEffect } from 'react';
import { PrestasiSiswa, ViewSubHalaman } from './types/prestasi';
import { INITIAL_PRESTASI_DATA, SCHOOL_INFO } from './data/initialData';
import { Navbar } from './components/Navbar';
import { InputDataModal } from './components/InputDataModal';
import { SubHalamanHasil } from './components/SubHalamanHasil';
import { PapanKejuaraan } from './components/PapanKejuaraan';
import { LaporanResmi } from './components/LaporanResmi';
import { DashboardView } from './components/DashboardView';
import { DetailPrestasiModal } from './components/DetailPrestasiModal';
import { LoginModal } from './components/LoginModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { CheckCircle2, Award } from 'lucide-react';

const STORAGE_KEY = 'smpn1_pontianak_prestasi_v3';

export default function App() {
  // Load data from localStorage or default to rich INITIAL_PRESTASI_DATA
  const [prestasiList, setPrestasiList] = useState<PrestasiSiswa[]>(() => {
    try {
      localStorage.removeItem('smpn1_pontianak_prestasi_v1');
      localStorage.removeItem('smpn1_pontianak_prestasi_v2');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load local storage data', e);
    }
    return INITIAL_PRESTASI_DATA;
  });

  // Authentication state (Admin role)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('smpn1_auth') === 'true';
  });

  // Modal Login state for public-to-admin switching
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Current sub-page view
  const [currentView, setCurrentView] = useState<ViewSubHalaman>('dashboard');

  // Input modal state
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PrestasiSiswa | null>(null);

  // Detail certificate modal state
  const [detailItem, setDetailItem] = useState<PrestasiSiswa | null>(null);

  // Cloud sync modal state
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prestasiList));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [prestasiList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handler when new or edited data is saved
  const handleSavePrestasi = (newItem: PrestasiSiswa) => {
    setPrestasiList(prev => {
      const existsIndex = prev.findIndex(item => item.id === newItem.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = newItem;
        return updated;
      } else {
        return [newItem, ...prev];
      }
    });

    // Automatically navigate to the Sub Halaman Hasil Lomba
    setCurrentView('rekap-hasil');
    showToast(`Data hasil lomba "${newItem.namaSiswa}" berhasil disimpan dan ditampilkan pada sub halaman hasil!`);
  };

  const handleEdit = (item: PrestasiSiswa) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditItem(item);
    setIsInputModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setPrestasiList(prev => prev.filter(item => item.id !== id));
    showToast('Data perlombaan telah dihapus dari sistem.');
  };

  const handleClearAllData = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    if (window.confirm('Kosongkan semua data hasil perlombaan di dashboard, tabel rinci, dan kartu galeri?')) {
      setPrestasiList([]);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      } catch (e) {
        console.error(e);
      }
      showToast('Seluruh data prestasi di dashboard, tabel rinci, dan kartu galeri telah dikosongkan.');
    }
  };

  const handleResetDefault = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    if (window.confirm('Muat data contoh perlombaan SMP Negeri 1 Pontianak?')) {
      setPrestasiList(INITIAL_PRESTASI_DATA);
      showToast('Data contoh perlombaan SMP Negeri 1 Pontianak berhasil dimuat.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-200 selection:text-slate-900 font-sans">
      
      {/* Top Navigation Bar with 3-Zone Contract & Public/Admin Switching */}
      <Navbar 
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenInputModal={() => {
          if (isAuthenticated) {
            setEditItem(null);
            setIsInputModalOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        totalPrestasi={prestasiList.length}
        isAdmin={isAuthenticated}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          sessionStorage.removeItem('smpn1_auth');
          setIsAuthenticated(false);
          showToast('Anda telah keluar. Beralih ke mode akses publik (hanya lihat).');
        }}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentView === 'dashboard' && (
          <DashboardView 
            data={prestasiList}
            onNavigate={setCurrentView}
            onOpenInputModal={() => {
              if (isAuthenticated) {
                setEditItem(null);
                setIsInputModalOpen(true);
              } else {
                setIsLoginModalOpen(true);
              }
            }}
            onViewDetail={setDetailItem}
            isAdmin={isAuthenticated}
            onRequireAdmin={() => setIsLoginModalOpen(true)}
            onOpenGoogleAccess={() => setIsCloudSyncModalOpen(true)}
          />
        )}

        {currentView === 'rekap-hasil' && (
          <SubHalamanHasil 
            data={prestasiList}
            onOpenInputModal={() => {
              if (isAuthenticated) {
                setEditItem(null);
                setIsInputModalOpen(true);
              } else {
                setIsLoginModalOpen(true);
              }
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetail={setDetailItem}
            onResetDefault={handleResetDefault}
            onClearAll={handleClearAllData}
            onNavigate={setCurrentView}
            isAdmin={isAuthenticated}
            onRequireAdmin={() => setIsLoginModalOpen(true)}
            onOpenGoogleAccess={() => setIsCloudSyncModalOpen(true)}
          />
        )}

        {currentView === 'papan-kejuaraan' && (
          <PapanKejuaraan 
            data={prestasiList}
            onViewDetail={setDetailItem}
            onOpenInputModal={() => {
              if (isAuthenticated) {
                setEditItem(null);
                setIsInputModalOpen(true);
              } else {
                setIsLoginModalOpen(true);
              }
            }}
          />
        )}

        {currentView === 'laporan-resmi' && (
          <LaporanResmi 
            data={prestasiList}
          />
        )}

      </main>

      {/* Modal Input / Edit Data */}
      <InputDataModal 
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setEditItem(null);
        }}
        onSave={handleSavePrestasi}
        editItem={editItem}
      />

      {/* Modal Detail / Piagam Digital */}
      <DetailPrestasiModal 
        item={detailItem}
        onClose={() => setDetailItem(null)}
      />

      {/* Modal Sinkronisasi Google Spreadsheet Cloud */}
      <CloudSyncModal 
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        data={prestasiList}
        onSyncData={setPrestasiList}
        showToast={showToast}
        isAdmin={isAuthenticated}
        onRequireAdmin={() => setIsLoginModalOpen(true)}
      />

      {/* Modal Login Administrator */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          sessionStorage.setItem('smpn1_auth', 'true');
          setIsAuthenticated(true);
          showToast('Berhasil masuk sebagai administrator!');
        }}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-medium pr-2">
            {toastMessage}
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Official School Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SMP NEGERI 1 KOTA PONTIANAK</span>
            <span aria-hidden="true">·</span>
            <span>Bidang Kesiswaan (Wakakesiswaan)</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            {SCHOOL_INFO.alamat} · Telp: {SCHOOL_INFO.telepon}
          </div>
        </div>
      </footer>

    </div>
  );
}
