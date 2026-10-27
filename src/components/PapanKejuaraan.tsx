import React, { useState } from 'react';
import { PrestasiSiswa, BidangLomba } from '../types/prestasi';
import { SCHOOL_INFO } from '../data/initialData';
import { Trophy, Medal, Award, Star, Sparkles, Eye, ArrowUpRight } from 'lucide-react';
import { formatTanggalIndonesia } from '../utils/helpers';

interface PapanKejuaraanProps {
  data: PrestasiSiswa[];
  onViewDetail: (item: PrestasiSiswa) => void;
  onOpenInputModal: () => void;
}

export const PapanKejuaraan: React.FC<PapanKejuaraanProps> = ({
  data,
  onViewDetail,
  onOpenInputModal
}) => {
  const [selectedBidang, setSelectedBidang] = useState<string>('SEMUA');

  const filteredData = selectedBidang === 'SEMUA' 
    ? data 
    : data.filter(d => d.bidang === selectedBidang);

  // Group by medal
  const emasList = filteredData.filter(d => d.capaian.includes('Juara 1') || d.capaian.includes('Emas'));
  const perakList = filteredData.filter(d => d.capaian.includes('Juara 2') || d.capaian.includes('Perak'));
  const perungguList = filteredData.filter(d => d.capaian.includes('Juara 3') || d.capaian.includes('Perunggu'));
  const lainnyaList = filteredData.filter(d => 
    !d.capaian.includes('Juara 1') && 
    !d.capaian.includes('Emas') && 
    !d.capaian.includes('Juara 2') && 
    !d.capaian.includes('Perak') && 
    !d.capaian.includes('Juara 3') && 
    !d.capaian.includes('Perunggu')
  );

  return (
    <div className="space-y-8">
      
      {/* Hero Showcase Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white p-6 sm:p-10 shadow-lg">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="/src/assets/images/student_award_ceremony_1790818002727.jpg" 
            alt="Ceremony" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>PAPAN PENGHARGAAN & HALL OF FAME SPENSA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Galeri Kejuaraan Siswa Berprestasi SMP Negeri 1 Pontianak
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Dedikasi tinggi siswa-siswi Spensa Pontianak yang mengharumkan nama sekolah dan Kota Pontianak di kancah daerah hingga nasional.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onOpenInputModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Input Prestasi Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter by Bidang */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Daftar Peraih Kejuaraan Berdasarkan Kategori
          </h2>
          <p className="text-xs text-slate-500">
            Pilih bidang untuk memfilter perolehan piala dan medali siswa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {['SEMUA', 'Akademik', 'Olahraga', 'Seni & Budaya', 'Teknologi & Riset', 'Keagamaan'].map(b => (
            <button
              key={b}
              onClick={() => setSelectedBidang(b)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedBidang === b 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {b === 'SEMUA' ? 'Semua Kategori' : b}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Empty State or Medal Showcases */}
      {filteredData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Trophy className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Belum Ada Koleksi Medali & Kejuaraan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Daftar perolehan piala dan medali siswa Spensa Pontianak masih kosong. Mulai input data hasil perlombaan untuk mengisi galeri kejuaraan ini.
          </p>
          <div className="mt-4">
            <button
              onClick={onOpenInputModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Input Prestasi Baru</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* SECTION 1: JUARA 1 / MEDALI EMAS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Peraih Juara 1 & Medali Emas ({emasList.length})</h3>
                <p className="text-xs text-slate-500">Pencapaian puncak pada perlombaan tingkat Kota, Provinsi, dan Nasional</p>
              </div>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emasList.map(item => (
            <div 
              key={item.id}
              className="bg-white border-2 border-amber-200/90 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {item.capaian}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-500">
                    +{item.poinPrestasi} Poin
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 hover:text-blue-900 transition-colors">
                    {item.namaSiswa}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelas {item.kelas} · {item.bidang}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs">
                  <div className="font-semibold text-slate-800 line-clamp-2">
                    {item.namaLomba}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Tingkat: <span className="font-medium text-slate-700">{item.tingkat}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Cabang: <span className="font-medium text-slate-700">{item.cabangLomba}</span>
                  </div>
                </div>

                {item.catatan && (
                  <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg text-[11px] text-amber-900 italic">
                    "{item.catatan}"
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Pembina: {item.guruPembimbing}
                </span>
                <button
                  onClick={() => onViewDetail(item)}
                  className="font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                >
                  <span>Lihat Piagam</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: JUARA 2 (PERAK) & JUARA 3 (PERUNGGU) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* PERAK */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
              <Medal className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Peraih Juara 2 & Medali Perak ({perakList.length})</h3>
              <p className="text-xs text-slate-500">Pencapaian posisi runner-up bergengsi</p>
            </div>
          </div>

          <div className="space-y-3">
            {perakList.map(item => (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{item.capaian}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs text-blue-800 font-medium">{item.tingkat}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.namaSiswa}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{item.namaLomba}</p>
                </div>
                <button
                  onClick={() => onViewDetail(item)}
                  className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg shrink-0"
                  title="Lihat Piagam"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PERUNGGU */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
              <Medal className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Peraih Juara 3 & Medali Perunggu ({perungguList.length})</h3>
              <p className="text-xs text-slate-500">Pencapaian podium ketiga kompetisi</p>
            </div>
          </div>

          <div className="space-y-3">
            {perungguList.map(item => (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-900">{item.capaian}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs text-blue-800 font-medium">{item.tingkat}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.namaSiswa}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{item.namaLomba}</p>
                </div>
                <button
                  onClick={() => onViewDetail(item)}
                  className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg shrink-0"
                  title="Lihat Piagam"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        </div>
      </div>
    )}

  </div>
);
};
