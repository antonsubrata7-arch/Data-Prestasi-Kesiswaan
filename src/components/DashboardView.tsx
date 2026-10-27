import React, { useState } from 'react';
import { PrestasiSiswa, ViewSubHalaman } from '../types/prestasi';
import { SCHOOL_INFO } from '../data/initialData';
import { 
  PlusCircle, 
  ArrowRight, 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Users, 
  FileSpreadsheet, 
  FileCheck,
  CheckCircle,
  Sparkles,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { formatTanggalIndonesia } from '../utils/helpers';

interface DashboardViewProps {
  data: PrestasiSiswa[];
  onNavigate: (view: ViewSubHalaman) => void;
  onOpenInputModal: () => void;
  onViewDetail: (item: PrestasiSiswa) => void;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  onOpenGoogleAccess?: () => void;
}

const DEFAULT_BANNER_DESC = "Sistem Informasi Resmi Kesiswaan untuk mendata, memantau, dan merekapitulasi seluruh hasil perlombaan serta prestasi siswa-siswi SMP Negeri 1 Kota Pontianak, baik di bidang akademik maupun non-akademik.";

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onOpenInputModal,
  onViewDetail,
  isAdmin = false,
  onRequireAdmin,
  onOpenGoogleAccess
}) => {
  const [description, setDescription] = useState<string>(() => {
    try {
      return localStorage.getItem('smpn1_banner_desc') || DEFAULT_BANNER_DESC;
    } catch {
      return DEFAULT_BANNER_DESC;
    }
  });

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(description);

  const handleSaveDesc = () => {
    const finalDesc = tempDesc.trim() || DEFAULT_BANNER_DESC;
    setDescription(finalDesc);
    try {
      localStorage.setItem('smpn1_banner_desc', finalDesc);
    } catch (e) {
      console.error(e);
    }
    setIsEditingDesc(false);
  };

  const totalJuara1 = data.filter(d => d.capaian.includes('Juara 1') || d.capaian.includes('Emas')).length;
  const totalJuara2 = data.filter(d => d.capaian.includes('Juara 2') || d.capaian.includes('Perak')).length;
  const totalJuara3 = data.filter(d => d.capaian.includes('Juara 3') || d.capaian.includes('Perunggu')).length;
  const totalPoin = data.reduce((acc, curr) => acc + (curr.poinPrestasi || 0), 0);

  // Group by level
  const byTingkat = {
    'Kecamatan': data.filter(d => d.tingkat === 'Kecamatan').length,
    'Kota Pontianak': data.filter(d => d.tingkat === 'Kota Pontianak').length,
    'Kota Singkawang': data.filter(d => d.tingkat === 'Kota Singkawang').length,
    'Kabupaten': data.filter(d => d.tingkat === 'Kabupaten').length,
    'Provinsi Kalimantan Barat': data.filter(d => d.tingkat === 'Provinsi Kalimantan Barat').length,
    'Nasional': data.filter(d => d.tingkat === 'Nasional').length,
    'Internasional': data.filter(d => d.tingkat === 'Internasional').length,
  };

  const tingkatConfig: Record<string, { barColor: string; dotColor: string }> = {
    'Kecamatan': { barColor: 'bg-teal-500', dotColor: 'bg-teal-500' },
    'Kota Pontianak': { barColor: 'bg-blue-600', dotColor: 'bg-blue-600' },
    'Kota Singkawang': { barColor: 'bg-cyan-600', dotColor: 'bg-cyan-600' },
    'Kabupaten': { barColor: 'bg-emerald-600', dotColor: 'bg-emerald-600' },
    'Provinsi Kalimantan Barat': { barColor: 'bg-amber-600', dotColor: 'bg-amber-600' },
    'Nasional': { barColor: 'bg-rose-600', dotColor: 'bg-rose-600' },
    'Internasional': { barColor: 'bg-purple-600', dotColor: 'bg-purple-600' },
  };

  // Group by category
  const byBidang = {
    'Akademik': data.filter(d => d.bidang === 'Akademik').length,
    'Olahraga': data.filter(d => d.bidang === 'Olahraga').length,
    'Seni & Budaya': data.filter(d => d.bidang === 'Seni & Budaya').length,
    'Teknologi & Riset': data.filter(d => d.bidang === 'Teknologi & Riset').length,
    'Keagamaan': data.filter(d => d.bidang === 'Keagamaan').length,
  };

  const recentItems = [...data].slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-6 sm:p-10 shadow-md border border-blue-900/50">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-800/80 text-blue-200 border border-blue-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Portal Kesiswaan SMP Negeri 1 Kota Pontianak</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Sistem Pendataan Prestasi Siswa
          </h1>
          
          {isEditingDesc ? (
            <div className="space-y-2 pt-1">
              <textarea
                value={tempDesc}
                onChange={e => setTempDesc(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-950/80 border border-blue-400 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                placeholder="Tuliskan kata-kata deskripsi dashboard..."
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDesc}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTempDesc(DEFAULT_BANNER_DESC)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 text-xs rounded-md cursor-pointer"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempDesc(description);
                    setIsEditingDesc(false);
                  }}
                  className="px-2.5 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-8">
                {description}
              </p>
              <button
                type="button"
                onClick={() => {
                  setTempDesc(description);
                  setIsEditingDesc(true);
                }}
                className="absolute top-0 right-0 p-1 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded-md transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                title="Ubah kata-kata deskripsi ini"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (isAdmin) {
                  onOpenInputModal();
                } else if (onRequireAdmin) {
                  onRequireAdmin();
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Input Data Perlombaan Baru</span>
            </button>

            <button
              onClick={() => onNavigate('rekap-hasil')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-300" />
              <span>Buka Sub Halaman Hasil Lomba</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {onOpenGoogleAccess && (
              <button
                onClick={onOpenGoogleAccess}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg border border-emerald-400/40 transition-all cursor-pointer"
                title="Akses data secara online di Google Spreadsheet"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Akses Google Spreadsheet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Lomba Tercatat</span>
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {data.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Tahun 2025/2026 & 2026/2027</span>
            <button 
              onClick={() => onNavigate('rekap-hasil')} 
              className="text-blue-700 hover:underline font-medium"
            >
              Lihat tabel &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white border border-amber-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Perolehan Medali Emas</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-900 tabular-nums">
            {totalJuara1}
          </div>
          <div className="text-xs text-amber-700/80 mt-1">
            Juara 1 Tingkat Kota, Prov & Nasional
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Medali Perak & Perunggu</span>
            <Medal className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-700 tabular-nums">
            {totalJuara2 + totalJuara3}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalJuara2} Perak · {totalJuara3} Perunggu
          </div>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-blue-900 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Poin Kesiswaan</span>
            <TrendingUp className="w-5 h-5 text-blue-700" />
          </div>
          <div className="text-3xl font-extrabold text-blue-900 tabular-nums">
            {totalPoin}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Akumulasi skor pembinaan siswa
          </div>
        </div>

      </div>

      {/* Two Column Layout: Tingkat & Bidang Distribution + Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Breakdown Info */}
        <div className="space-y-6">
          
          {/* Tingkat Perlombaan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-700" />
                  <span>Sebaran Tingkat Perlombaan</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rekapitulasi tingkat kota/kabupaten hingga nasional
                </p>
              </div>
              <button 
                onClick={() => onNavigate('rekap-hasil')} 
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                Tabel &rarr;
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {Object.entries(byTingkat).map(([tingkat, count]) => {
                const percentage = data.length > 0 ? Math.round((count / data.length) * 100) : 0;
                const cfg = tingkatConfig[tingkat] || { barColor: 'bg-blue-800', dotColor: 'bg-blue-800' };
                return (
                  <div key={tingkat} className="group">
                    <div className="flex justify-between items-center text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className={`w-2 h-2 rounded-full ${cfg.dotColor} shrink-0`} />
                        <span>{tingkat}</span>
                      </span>
                      <span className="font-semibold tabular-nums text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${cfg.barColor} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bidang Prestasi */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Distribusi Bidang Prestasi</span>
              <Users className="w-4 h-4 text-amber-600" />
            </h3>
            <div className="space-y-2 text-xs">
              {Object.entries(byBidang).map(([bidang, count]) => (
                <div key={bidang} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-none">
                  <span className="text-slate-700">{bidang}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums bg-slate-100 px-2 py-0.5 rounded-md">
                    {count} prestasi
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Recent Achievements List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Data Hasil Perlombaan Terakhir Masuk
                </h3>
                <p className="text-xs text-slate-500">
                  5 hasil kejuaraan terbaru yang dicatat oleh tim Kesiswaan
                </p>
              </div>
              <button
                onClick={() => onNavigate('rekap-hasil')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
              >
                <span>Buka Sub Halaman Hasil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentItems.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Trophy className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700">
                  Belum Ada Data Perlombaan Tercatat
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Data hasil kejuaraan yang diinput oleh tim Kesiswaan akan otomatis tampil di rekapitulasi dashboard ini.
                </p>
                <button
                  type="button"
                  onClick={onOpenInputModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Input Data Perlombaan Pertama</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentItems.map(item => (
                  <div 
                    key={item.id}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${
                          item.capaian.includes('Juara 1') ? 'text-amber-800' : 'text-slate-700'
                        }`}>
                          {item.capaian}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-blue-800 font-medium">{item.tingkat}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900">{item.namaSiswa}</h4>
                      <p className="text-xs text-slate-600 line-clamp-1">{item.namaLomba}</p>
                      <div className="text-[11px] text-slate-400">
                        Kelas {item.kelas} · {formatTanggalIndonesia(item.tanggal)}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-xs font-mono font-bold text-blue-900 tabular-nums">
                        +{item.poinPrestasi} Poin
                      </span>
                      <button
                        onClick={() => onViewDetail(item)}
                        className="text-xs text-slate-600 hover:text-blue-900 border border-slate-200 px-2 py-1 rounded-md hover:bg-white"
                      >
                        Lihat Piagam
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Ingin mendata hasil perlombaan siswa yang baru?
            </span>
            <button
              onClick={onOpenInputModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Data Sekarang</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
