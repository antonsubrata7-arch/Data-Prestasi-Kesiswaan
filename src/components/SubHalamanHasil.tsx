import React, { useState, useMemo } from 'react';
import { PrestasiSiswa, FilterPrestasiState } from '../types/prestasi';
import { formatTanggalIndonesia, exportToCSV, downloadCSVTemplate } from '../utils/helpers';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Trophy, 
  Award, 
  Medal, 
  Layers, 
  FileText, 
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  Calendar,
  UserCheck,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface SubHalamanHasilProps {
  data: PrestasiSiswa[];
  onOpenInputModal: () => void;
  onEdit: (item: PrestasiSiswa) => void;
  onDelete: (id: string) => void;
  onViewDetail: (item: PrestasiSiswa) => void;
  onResetDefault: () => void;
  onClearAll?: () => void;
  onNavigate?: (view: any) => void;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  onOpenGoogleAccess?: () => void;
}

export const SubHalamanHasil: React.FC<SubHalamanHasilProps> = ({
  data,
  onOpenInputModal,
  onEdit,
  onDelete,
  onViewDetail,
  onResetDefault,
  onClearAll,
  onNavigate,
  isAdmin = false,
  onRequireAdmin,
  onOpenGoogleAccess
}) => {
  const [filters, setFilters] = useState<FilterPrestasiState>({
    searchQuery: '',
    tingkat: 'SEMUA',
    bidang: 'SEMUA',
    jenisLomba: 'SEMUA',
    capaian: 'SEMUA',
    tahunAjaran: 'SEMUA',
    kelas: 'SEMUA'
  });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered & searched data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = filters.searchQuery === '' || 
        item.namaSiswa.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.namaLomba.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.cabangLomba.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.guruPembimbing.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.nomorSertifikat.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.nisn.includes(filters.searchQuery);

      const matchTingkat = filters.tingkat === 'SEMUA' || item.tingkat === filters.tingkat;
      const matchBidang = filters.bidang === 'SEMUA' || item.bidang === filters.bidang;
      const matchJenis = !filters.jenisLomba || filters.jenisLomba === 'SEMUA' || item.jenisLomba === filters.jenisLomba;
      const matchCapaian = filters.capaian === 'SEMUA' || item.capaian.startsWith(filters.capaian);
      const matchTahun = filters.tahunAjaran === 'SEMUA' || item.tahunAjaran === filters.tahunAjaran;

      return matchSearch && matchTingkat && matchBidang && matchJenis && matchCapaian && matchTahun;
    });
  }, [data, filters]);

  // Key metrics calculation
  const totalJuara1 = data.filter(d => d.capaian.includes('Juara 1') || d.capaian.includes('Emas')).length;
  const totalJuara2 = data.filter(d => d.capaian.includes('Juara 2') || d.capaian.includes('Perak')).length;
  const totalJuara3 = data.filter(d => d.capaian.includes('Juara 3') || d.capaian.includes('Perunggu')).length;
  const totalPoin = data.reduce((acc, curr) => acc + (curr.poinPrestasi || 0), 0);

  const handleExport = () => {
    const filename = `Rekapitulasi_Prestasi_SMPN1_Pontianak_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(filteredData, filename);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Breadcrumb Zone */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 mb-1">
            <span>Wakakesiswaan SMPN 1 Pontianak</span>
            <span aria-hidden="true">·</span>
            <span>Sub Halaman Rekapitulasi</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">Tahun Ajaran 2025/2026 & 2026/2027</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Data Hasil Perlombaan & Kejuaraan Siswa
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Hasil pencatatan resmi prestasi siswa-siswi SMP Negeri 1 Kota Pontianak di tingkat Kota, Provinsi, Nasional, dan Internasional.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (isAdmin) {
                onOpenInputModal();
              } else if (onRequireAdmin) {
                onRequireAdmin();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Data Prestasi</span>
          </button>

          {onOpenGoogleAccess && (
            <button
              onClick={onOpenGoogleAccess}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              title="Akses data secara umum di Google Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Akses Google Spreadsheet</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors whitespace-nowrap cursor-pointer"
            title="Unduh data tabel ke format CSV / Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={downloadCSVTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 transition-colors whitespace-nowrap cursor-pointer"
            title="Unduh format template kosong Excel/CSV untuk input massal"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh Template Excel/CSV</span>
          </button>

          {isAdmin && onClearAll && data.length > 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-slate-500 hover:text-red-700 text-xs font-medium rounded-lg border border-slate-200 hover:border-red-200 transition-colors whitespace-nowrap cursor-pointer"
              title="Kosongkan seluruh data tabel dan kartu"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
              <span>Kosongkan Data</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onResetDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-medium rounded-lg border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
              title="Muat contoh data perlombaan SMPN 1 Pontianak"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Data Contoh</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Total Prestasi</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">{data.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Semua Bidang</div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-amber-800 uppercase tracking-wide flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" /> Emas / Juara 1
          </div>
          <div className="text-2xl font-bold text-amber-900 tabular-nums mt-0.5">{totalJuara1}</div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Prestasi Tertinggi</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wide flex items-center gap-1">
            <Medal className="w-3 h-3 text-slate-400" /> Perak / Juara 2
          </div>
          <div className="text-2xl font-bold text-slate-700 tabular-nums mt-0.5">{totalJuara2}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tingkat Kota & Prov</div>
        </div>

        <div className="bg-white border border-orange-200/60 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-orange-800 uppercase tracking-wide flex items-center gap-1">
            <Medal className="w-3 h-3 text-amber-700" /> Perunggu / Juara 3
          </div>
          <div className="text-2xl font-bold text-amber-950 tabular-nums mt-0.5">{totalJuara3}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kejuaraan Terbuka</div>
        </div>

        <div className="bg-white border border-blue-200/80 rounded-lg p-3.5 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-medium text-blue-900 uppercase tracking-wide">Poin Kesiswaan</div>
          <div className="text-2xl font-bold text-blue-900 tabular-nums mt-0.5">{totalPoin}</div>
          <div className="text-[11px] text-blue-700/80 mt-0.5">Akumulasi Poin</div>
        </div>
      </div>

      {/* Filter and Control Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama siswa, nama lomba, guru pembimbing, NISN, atau no sertifikat..."
              value={filters.searchQuery}
              onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-hidden transition-all"
            />
            {filters.searchQuery && (
              <button 
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Hapus
              </button>
            )}
          </div>

          {/* View Switcher: Table vs Cards */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-end lg:self-center">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel Rinci</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Galeri</span>
            </button>
          </div>
        </div>

        {/* Multi-criteria filter selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tingkat Kejuaraan
            </label>
            <select
              value={filters.tingkat}
              onChange={e => setFilters({ ...filters, tingkat: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="SEMUA">Semua Tingkat</option>
              <option value="Kecamatan">Kecamatan</option>
              <option value="Kota Pontianak">Kota Pontianak</option>
              <option value="Kota Singkawang">Kota Singkawang</option>
              <option value="Kabupaten">Kabupaten</option>
              <option value="Provinsi Kalimantan Barat">Provinsi Kalimantan Barat</option>
              <option value="Nasional">Nasional</option>
              <option value="Internasional">Internasional</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Bidang Prestasi
            </label>
            <select
              value={filters.bidang}
              onChange={e => setFilters({ ...filters, bidang: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="SEMUA">Semua Bidang</option>
              <option value="Akademik">Akademik</option>
              <option value="Olahraga">Olahraga</option>
              <option value="Seni & Budaya">Seni & Budaya</option>
              <option value="Teknologi & Riset">Teknologi & Riset</option>
              <option value="Keagamaan">Keagamaan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Jenis Lomba
            </label>
            <select
              value={filters.jenisLomba || 'SEMUA'}
              onChange={e => setFilters({ ...filters, jenisLomba: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="SEMUA">Semua Jenis Lomba</option>
              <option value="Individu (Perorangan)">Individu (Perorangan)</option>
              <option value="Beregu (Tim / Kelompok)">Beregu (Tim / Kelompok)</option>
              <option value="Ganda (Pasangan)">Ganda (Pasangan)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Capaian Juara
            </label>
            <select
              value={filters.capaian}
              onChange={e => setFilters({ ...filters, capaian: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="SEMUA">Semua Capaian</option>
              <option value="Juara 1">Juara 1 (Emas)</option>
              <option value="Juara 2">Juara 2 (Perak)</option>
              <option value="Juara 3">Juara 3 (Perunggu)</option>
              <option value="Harapan">Harapan</option>
              <option value="Finalis">Finalis</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tahun Ajaran
            </label>
            <select
              value={filters.tahunAjaran}
              onChange={e => setFilters({ ...filters, tahunAjaran: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="SEMUA">Semua Tahun</option>
              <option value="2026/2027">2026/2027</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>
        </div>

        {/* Filter status row */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Menampilkan <span className="font-semibold text-slate-900 tabular-nums">{filteredData.length}</span> dari{' '}
            <span className="tabular-nums">{data.length}</span> data hasil perlombaan.
          </div>
          {(filters.searchQuery || filters.tingkat !== 'SEMUA' || filters.bidang !== 'SEMUA' || (filters.jenisLomba && filters.jenisLomba !== 'SEMUA') || filters.capaian !== 'SEMUA' || filters.tahunAjaran !== 'SEMUA') && (
            <button
              onClick={() => setFilters({
                searchQuery: '',
                tingkat: 'SEMUA',
                bidang: 'SEMUA',
                jenisLomba: 'SEMUA',
                capaian: 'SEMUA',
                tahunAjaran: 'SEMUA',
                kelas: 'SEMUA'
              })}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main View Area: Table or Card Grid */}
      {filteredData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            {data.length === 0 ? <Trophy className="w-6 h-6 text-slate-400" /> : <Search className="w-6 h-6 text-slate-400" />}
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {data.length === 0 
              ? `Belum Ada Data Hasil Perlombaan pada ${viewMode === 'table' ? 'Tabel Rinci' : 'Kartu Galeri'}`
              : 'Tidak ada data hasil perlombaan yang cocok dengan filter'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {data.length === 0
              ? 'Data perlombaan siswa SMP Negeri 1 Pontianak saat ini kosong. Anda dapat langsung menginput data baru atau memuat data contoh.'
              : 'Coba sesuaikan kata kunci pencarian atau reset filter untuk menampilkan seluruh data siswa SMPN 1 Pontianak.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={onOpenInputModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Data Perlombaan Baru</span>
            </button>
            {data.length === 0 && (
              <button
                onClick={onResetDefault}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>Muat Data Contoh</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABULAR DATA VIEW (Admin Standard) */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-4">Siswa / Tim</th>
                  <th className="py-3 px-4">Nama Perlombaan & Cabang</th>
                  <th className="py-3 px-3">Jenis Lomba</th>
                  <th className="py-3 px-3">Tingkat & Penyelenggara</th>
                  <th className="py-3 px-3">Capaian Juara</th>
                  <th className="py-3 px-3">Poin</th>
                  <th className="py-3 px-3">Waktu & SK</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredData.map((item, index) => {
                  const isGold = item.capaian.includes('Juara 1') || item.capaian.includes('Emas');
                  const isSilver = item.capaian.includes('Juara 2') || item.capaian.includes('Perak');
                  const isBronze = item.capaian.includes('Juara 3') || item.capaian.includes('Perunggu');

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {index + 1}
                      </td>

                      {/* Siswa & Kelas */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-900">
                          {item.namaSiswa}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          {item.kelas && item.kelas !== '-' ? (
                            <>
                              <span className="font-medium text-slate-700">{item.kelas}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          ) : null}
                          <span className="font-mono tabular-nums">NISN: {item.nisn}</span>
                        </div>
                      </td>

                      {/* Lomba & Bidang */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate" title={item.namaLomba}>
                          {item.namaLomba}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="text-blue-800 font-medium">{item.bidang}</span>
                          <span aria-hidden="true">/</span>
                          <span className="truncate">{item.cabangLomba}</span>
                        </div>
                      </td>

                      {/* Jenis Lomba */}
                      <td className="py-3 px-3">
                        <span className={`inline-block font-medium text-[11px] ${
                          item.jenisLomba?.includes('Beregu') 
                            ? 'text-indigo-900 font-semibold' 
                            : 'text-slate-700'
                        }`}>
                          {item.jenisLomba || 'Individu (Perorangan)'}
                        </span>
                      </td>

                      {/* Tingkat & Penyelenggara */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">
                          {item.tingkat}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]" title={item.penyelenggara}>
                          {item.penyelenggara}
                        </div>
                      </td>

                      {/* Capaian */}
                      <td className="py-3 px-3">
                        <div className={`font-semibold inline-flex items-center gap-1 ${
                          isGold ? 'text-amber-800' : isSilver ? 'text-slate-700' : isBronze ? 'text-amber-900' : 'text-slate-600'
                        }`}>
                          {isGold && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {isSilver && <Medal className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                          {isBronze && <Medal className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                          <span>{item.capaian}</span>
                        </div>
                      </td>

                      {/* Poin Prestasi */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-blue-900 tabular-nums">
                          +{item.poinPrestasi}
                        </div>
                        <div className="text-[10px] text-slate-400">Poin PPDB</div>
                      </td>

                      {/* Waktu & Sertifikat */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700 tabular-nums">
                          {formatTanggalIndonesia(item.tanggal)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" title={item.nomorSertifikat}>
                          {item.nomorSertifikat || '-'}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewDetail(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Lihat Detail Sertifikat & Piagam"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                                title="Edit Data Perlombaan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GALLERY VIEW (Visual Showcase) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map(item => {
            const isGold = item.capaian.includes('Juara 1') || item.capaian.includes('Emas');
            return (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    <img 
                      src={item.fotoDokumentasi || '/src/assets/images/student_award_ceremony_1790818002727.jpg'} 
                      alt={item.namaLomba}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-3">
                      <div className="text-white">
                        <span className="text-xs font-bold text-amber-300 block">
                          {item.capaian}
                        </span>
                        <span className="text-[11px] text-slate-200 block truncate">
                          {item.tingkat}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{item.bidang} · {item.jenisLomba || 'Individu'}</span>
                      <span className="font-mono tabular-nums font-semibold text-blue-900">+{item.poinPrestasi} Poin</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {item.namaSiswa}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {item.kelas && item.kelas !== '-' ? `Kelas ${item.kelas} · ` : ''}NISN: {item.nisn}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-700 font-medium line-clamp-2">
                        {item.namaLomba}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Cabang: {item.cabangLomba}
                      </p>
                    </div>

                    {item.catatan && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-md">
                        "{item.catatan}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {formatTanggalIndonesia(item.tanggal)}
                  </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewDetail(item)}
                        className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                      >
                        Detail Piagam
                      </button>
                      {isAdmin && (
                        <>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onEdit(item)}
                            className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">Konfirmasi Penghapusan</h4>
            <p className="text-xs text-slate-600 mt-2">
              Apakah Anda yakin ingin menghapus data perlombaan ini dari basis data kesiswaan? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
