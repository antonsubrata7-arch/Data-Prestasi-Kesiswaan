import React, { useState } from 'react';
import { PrestasiSiswa } from '../types/prestasi';
import { SCHOOL_INFO } from '../data/initialData';
import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { formatTanggalIndonesia, exportToCSV } from '../utils/helpers';
import { generateLaporanResmiPDF } from '../utils/pdfExport';

interface LaporanResmiProps {
  data: PrestasiSiswa[];
}

export const LaporanResmi: React.FC<LaporanResmiProps> = ({ data }) => {
  const [selectedTahun, setSelectedTahun] = useState<string>('SEMUA');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [nomorLaporan] = useState<string>(
    () => `421.3/${Math.floor(100 + Math.random() * 900)}/SPENSA-KESISWAAN/${new Date().getFullYear()}`
  );

  const filteredData = selectedTahun === 'SEMUA'
    ? data
    : data.filter(d => d.tahunAjaran === selectedTahun);

  const totalJuara1 = filteredData.filter(d => d.capaian.includes('Juara 1') || d.capaian.includes('Emas')).length;
  const totalJuara2 = filteredData.filter(d => d.capaian.includes('Juara 2') || d.capaian.includes('Perak')).length;
  const totalJuara3 = filteredData.filter(d => d.capaian.includes('Juara 3') || d.capaian.includes('Perunggu')).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportToCSV(filteredData, `Laporan_Resmi_Kesiswaan_SMPN1_Pontianak_${selectedTahun}`);
  };

  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      generateLaporanResmiPDF({
        data: filteredData,
        tahunAjaran: selectedTahun,
        nomorLaporan
      });
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Control bar (Hidden during print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Format Laporan Resmi Kesiswaan
          </h2>
          <p className="text-xs text-slate-500">
            Dokumen cetak resmi bertanda tangan untuk Kepala Sekolah dan Pengawas Dinas Pendidikan Kota Pontianak
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedTahun}
            onChange={e => setSelectedTahun(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden"
          >
            <option value="SEMUA">Semua Tahun Ajaran</option>
            <option value="2026/2027">Tahun Ajaran 2026/2027</option>
            <option value="2025/2026">Tahun Ajaran 2025/2026</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor Spreadsheet</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-700 hover:bg-red-800 active:scale-98 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Unduh langsung dokumen PDF Laporan Resmi SMP Negeri 1 Pontianak"
          >
            {pdfDownloaded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>PDF Terunduh</span>
              </>
            ) : isExportingPdf ? (
              <>
                <FileText className="w-3.5 h-3.5 animate-pulse text-white" />
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-red-200" />
                <span>Export ke PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* OFFICIAL PAPER DOCUMENT (Designed for standard A4 print & formal presentation) */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm max-w-5xl mx-auto text-slate-900 font-sans print:border-none print:shadow-none print:p-0">
        
        {/* KOP SURAT RESMI */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
          <div className="text-center">
            <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-800">
              Pemerintah Kota Pontianak
            </h3>
            <h2 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-900">
              Dinas Pendidikan dan Kebudayaan
            </h2>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight uppercase text-blue-950 print:text-black">
              SMP Negeri 1 Kota Pontianak
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-tight">
              {SCHOOL_INFO.alamat} · Kode Pos: {SCHOOL_INFO.kodePos}
            </p>
            <p className="text-[11px] text-slate-500">
              Telp: {SCHOOL_INFO.telepon} · Surel: {SCHOOL_INFO.email} · NPSN: {SCHOOL_INFO.npsn} · Terakreditasi: {SCHOOL_INFO.akreditasi}
            </p>
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div className="text-center my-6 space-y-1">
          <h2 className="text-base sm:text-lg font-bold uppercase underline tracking-wide text-slate-900">
            Laporan Rekapitulasi Prestasi & Hasil Perlombaan Siswa
          </h2>
        </div>

        {/* RINGKASAN DATA RESMI */}
        <div className="my-6 bg-slate-50 border border-slate-200 rounded-lg p-4 print:bg-transparent print:border-slate-300">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Ringkasan Capaian Prestasi Sekolah:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Total Kejuaraan:</span>
              <span className="font-bold text-slate-900 tabular-nums text-sm">{filteredData.length} Lomba</span>
            </div>
            <div>
              <span className="text-slate-500 block">Juara 1 (Emas):</span>
              <span className="font-bold text-slate-900 tabular-nums text-sm">{totalJuara1} Tropi</span>
            </div>
            <div>
              <span className="text-slate-500 block">Juara 2 & 3:</span>
              <span className="font-bold text-slate-900 tabular-nums text-sm">{totalJuara2 + totalJuara3} Tropi</span>
            </div>
          </div>
        </div>

        {/* TABEL HASIL RESMI */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                <th className="border border-slate-300 p-2 text-center w-8">No</th>
                <th className="border border-slate-300 p-2">Nama Siswa / Tim</th>
                <th className="border border-slate-300 p-2 text-center w-16">Kelas</th>
                <th className="border border-slate-300 p-2">Nama Lomba & Cabang</th>
                <th className="border border-slate-300 p-2">Tingkat</th>
                <th className="border border-slate-300 p-2">Capaian Juara</th>
                <th className="border border-slate-300 p-2">Penyelenggara</th>
                <th className="border border-slate-300 p-2 text-center w-24">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-slate-300 p-8 text-center text-slate-400 italic">
                    Belum ada data prestasi perlombaan siswa yang tercatat untuk periode ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 text-center font-mono tabular-nums">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-medium">
                      {item.namaSiswa}
                      <div className="text-[10px] text-slate-500 print:text-slate-700">NISN: {item.nisn}</div>
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-medium">{item.kelas}</td>
                    <td className="border border-slate-300 p-2">
                      <div className="font-medium">{item.namaLomba}</div>
                      <div className="text-[10px] text-slate-500 print:text-slate-700">
                        {item.bidang} · {item.jenisLomba || 'Individu'} / {item.cabangLomba}
                      </div>
                    </td>
                    <td className="border border-slate-300 p-2">{item.tingkat}</td>
                    <td className="border border-slate-300 p-2 font-bold text-slate-900">{item.capaian}</td>
                    <td className="border border-slate-300 p-2 text-[11px]">{item.penyelenggara}</td>
                    <td className="border border-slate-300 p-2 text-center tabular-nums text-[11px] whitespace-nowrap">
                      {item.tanggal}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* KOLOM TANDA TANGAN RESMI */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-xs text-center break-inside-avoid">
          <div>
            <p className="text-slate-600 mb-1">Mengetahui,</p>
            <p className="font-bold uppercase text-slate-900 tracking-wide">Kepala SMP Negeri 1 Pontianak</p>
            <div className="h-20"></div>
            <p className="font-bold uppercase text-slate-900 underline tracking-wide text-xs sm:text-sm">
              {SCHOOL_INFO.kepalaSekolah}
            </p>
            <p className="text-slate-800 text-xs mt-0.5 font-medium">
              NIP. {SCHOOL_INFO.nipKepalaSekolah}
            </p>
          </div>

          <div>
            <p className="text-slate-600 mb-1">
              Pontianak, {formatTanggalIndonesia(new Date().toISOString().split('T')[0])}
            </p>
            <p className="font-bold uppercase text-slate-900 tracking-wide">Wakil Kepala Sekolah Bidang Kesiswaan</p>
            <div className="h-20"></div>
            <p className="font-bold uppercase text-slate-900 underline tracking-wide text-xs sm:text-sm">
              {SCHOOL_INFO.wakakesiswaan}
            </p>
            <p className="text-slate-800 text-xs mt-0.5 font-medium">
              NIP. {SCHOOL_INFO.nipWakakesiswaan}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
