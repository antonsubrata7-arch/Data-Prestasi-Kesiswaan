import React, { useState, useEffect } from 'react';
import { 
  PrestasiSiswa, 
  BidangLomba, 
  JenisLomba,
  TingkatPerlombaan, 
  CapaianPrestasi 
} from '../types/prestasi';
import { hitungPoinPrestasi } from '../utils/helpers';
import { 
  X, 
  Check, 
  Upload, 
  Award, 
  AlertCircle, 
  Sparkles, 
  Users2, 
  Plus, 
  Copy, 
  Trash2, 
  RotateCcw 
} from 'lucide-react';

interface InputDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prestasi: PrestasiSiswa) => void;
  editItem?: PrestasiSiswa | null;
}

export interface QuickPreset {
  id: string;
  title: string;
  bidang: BidangLomba;
  jenisLomba: JenisLomba;
  cabang: string;
  tingkat: TingkatPerlombaan;
  namaLomba: string;
  penyelenggara: string;
  isCustom?: boolean;
}

const JENIS_LOMBA_OPTIONS: JenisLomba[] = [
  'Individu (Perorangan)',
  'Beregu (Tim / Kelompok)',
  'Ganda (Pasangan)'
];

const BIDANG_OPTIONS: BidangLomba[] = [
  'Akademik',
  'Olahraga',
  'Seni & Budaya',
  'Teknologi & Riset',
  'Keagamaan',
  'Lainnya'
];

const TINGKAT_OPTIONS: TingkatPerlombaan[] = [
  'Kecamatan',
  'Kota Pontianak',
  'Kota Singkawang',
  'Kabupaten',
  'Provinsi Kalimantan Barat',
  'Nasional',
  'Internasional'
];

const CAPAIAN_OPTIONS: CapaianPrestasi[] = [
  'Juara 1 (Emas)',
  'Juara 2 (Perak)',
  'Juara 3 (Perunggu)',
  'Harapan 1',
  'Harapan 2',
  'Harapan 3',
  'Finalis / Apresiasi'
];

const KELAS_OPTIONS = [
  'VII A', 'VII B', 'VII C', 'VII D', 'VII E', 'VII Unggulan A', 'VII Unggulan B',
  'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E', 'VIII Unggulan',
  'IX A', 'IX B', 'IX C', 'IX D', 'IX E', 'IX Unggulan A', 'IX Unggulan B'
];

const TAHUN_AJARAN_OPTIONS = [
  '2026/2027',
  '2025/2026',
  '2024/2025'
];

