import React, { useState } from 'react';
import { SCHOOL_INFO } from '../data/initialData';
import { ShieldCheck, User, Lock, Award, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (username.trim() === 'admin' && password === 'admin') {
        onLoginSuccess();
      } else {
        setError('Username atau password salah. Gunakan username: admin dan password: admin');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 selection:bg-amber-300 selection:text-slate-950">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* School Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 text-slate-950 mb-4 border-2 border-amber-300 transform hover:scale-105 transition-transform duration-300">
            <Award className="w-10 h-10" />
          </div>
          <div className="inline-block px-3 py-1 bg-blue-800/80 backdrop-blur-md text-amber-300 text-xs font-semibold rounded-full border border-blue-600/50 mb-2">
            PORTAL RESMI KESISWAAN
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {SCHOOL_INFO.namaSekolah}
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Sistem Pendataan & Rekapitulasi Prestasi Peserta Didik
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-10">
          
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Autentikasi Administrator</h2>
              <p className="text-xs text-slate-500">Silakan masuk untuk mengakses sistem</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Gagal Masuk</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Username Administrator
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
                  placeholder="Masukkan username (admin)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password (admin)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Kredensial Default:<br />
              <span className="font-semibold text-blue-900">Username: admin</span> | <span className="font-semibold text-blue-900">Password: admin</span>
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-blue-200/70">
          &copy; {new Date().getFullYear()} {SCHOOL_INFO.namaSekolah} &bull; Sistem Pendataan Prestasi
        </div>

      </div>

    </div>
  );
};
