import React from 'react';
import { ViewSubHalaman } from '../types/prestasi';
import { SCHOOL_INFO } from '../data/initialData';
import { 
  PlusCircle, 
  Award, 
  FileSpreadsheet, 
  Trophy, 
  FileText, 
  LogOut, 
  Cloud,
  ShieldCheck,
  User,
  ExternalLink,
  Lock,
  Database
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewSubHalaman;
  onNavigate: (view: ViewSubHalaman) => void;
  onOpenInputModal: () => void;
  totalPrestasi: number;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenCloudSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenInputModal,
  totalPrestasi,
  isAdmin,
  onOpenLoginModal,
  onLogout,
  onOpenCloudSync
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Zone 1: Brand Zone with Role Badge */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow-xs border border-blue-800 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors leading-tight">
                  SMP Negeri 1 Pontianak
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  SIMPRES Kesiswaan
                </div>
              </div>
            </button>

            {/* Access Role Badge */}
            <div className="hidden lg:flex items-center">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Kesiswaan</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <span>Akses Publik</span>
                </span>
              )}
            </div>
          </div>

          {/* Zone 2: Sub Halaman Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-900 border border-blue-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>

            {/* Sub Halaman 1: Hasil & Rekapitulasi */}
            <button
              onClick={() => onNavigate('rekap-hasil')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                currentView === 'rekap-hasil'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Hasil Lomba</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                currentView === 'rekap-hasil' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalPrestasi}
              </span>
            </button>

            {/* Sub Halaman 2: Papan Kejuaraan */}
            <button
              onClick={() => onNavigate('papan-kejuaraan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                currentView === 'papan-kejuaraan'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Papan Kejuaraan</span>
            </button>

            {/* Sub Halaman 3: Laporan Resmi */}
            <button
              onClick={() => onNavigate('laporan-resmi')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                currentView === 'laporan-resmi'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Laporan Resmi</span>
            </button>
          </nav>

          {/* Zone 3: Tombol Aksi, Akses Google Cloud, & Login/Keluar */}
          <div className="flex items-center gap-2">
            
            {/* Tombol Akses Google Sheets & Database Cloud */}
            <button
              onClick={onOpenCloudSync}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-all whitespace-nowrap cursor-pointer shadow-2xs"
              title="Koneksi Google Sheets (Google Drive) & Database Cloud"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            {/* Tombol Input Data Prestasi (Memerlukan Admin) */}
            <button
              onClick={() => {
                if (isAdmin) {
                  onOpenInputModal();
                } else {
                  onOpenLoginModal();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-xs hover:shadow-sm transition-all whitespace-nowrap cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              title={isAdmin ? "Tambah data kejuaraan baru" : "Masuk sebagai admin untuk input data"}
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Input Data</span>
              {!isAdmin && <Lock className="w-3 h-3 text-blue-200 ml-0.5 hidden md:inline" />}
            </button>

            {/* Auth Action: Logout or Login Modal Trigger */}
            {isAdmin ? (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-all whitespace-nowrap cursor-pointer"
                title="Keluar dari sesi administrator (kembali ke akses publik)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Keluar</span>
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-900 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 rounded-lg border border-slate-200 hover:border-blue-300 transition-all whitespace-nowrap cursor-pointer"
                title="Masuk sebagai administrator untuk mengelola data (admin/admin)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline">Masuk Admin</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden border-t border-slate-200 px-3 py-2 bg-slate-50 flex items-center justify-between overflow-x-auto gap-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            currentView === 'dashboard' ? 'bg-blue-900 text-white font-bold' : 'text-slate-700'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('rekap-hasil')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            currentView === 'rekap-hasil' ? 'bg-blue-900 text-white font-bold' : 'text-slate-700'
          }`}
        >
          Hasil Lomba ({totalPrestasi})
        </button>
        <button
          onClick={() => onNavigate('papan-kejuaraan')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            currentView === 'papan-kejuaraan' ? 'bg-blue-900 text-white font-bold' : 'text-slate-700'
          }`}
        >
          Papan Kejuaraan
        </button>
        <button
          onClick={() => onNavigate('laporan-resmi')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            currentView === 'laporan-resmi' ? 'bg-blue-900 text-white font-bold' : 'text-slate-700'
          }`}
        >
          Laporan
        </button>
      </div>
    </header>
  );
};