// Presets for quick autofill
const DEFAULT_PRESETS: QuickPreset[] = [
  {
    id: 'tpl-osn-ipa',
    title: 'OSN IPA Terpadu',
    namaLomba: 'Olimpiade Sains Nasional (OSN) Jenjang SMP Tingkat Kota Pontianak',
    bidang: 'Akademik',
    jenisLomba: 'Individu (Perorangan)',
    cabang: 'IPA Terpadu (Fisika & Biologi)',
    tingkat: 'Kota Pontianak',
    penyelenggara: 'Balai Pengembangan Talenta Indonesia & Disdikbud Pontianak'
  },
  {
    id: 'tpl-osn-matematika',
    title: 'OSN Matematika',
    namaLomba: 'Olimpiade Sains Nasional (OSN) Jenjang SMP Tingkat Kota Pontianak',
    bidang: 'Akademik',
    jenisLomba: 'Individu (Perorangan)',
    cabang: 'Matematika Terapan & Teori Bilangan',
    tingkat: 'Kota Pontianak',
    penyelenggara: 'Balai Pengembangan Talenta Indonesia & Disdikbud Pontianak'
  },
  {
    id: 'tpl-o2sn-renang',
    title: 'O2SN Cabang Renang',
    namaLomba: 'Olimpiade Olahraga Siswa Nasional (O2SN) SMP',
    bidang: 'Olahraga',
    jenisLomba: 'Individu (Perorangan)',
    cabang: 'Renang 100M Gaya Bebas / Dada',
    tingkat: 'Kota Pontianak',
    penyelenggara: 'Disporapar & Dinas Pendidikan dan Kebudayaan Kota Pontianak'
  },
  {
    id: 'tpl-fls2n-tari',
    title: 'FLS2N Tari Tradisional',
    namaLomba: 'Festival dan Lomba Seni Siswa Nasional (FLS2N) SMP',
    bidang: 'Seni & Budaya',
    jenisLomba: 'Beregu (Tim / Kelompok)',
    cabang: 'Kreativitas Tari Tradisional Nusantara',
    tingkat: 'Provinsi Kalimantan Barat',
    penyelenggara: 'Dinas Pendidikan dan Kebudayaan Provinsi Kalimantan Barat'
  },
  {
    id: 'tpl-lomba-singkawang',
    title: 'Kejuaraan Kota Singkawang',
    namaLomba: 'Kejuaraan Seni & Bela Diri Pelajar Antar-Kota/Kabupaten Singkawang Open',
    bidang: 'Olahraga',
    jenisLomba: 'Individu (Perorangan)',
    cabang: 'Wushu / Taekwondo / Pencak Silat',
    tingkat: 'Kota Singkawang',
    penyelenggara: 'Pengkot Cabor & Disparpora Kota Singkawang'
  },
  {
    id: 'tpl-lomba-kabupaten',
    title: 'Piala Bupati (Kabupaten)',
    namaLomba: 'Turnamen Olahraga & Futsal Pelajar Tingkat Kabupaten',
    bidang: 'Olahraga',
    jenisLomba: 'Beregu (Tim / Kelompok)',
    cabang: 'Futsal Pelajar SMP',
    tingkat: 'Kabupaten',
    penyelenggara: 'Disporapar & Asosiasi Cabor Kabupaten'
  },
  {
    id: 'tpl-mtq-tilawah',
    title: 'MTQ Pelajar Remaja',
    namaLomba: 'Musabaqah Tilawatil Qur’an (MTQ) Antar Pelajar Kota Pontianak',
    bidang: 'Keagamaan',
    jenisLomba: 'Individu (Perorangan)',
    cabang: 'Tartil & Tilawah Al-Qur’an SMP',
    tingkat: 'Kota Pontianak',
    penyelenggara: 'LPTQ & Kemenag Kota Pontianak'
  },
  {
    id: 'tpl-iyro-robotik',
    title: 'Olimpiade Robotik (Nasional)',
    namaLomba: 'Indonesia Youth Robot Olympiad (IYRO) Tingkat Nasional',
    bidang: 'Teknologi & Riset',
    jenisLomba: 'Beregu (Tim / Kelompok)',
    cabang: 'Line Tracer & IoT Automation SMP',
    tingkat: 'Nasional',
    penyelenggara: 'Asosiasi Robotika Remaja Indonesia'
  }
];

