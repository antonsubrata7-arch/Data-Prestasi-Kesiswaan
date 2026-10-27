import React, { useState } from 'react';
import { SCHOOL_INFO } from '../data/initialData';
import { ShieldCheck, User, Lock, Award, ArrowRight, AlertCircle, X, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (username.trim() === 'admin' && password === 'admin') {
        onLoginSuccess();
        onClose();
      } else {
        setError('Username atau password salah. Gunakan username: admin dan password: admin');
      }
      setIsLoading(false);
    }, 350);
  };

  const handleAutoFill = () => {
    setUsername('admin');
    setPassword('admin');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative animate-scaleUp">
        
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/80 rounded-lg transition-colors cursor-pointer"
            title="Tutup / Kembali ke Akses Publik"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-md border border-amber-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-amber-300 tracking-wider uppercase">
                Akses Khusus Administrator
              </div>
              <h3 className="font-bold text-lg text-white">
                Masuk ke SIMPRES
              </h3>
            </div>
          </div>
          <p className="text-xs text-blue-200 mt-2">
            Masuk untuk mengelola data prestasi, input kejuaraan baru, atau menyinkronkan data online.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Gagal Masuk</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-semibold rounded-xl shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Masuk sebagai Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Helper Button */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="text-xs text-blue-900">
              Kredensial: <span className="font-bold">admin / admin</span>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
            >
              Isi Otomatis
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Bukan administrator?</span>
            <button
              type="button"
              onClick={onClose}
              className="font-medium text-slate-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              Lanjutkan Akses Publik (Lihat Data)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
