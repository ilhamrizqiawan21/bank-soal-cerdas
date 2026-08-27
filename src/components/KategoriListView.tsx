import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  HelpCircle,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Save,
  BookOpen,
  FileCheck2,
  Tag as TagIcon,
  Filter,
  Check
} from 'lucide-react';
import { Kategori, KategoriType } from '../types';
import { useFocusTrap } from '../lib/useFocusTrap';

export const KategoriListView: React.FC = () => {
  const {
    categories,
    questions,
    paketSoalList,
    addCategory,
    updateCategory,
    deleteCategory,
    setCurrentView,
    addToast
  } = useApp();
  const categoryDialogRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Kategori | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<KategoriType>('sumatif');
  const [color, setColor] = useState<string>('blue');
  const [description, setDescription] = useState('');

  useFocusTrap(categoryDialogRef, isModalOpen, () => setIsModalOpen(false));

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    if (selectedTypeFilter !== 'all' && cat.type !== selectedTypeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = cat.name.toLowerCase().includes(q);
      const matchDesc = cat.description?.toLowerCase().includes(q) || false;
      const matchSlug = cat.slug?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDesc && !matchSlug) return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setType('sumatif');
    setColor('blue');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Kategori) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug || '');
    setType(cat.type || 'sumatif');
    setColor(cat.color || 'blue');
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generate slug from name
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Nama kategori asesmen wajib diisi!', 'warning');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name,
          slug: slug.trim() || undefined,
          type,
          color,
          description: description.trim() || undefined,
        });
      } else {
        await addCategory({
          name,
          slug: slug.trim() || undefined,
          type,
          color,
          description: description.trim() || undefined,
        });
      }

      setIsModalOpen(false);
    } catch {
      // Toast is handled by the data layer.
    }
  };

  const handleDelete = (cat: Kategori) => {
    const questionCount = questions.filter(q => q.kategori_ids?.includes(cat.id)).length;
    const paketCount = paketSoalList.filter(p => p.kategori_id === cat.id).length;

    if (questionCount > 0 || paketCount > 0) {
      if (!window.confirm(`Kategori "${cat.name}" terhubung dengan ${questionCount} butir soal dan ${paketCount} paket soal. Tetap hapus kategori ini?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Hapus kategori "${cat.name}"?`)) {
        return;
      }
    }

    deleteCategory(cat.id);
  };

  // Color mapper helper
  const getColorClasses = (colorName?: string) => {
    switch (colorName) {
      case 'emerald':
        return {
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          border: 'hover:border-emerald-400 dark:hover:border-emerald-700'
        };
      case 'indigo':
        return {
          badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          dot: 'bg-indigo-500',
          border: 'hover:border-indigo-400 dark:hover:border-indigo-700'
        };
      case 'purple':
        return {
          badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          dot: 'bg-purple-500',
          border: 'hover:border-purple-400 dark:hover:border-purple-700'
        };
      case 'amber':
        return {
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
          border: 'hover:border-amber-400 dark:hover:border-amber-700'
        };
      case 'rose':
        return {
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
          border: 'hover:border-rose-400 dark:hover:border-rose-700'
        };
      case 'teal':
        return {
          badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          dot: 'bg-teal-500',
          border: 'hover:border-teal-400 dark:hover:border-teal-700'
        };
      case 'blue':
      default:
        return {
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
          border: 'hover:border-blue-400 dark:hover:border-blue-700'
        };
    }
  };

  const getTypeLabel = (t?: KategoriType) => {
    switch (t) {
      case 'formatif':
        return 'Formatif / Latihan';
      case 'sumatif':
        return 'Sumatif / Ujian';
      case 'diagnostik':
        return 'Diagnostik';
      case 'try_out':
        return 'Try Out / AKM';
      case 'osn':
        return 'Olimpiade / HOTS';
      default:
        return 'Umum';
    }
  };

  // Quick stats
  const totalCategories = categories.length;
  const sumatifCount = categories.filter(c => c.type === 'sumatif').length;
  const formatifCount = categories.filter(c => c.type === 'formatif').length;
  const diagnostikCount = categories.filter(c => c.type === 'diagnostik').length;
  const tryOutCount = categories.filter(c => c.type === 'try_out' || c.type === 'osn').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            Kategori Asesmen & Evaluasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Klasifikasikan bank butir soal dan paket evaluasi (Sumatif SAS/STS, Formatif UH, Diagnostik, AKM & OSN)
          </p>
        </div>

        <button
          id="btn-add-kategori-modal"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori Asesmen
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none block">
              {totalCategories}
            </span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Total Kategori</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none block">
              {sumatifCount}
            </span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Asesmen Sumatif</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none block">
              {formatifCount}
            </span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Formatif / UH</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none block">
              {diagnostikCount + tryOutCount}
            </span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Diagnostik & AKM</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="kategori-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kategori asesmen (contoh: Sumatif, Formatif, AKM, Olimpiade)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'Semua Tipe' },
            { key: 'sumatif', label: 'Sumatif' },
            { key: 'formatif', label: 'Formatif' },
            { key: 'diagnostik', label: 'Diagnostik' },
            { key: 'try_out', label: 'Try Out / AKM' },
            { key: 'osn', label: 'Olimpiade' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedTypeFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTypeFilter === item.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <FolderTree className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Kategori Asesmen yang Cocok
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Silakan tambahkan kategori baru atau bersihkan kata kunci pencarian.
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const questionCount = questions.filter(q => q.kategori_ids?.includes(cat.id)).length;
            const paketCount = paketSoalList.filter(p => p.kategori_id === cat.id).length;
            const colorCls = getColorClasses(cat.color);

            return (
              <div
                key={cat.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 transition-all ${colorCls.border}`}
              >
                <div className="space-y-3">
                  {/* Category Type Badge & Action Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${colorCls.badge}`}>
                      <span className={`w-2 h-2 rounded-full ${colorCls.dot}`} />
                      {getTypeLabel(cat.type)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-edit-kategori-${cat.id}`}
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Kategori"
                        aria-label={`Edit kategori ${cat.name}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-delete-kategori-${cat.id}`}
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        title="Hapus Kategori"
                        aria-label={`Hapus kategori ${cat.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {cat.name}
                    </h3>
                    {cat.slug && (
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        slug: #{cat.slug}
                      </span>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                      {cat.description || 'Tidak ada deskripsi rinci untuk kategori asesmen ini.'}
                    </p>
                  </div>

                  {/* Connected Statistics */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Butir Soal</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{questionCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Paket Soal</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{paketCount}</span>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setCurrentView('questions');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Lihat Bank Soal
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('paket-soal');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Layers className="w-3.5 h-3.5" /> Lihat Paket
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div
          id="modal-kategori-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="presentation"
        >
          <div
            ref={categoryDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-kategori-title"
            tabIndex={-1}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 outline-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
                <h3 id="modal-kategori-title" className="text-base font-bold text-slate-900 dark:text-white">
                  {editingCategory ? 'Edit Kategori Asesmen' : 'Tambah Kategori Asesmen Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Tutup modal kategori asesmen"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kategori Asesmen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Asesmen Sumatif Akhir Tahun (SAT)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Slug Identifikasi (Kode Unik)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="sat-2026"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Klasifikasi Asesmen <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as KategoriType)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="sumatif">Sumatif (SAS / STS / SAT / Ujian Akhir)</option>
                    <option value="formatif">Formatif (Ulangan Harian / Latihan)</option>
                    <option value="diagnostik">Diagnostik (Pemetaan Awal Belajar)</option>
                    <option value="try_out">Simulasi AKM / ANBK / Try Out</option>
                    <option value="osn">Olimpiade Sains (OSN) & Pengayaan</option>
                    <option value="lainnya">Lainnya / Khusus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Warna Identitas Kategori
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { key: 'blue', label: 'Biru', bg: 'bg-blue-500' },
                    { key: 'emerald', label: 'Hijau', bg: 'bg-emerald-500' },
                    { key: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
                    { key: 'purple', label: 'Ungu', bg: 'bg-purple-500' },
                    { key: 'amber', label: 'Kuning', bg: 'bg-amber-500' },
                    { key: 'rose', label: 'Merah', bg: 'bg-rose-500' },
                    { key: 'teal', label: 'Toska', bg: 'bg-teal-500' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setColor(c.key)}
                      className={`w-7 h-7 rounded-xl ${c.bg} flex items-center justify-center transition-all ${
                        color === c.key ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Pilih warna kategori ${c.label}`}
                      title={c.label}
                    >
                      {color === c.key && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Tujuan Asesmen
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan peruntukan kategori asesmen ini (misal: digunakan untuk penilaian capaian pembelajaran akhir semester kurikulum merdeka)..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  id="btn-save-kategori"
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                  aria-label={editingCategory ? 'Simpan perubahan kategori' : 'Simpan kategori baru'}
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Simpan Perubahan' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