export const InputDataModal: React.FC<InputDataModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem
}) => {
  const [formData, setFormData] = useState<Partial<PrestasiSiswa>>({
    namaSiswa: '',
    nisn: '',
    kelas: '',
    namaLomba: '',
    bidang: 'Akademik',
    jenisLomba: 'Individu (Perorangan)',
    cabangLomba: '',
    tingkat: 'Kota Pontianak',
    capaian: 'Juara 1 (Emas)',
    penyelenggara: 'Dinas Pendidikan dan Kebudayaan Kota Pontianak',
    tanggal: new Date().toISOString().split('T')[0],
    tahunAjaran: '',
    guruPembimbing: '',
    nomorSertifikat: '',
    poinPrestasi: 20,
    catatan: '',
    fotoDokumentasi: '/src/assets/images/student_award_ceremony_1790818002727.jpg',
    terverifikasi: true
  });

  const [previewImage, setPreviewImage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic quick presets state with localStorage persistence
  const [presetList, setPresetList] = useState<QuickPreset[]>(() => {
    try {
      const saved = localStorage.getItem('smpn1_quick_presets_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved presets', e);
    }
    return DEFAULT_PRESETS;
  });

  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [activePresetTitle, setActivePresetTitle] = useState<string | null>(null);
  const [newPreset, setNewPreset] = useState<Partial<QuickPreset>>({
    title: '',
    namaLomba: '',
    bidang: 'Akademik',
    jenisLomba: 'Individu (Perorangan)',
    cabang: '',
    tingkat: 'Kota Pontianak',
    penyelenggara: 'Dinas Pendidikan dan Kebudayaan Kota Pontianak'
  });
  const [presetFormError, setPresetFormError] = useState('');

  // Sync edit item when opened
  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
      setPreviewImage(editItem.fotoDokumentasi || '');
    } else {
      const defaultTingkat: TingkatPerlombaan = 'Kota Pontianak';
      const defaultCapaian: CapaianPrestasi = 'Juara 1 (Emas)';
      setFormData({
        namaSiswa: '',
        nisn: '',
        kelas: '',
        namaLomba: '',
        bidang: 'Akademik',
        jenisLomba: 'Individu (Perorangan)',
        cabangLomba: '',
        tingkat: defaultTingkat,
        capaian: defaultCapaian,
        penyelenggara: 'Dinas Pendidikan dan Kebudayaan Kota Pontianak',
        tanggal: new Date().toISOString().split('T')[0],
        tahunAjaran: '',
        guruPembimbing: '',
        nomorSertifikat: '',
        poinPrestasi: hitungPoinPrestasi(defaultTingkat, defaultCapaian),
        catatan: '',
        fotoDokumentasi: '/src/assets/images/student_award_ceremony_1790818002727.jpg',
        terverifikasi: true
      });
      setPreviewImage('/src/assets/images/student_award_ceremony_1790818002727.jpg');
    }
    setErrors({});
    setIsAddingPreset(false);
    setActivePresetTitle(null);
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleTingkatChange = (newTingkat: TingkatPerlombaan) => {
    const currentCapaian = (formData.capaian as CapaianPrestasi) || 'Juara 1 (Emas)';
    const newPoints = hitungPoinPrestasi(newTingkat, currentCapaian);
    setFormData(prev => ({
      ...prev,
      tingkat: newTingkat,
      poinPrestasi: newPoints
    }));
  };

  const handleCapaianChange = (newCapaian: CapaianPrestasi) => {
    const currentTingkat = (formData.tingkat as TingkatPerlombaan) || 'Kota Pontianak';
    const newPoints = hitungPoinPrestasi(currentTingkat, newCapaian);
    setFormData(prev => ({
      ...prev,
      capaian: newCapaian,
      poinPrestasi: newPoints
    }));
  };

  const applyPreset = (preset: QuickPreset) => {
    setActivePresetTitle(preset.title);
    const pts = hitungPoinPrestasi(preset.tingkat, (formData.capaian as CapaianPrestasi) || 'Juara 1 (Emas)');
    setFormData(prev => ({
      ...prev,
      namaLomba: preset.namaLomba,
      bidang: preset.bidang,
      jenisLomba: preset.jenisLomba,
      cabangLomba: preset.cabang,
      tingkat: preset.tingkat,
      penyelenggara: preset.penyelenggara,
      poinPrestasi: pts
    }));
  };

  const handleSaveNewPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPreset.title?.trim()) {
      setPresetFormError('Judul singkat tombol templat wajib diisi');
      return;
    }
    if (!newPreset.namaLomba?.trim()) {
      setPresetFormError('Nama resmi lomba wajib diisi');
      return;
    }
    if (!newPreset.cabang?.trim()) {
      setPresetFormError('Cabang lomba wajib diisi');
      return;
    }

    const createdPreset: QuickPreset = {
      id: `custom-preset-${Date.now()}`,
      title: newPreset.title.trim(),
      namaLomba: newPreset.namaLomba.trim(),
      bidang: newPreset.bidang || 'Akademik',
      jenisLomba: newPreset.jenisLomba || 'Individu (Perorangan)',
      cabang: newPreset.cabang.trim(),
      tingkat: newPreset.tingkat || 'Kota Pontianak',
      penyelenggara: newPreset.penyelenggara?.trim() || 'Dinas Pendidikan dan Kebudayaan Kota Pontianak',
      isCustom: true
    };

    const updated = [...presetList, createdPreset];
    setPresetList(updated);
    try {
      localStorage.setItem('smpn1_quick_presets_v2', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // Auto-apply newly created preset
    applyPreset(createdPreset);

    // Reset adding state
    setIsAddingPreset(false);
    setNewPreset({
      title: '',
      namaLomba: '',
      bidang: 'Akademik',
      jenisLomba: 'Individu (Perorangan)',
      cabang: '',
      tingkat: 'Kota Pontianak',
      penyelenggara: 'Dinas Pendidikan dan Kebudayaan Kota Pontianak'
    });
    setPresetFormError('');
  };

  const handleCopyFromMainForm = () => {
    setNewPreset(prev => ({
      ...prev,
      title: formData.namaLomba ? (formData.namaLomba.length > 25 ? formData.namaLomba.slice(0, 22) + '...' : formData.namaLomba) : prev.title,
      namaLomba: formData.namaLomba || prev.namaLomba,
      bidang: formData.bidang || prev.bidang,
      jenisLomba: formData.jenisLomba || prev.jenisLomba,
      cabang: formData.cabangLomba || prev.cabang,
      tingkat: formData.tingkat || prev.tingkat,
      penyelenggara: formData.penyelenggara || prev.penyelenggara
    }));
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presetList.filter(p => p.id !== id);
    setPresetList(updated);
    try {
      localStorage.setItem('smpn1_quick_presets_v2', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPresetsToDefault = () => {
    setPresetList([]);
    try {
      localStorage.removeItem('smpn1_quick_presets_v2');
    } catch (err) {
      console.error(err);
    }
    setIsAddingPreset(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, fotoDokumentasi: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.namaSiswa?.trim()) newErrors.namaSiswa = 'Nama siswa wajib diisi';
    if (!formData.namaLomba?.trim()) newErrors.namaLomba = 'Nama perlombaan wajib diisi';
    if (!formData.cabangLomba?.trim()) newErrors.cabangLomba = 'Cabang lomba wajib diisi';
    if (!formData.penyelenggara?.trim()) newErrors.penyelenggara = 'Penyelenggara wajib diisi';
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal pelaksanaan wajib dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalItem: PrestasiSiswa = {
      id: editItem?.id || `SMPN1-PTK-${Date.now().toString().slice(-6)}`,
      namaSiswa: formData.namaSiswa!.trim(),
      nisn: formData.nisn?.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      kelas: formData.kelas?.trim() || '-',
      namaLomba: formData.namaLomba!.trim(),
      bidang: formData.bidang || 'Akademik',
      jenisLomba: formData.jenisLomba || 'Individu (Perorangan)',
      cabangLomba: formData.cabangLomba!.trim(),
      tingkat: formData.tingkat || 'Kota Pontianak',
      capaian: formData.capaian || 'Juara 1 (Emas)',
      penyelenggara: formData.penyelenggara!.trim(),
      tanggal: formData.tanggal || new Date().toISOString().split('T')[0],
      tahunAjaran: formData.tahunAjaran?.trim() || '-',
      guruPembimbing: formData.guruPembimbing?.trim() || 'Tim Pembina Kesiswaan SMPN 1 Pontianak',
      nomorSertifikat: formData.nomorSertifikat?.trim() || `421.3/${Math.floor(100 + Math.random() * 900)}/DISDIK-PTK/${new Date().getFullYear()}`,
      poinPrestasi: Number(formData.poinPrestasi) || hitungPoinPrestasi(formData.tingkat || 'Kota Pontianak', formData.capaian || 'Juara 1 (Emas)'),
      catatan: formData.catatan?.trim() || '',
      fotoDokumentasi: previewImage || '/src/assets/images/prestasi_trophy_banner_1790818014531.jpg',
      terverifikasi: true,
      createdAt: editItem?.createdAt || new Date().toISOString()
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {editItem ? 'Perbarui Data Hasil Perlombaan Siswa' : 'Formulir Input Hasil Perlombaan Siswa'}
              </h2>
              <p className="text-xs text-slate-300">
                Bidang Kesiswaan SMP Negeri 1 Kota Pontianak
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            aria-label="Tutup formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-800">
          
          {/* Quick presets for custom competitions */}
          {!editItem && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Templat Cepat Lomba:
                </span>
                <span className="text-[11px] text-slate-500">
                  {presetList.length > 0 
                    ? 'Klik tombol untuk mengisi otomatis formulir' 
                    : 'Gunakan tombol + jika ingin menyimpan templat lomba sendiri'}
                </span>
              </div>

              {/* Chips + Tombol '+' Tambah Templat Baru */}
              <div className="flex flex-wrap items-center gap-2">
                {presetList.map((preset) => {
                  const isActive = activePresetTitle === preset.title;
                  return (
                    <div key={preset.id} className="inline-flex items-center group">
                      <button
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`text-xs px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isActive
                            ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border-slate-300 hover:border-blue-400'
                        }`}
                        title={`Tingkat: ${preset.tingkat} · Bidang: ${preset.bidang} · Jenis: ${preset.jenisLomba}`}
                      >
                        <span className="text-amber-500 font-bold">+</span>
                        <span>{preset.title}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        className="ml-0.5 p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-200/60 transition-colors"
                        title="Hapus templat ini"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Kolom / Tombol '+' Tambah Templat Baru */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPreset(!isAddingPreset);
                    setPresetFormError('');
                  }}
                  className={`text-xs px-3 py-1 font-semibold rounded-md border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAddingPreset
                      ? 'bg-blue-800 text-white border-blue-800 shadow-xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300 hover:border-blue-400'
                  }`}
                  title="Buka kolom untuk menambahkan templat cepat lomba baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Templat Lomba</span>
                </button>
              </div>

              {/* Expandable Column / Form: Tambah Templat Baru */}
              {isAddingPreset && (
                <div className="mt-3 p-4 bg-white border border-blue-200 rounded-lg shadow-xs space-y-3 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-blue-700" />
                        Kolom Tambah Templat Cepat Lomba Populer
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Simpan perlombaan rutin agar kesiswaan dapat mengisi formulir otomatis dalam 1 klik.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyFromMainForm}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer border border-slate-200 self-start sm:self-auto"
                      title="Salin rincian yang sudah Anda ketik di formulir utama"
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Salin dari Formulir Utama</span>
                    </button>
                  </div>

                  {presetFormError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{presetFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Judul Singkat Tombol <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: O2SN Karate Kota"
                        value={newPreset.title || ''}
                        onChange={e => setNewPreset({ ...newPreset, title: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nama Resmi Perlombaan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: Olimpiade Olahraga Siswa Nasional (O2SN) SMP Cabor Karate"
                        value={newPreset.namaLomba || ''}
                        onChange={e => setNewPreset({ ...newPreset, namaLomba: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Bidang Lomba
                      </label>
                      <select
                        value={newPreset.bidang || 'Akademik'}
                        onChange={e => setNewPreset({ ...newPreset, bidang: e.target.value as BidangLomba })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 text-slate-900"
                      >
                        {BIDANG_OPTIONS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Jenis Lomba
                      </label>
                      <select
                        value={newPreset.jenisLomba || 'Individu (Perorangan)'}
                        onChange={e => setNewPreset({ ...newPreset, jenisLomba: e.target.value as JenisLomba })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 text-slate-900"
                      >
                        {JENIS_LOMBA_OPTIONS.map(j => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Cabang / Materi Lomba <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: Kata Perorangan Putra / Catur Cepat"
                        value={newPreset.cabang || ''}
                        onChange={e => setNewPreset({ ...newPreset, cabang: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tingkat Perlombaan
                      </label>
                      <select
                        value={newPreset.tingkat || 'Kota Pontianak'}
                        onChange={e => setNewPreset({ ...newPreset, tingkat: e.target.value as TingkatPerlombaan })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 text-slate-900"
                      >
                        {TINGKAT_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Lembaga Penyelenggara
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: Dinas Pendidikan dan Kebudayaan Kota Pontianak & BPTI"
                        value={newPreset.penyelenggara || ''}
                        onChange={e => setNewPreset({ ...newPreset, penyelenggara: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingPreset(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors border border-slate-200 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNewPreset}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan ke Templat Populer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Data Nama Siswa */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              1. Nama Siswa / Tim Spensa
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Siswa / Nama Tim Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Muhammad Fadhil / Tim Tari Spensa"
                  value={formData.namaSiswa || ''}
                  onChange={e => setFormData({ ...formData, namaSiswa: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900 ${
                    errors.namaSiswa ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.namaSiswa && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.namaSiswa}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Kelas Siswa
                  </label>
                  <span className="text-[10px] text-slate-400">
                    (Bisa dikosongkan / Catatan)
                  </span>
                </div>
                <input
                  type="text"
                  list="daftar-kelas-spensa"
                  placeholder="Pilih kelas atau kosongkan..."
                  value={formData.kelas || ''}
                  onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
                <datalist id="daftar-kelas-spensa">
                  {KELAS_OPTIONS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                  <option value="Lintas Kelas (Tim Spensa)">Lintas Kelas (Tim Spensa)</option>
                  <option value="Kelas Khusus / Ekstrakurikuler">Kelas Khusus / Ekstrakurikuler</option>
                </datalist>
                <p className="text-[10px] text-slate-400 mt-1">
                  Dapat dikosongkan jika tidak ada kelas atau diisi catatan rombel/tim.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  NISN (Nomor Induk Siswa Nasional)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Misal: 0098234121"
                  value={formData.nisn || ''}
                  onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  placeholder="Ketik tahun ajaran, misal: 2026/2027"
                  value={formData.tahunAjaran || ''}
                  onChange={e => setFormData({ ...formData, tahunAjaran: e.target.value })}
                  list="tahun-ajaran-suggestions"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
                <datalist id="tahun-ajaran-suggestions">
                  {TAHUN_AJARAN_OPTIONS.map(ta => (
                    <option key={ta} value={ta} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Guru Pembimbing / Pendamping
                </label>
                <input
                  type="text"
                  placeholder="Misal: Drs. Hendra Setiawan, M.Pd."
                  value={formData.guruPembimbing || ''}
                  onChange={e => setFormData({ ...formData, guruPembimbing: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Perlombaan & Capaian */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              2. Rincian Perlombaan & Hasil Kejuaraan
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Resmi Perlombaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Olimpiade Sains Nasional (OSN) Jenjang SMP Tingkat Kota Pontianak"
                  value={formData.namaLomba || ''}
                  onChange={e => setFormData({ ...formData, namaLomba: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900 ${
                    errors.namaLomba ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.namaLomba && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.namaLomba}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bidang Lomba
                </label>
                <select
                  value={formData.bidang || 'Akademik'}
                  onChange={e => setFormData({ ...formData, bidang: e.target.value as BidangLomba })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                >
                  {BIDANG_OPTIONS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                  <span>Jenis Lomba <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Individu / Beregu</span>
                </label>
                <select
                  value={formData.jenisLomba || 'Individu (Perorangan)'}
                  onChange={e => setFormData({ ...formData, jenisLomba: e.target.value as JenisLomba })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                >
                  {JENIS_LOMBA_OPTIONS.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cabang / Materi Lomba <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: IPA Terpadu / Renang 100m / Tari Tradisional"
                  value={formData.cabangLomba || ''}
                  onChange={e => setFormData({ ...formData, cabangLomba: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900 ${
                    errors.cabangLomba ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.cabangLomba && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.cabangLomba}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tingkat Perlombaan
                </label>
                <select
                  value={formData.tingkat || 'Kota Pontianak'}
                  onChange={e => handleTingkatChange(e.target.value as TingkatPerlombaan)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-semibold text-blue-900"
                >
                  {TINGKAT_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Capaian Hasil / Juara
                </label>
                <select
                  value={formData.capaian || 'Juara 1 (Emas)'}
                  onChange={e => handleCapaianChange(e.target.value as CapaianPrestasi)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-bold text-amber-800"
                >
                  {CAPAIAN_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lembaga Penyelenggara <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Disdikbud Kota Pontianak / Kemendikbudristek"
                  value={formData.penyelenggara || ''}
                  onChange={e => setFormData({ ...formData, penyelenggara: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900 ${
                    errors.penyelenggara ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.penyelenggara && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.penyelenggara}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tanggal Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal || ''}
                  onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Administrasi Piagam & Lampiran */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              3. Sertifikat & Lampiran Dokumentasi
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor Sertifikat / Surat Keputusan (SK)
                </label>
                <input
                  type="text"
                  placeholder="Misal: 421.3/0892/DISDIK-PTK/OSN/2026"
                  value={formData.nomorSertifikat || ''}
                  onChange={e => setFormData({ ...formData, nomorSertifikat: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono text-xs text-slate-900"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Catatan Kesiswaan (Keterangan Tambahan)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Memecahkan rekor waktu / Mewakili Kalbar ke tingkat Nasional"
                  value={formData.catatan || ''}
                  onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Foto Dokumentasi / Piagam Penghargaan
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Preview Piagam" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer transition-colors border border-slate-200">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Unggah Foto dari Komputer</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-xs text-slate-500">
                      Format: JPG, PNG, atau WEBP. Foto penyerahan piala di panggung atau scan piagam sertifikat juara.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-500">Atau pilih contoh galeri Spensa:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const path = '/src/assets/images/student_award_ceremony_1790818002727.jpg';
                          setPreviewImage(path);
                          setFormData(prev => ({ ...prev, fotoDokumentasi: path }));
                        }}
                        className="text-[11px] text-blue-700 hover:underline"
                      >
                        Foto Panggung Upacara
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          const path = '/src/assets/images/prestasi_trophy_banner_1790818014531.jpg';
                          setPreviewImage(path);
                          setFormData(prev => ({ ...prev, fotoDokumentasi: path }));
                        }}
                        className="text-[11px] text-blue-700 hover:underline"
                      >
                        Piala & Medali
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              * Data akan langsung tersimpan dan ditampilkan pada sub halaman rekapitulasi.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 active:bg-blue-950 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editItem ? 'Simpan Perubahan' : 'Simpan ke Sub Halaman Hasil'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
