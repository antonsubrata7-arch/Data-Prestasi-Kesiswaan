import React from 'react';
import { PrestasiSiswa } from '../types/prestasi';
import { SCHOOL_INFO } from '../data/initialData';
import { formatTanggalIndonesia } from '../utils/helpers';
import { X, Award, Printer, CheckCircle, Trophy, User, BookOpen, Calendar, ShieldCheck } from 'lucide-react';

interface DetailPrestasiModalProps {
  item: PrestasiSiswa | null;
  onClose: () => void;
}

export const DetailPrestasiModal: React.FC<DetailPrestasiModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Rincian Prestasi & Surat Keterangan Siswa
              </h3>
              <p className="text-[11px] text-slate-300">
                SMP Negeri 1 Kota Pontianak · Bidang Kesiswaan
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Styled as a Certificate & School Record Card) */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Certificate Header Emblem */}
          <div className="border-4 border-double border-amber-500/60 bg-amber-50/30 rounded-xl p-6 relative">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-full bg-white border border-amber-300 flex items-center justify-center shadow-xs mb-2">
                <Award className="w-7 h-7 text-amber-600" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Pencatatan Resmi Hasil Perlombaan Kesiswaan
              </p>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {item.namaSiswa}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Kelas {item.kelas} · NISN: {item.nisn}
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-full shadow-xs">
                  {item.capaian} · {item.tingkat}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-200/80 text-xs space-y-2 text-slate-800">
              <div className="flex justify-between py-1 border-b border-amber-100">
                <span className="text-slate-500">Nama Perlombaan:</span>
                <span className="font-semibold text-right max-w-xs">{item.namaLomba}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-100">
                <span className="text-slate-500">Bidang & Cabang:</span>
                <span className="font-medium">{item.bidang} / {item.cabangLomba}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-100">
                <span className="text-slate-500">Jenis Lomba:</span>
                <span className="font-semibold text-slate-800">{item.jenisLomba || 'Individu (Perorangan)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-100">
                <span className="text-slate-500">Penyelenggara:</span>
                <span className="font-medium text-right max-w-xs">{item.penyelenggara}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-100">
                <span className="text-slate-500">Tanggal Pelaksanaan:</span>
                <span className="font-medium tabular-nums">{formatTanggalIndonesia(item.tanggal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-100">
                <span className="text-slate-500">Guru Pembimbing:</span>
                <span className="font-medium">{item.guruPembimbing}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-100">
                <span className="text-slate-500">No. Sertifikat / SK:</span>
                <span className="font-mono text-slate-700">{item.nomorSertifikat || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status Validasi:</span>
                <span className="font-semibold text-emerald-700">Tervalidasi Resmi</span>
              </div>
            </div>

            {item.catatan && (
              <div className="mt-4 bg-white/80 border border-amber-200 p-3 rounded-lg text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Catatan Pembina / Dewan Juri:</span>
                "{item.catatan}"
              </div>
            )}
          </div>

          {/* Foto Dokumentasi */}
          {item.fotoDokumentasi && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Dokumentasi Penyerahan / Piagam
              </h4>
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-60 flex items-center justify-center">
                <img 
                  src={item.fotoDokumentasi} 
                  alt="Dokumentasi Lomba" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* Status Validasi */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Terverifikasi Resmi oleh Wakakesiswaan SMPN 1 Pontianak.</span>
              <p className="text-[11px] text-emerald-800">
                Data sah tercatat dalam Buku Induk Prestasi Siswa Spensa Pontianak.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ID Sistem: {item.id}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Keterangan</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
