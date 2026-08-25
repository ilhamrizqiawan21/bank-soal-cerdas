import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Tag as TagIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  BrainCircuit,
  BookOpen,
  Sparkles,
  Layers,
  HelpCircle,
  FolderTree,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Gauge,
  Compass,
  FileQuestion,
  Filter
} from 'lucide-react';
import { Tag, CharacteristicType } from '../types';

export const TagListView: React.FC = () => {
  const {
    tags,
    addTag,
    updateTag,
    deleteTag,
    resetTagsToDefault,
    questions,
    currentUser,
    setCurrentView,
    setSelectedTagFilter,
    addToast
  } = useApp();

  const isTeacherOrAdmin = currentUser.role === 'admin' || currentUser.role === 'guru';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'category'>('category');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<CharacteristicType>('kognitif');
  const [color, setColor] = useState('indigo');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState('');

  // Delete Confirmation Modal
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  // Color options
  const colorOptions = [
    { label: 'Rose / Merah', value: 'rose', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800' },
    { label: 'Blue / Biru', value: 'blue', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
    { label: 'Indigo / Nila', value: 'indigo', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' },
    { label: 'Emerald / Hijau', value: 'emerald', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
    { label: 'Amber / Kuning', value: 'amber', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
    { label: 'Purple / Ungu', value: 'purple', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800' },
    { label: 'Teal / Hijau Laut', value: 'teal', bg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800' },
    { label: 'Cyan / Biru Langit', value: 'cyan', bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800' },
    { label: 'Slate / Netral', value: 'slate', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700' },
  ];

  const categoryMeta: Record<CharacteristicType, { label: string; icon: any; color: string; desc: string }> = {
    kognitif: {
      label: 'Dimensi Kognitif & HOTS',
      icon: BrainCircuit,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
      desc: 'Tingkat penalaran, kemampuan analitis, evaluatif, dan kreasi berpikir'
    },
    literasi_numerasi: {
      label: 'Literasi & Numerasi (AKM/PISA)',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
      desc: 'Kecakapan interpretasi teks, penalaran data kuantitatif, dan informasi grafik'
    },
    profil_pancasila: {
      label: 'Profil Pelajar Pancasila',
      icon: Compass,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
      desc: 'Internalisasi karakter bernalar kritis, kreatif, mandiri, dan gotong royong'
    },
    kesulitan: {
      label: 'Tingkat Kesulitan Soal',
      icon: Gauge,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      desc: 'Gradasi daya pembeda dan kompleksitas butir soal (Dasar, Sedang, Tinggi)'
    },
    stimulus: {
      label: 'Karakteristik Stimulus & Konteks',
      icon: Sparkles,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800',
      desc: 'Latar situasi nyata, infografis, tabel saintifik, dan studi kasus autentik'
    },
    umum: {
      label: 'Karakteristik Khusus / Umum',
      icon: TagIcon,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
      desc: 'Klasifikasi tematik dan label kustom pendukung asesmen'
    }
  };

  const getTagBadgeStyle = (tagColor?: string) => {
    switch (tagColor) {
      case 'rose':
      case 'red':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'blue':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'emerald':
      case 'green':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'amber':
      case 'yellow':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'purple':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'teal':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'indigo':
      default:
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  // Question count per tag
  const getQuestionCountForTag = (tagId: string) => {
    return questions.filter((q) => q.tag_ids && q.tag_ids.includes(tagId)).length;
  };

  // Filtered and Sorted tags
  const filteredTags = useMemo(() => {
    return tags
      .filter((t) => {
        const matchesSearch =
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.criteria?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategoryFilter === 'all' || (t.category || 'umum') === selectedCategoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'count') {
          return getQuestionCountForTag(b.id) - getQuestionCountForTag(a.id);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        // default by category
        const catA = a.category || 'umum';
        const catB = b.category || 'umum';
        if (catA !== catB) return catA.localeCompare(catB);
        return a.name.localeCompare(b.name);
      });
  }, [tags, searchQuery, selectedCategoryFilter, sortBy, questions]);

  const handleOpenAdd = () => {
    setEditingTag(null);
    setName('');
    setSlug('');
    setCategory('kognitif');
    setColor('indigo');
    setDescription('');
    setCriteria('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug || '');
    setCategory(tag.category || 'umum');
    setColor(tag.color || 'indigo');
    setDescription(tag.description || '');
    setCriteria(tag.criteria || '');
    setIsModalOpen(true);
  };

  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Nama tag / karakteristik wajib diisi.', 'warning');
      return;
    }

    const generatedSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, '-')
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingTag) {
      updateTag(editingTag.id, {
        name: name.trim(),
        slug: generatedSlug,
        category,
        color,
        description: description.trim() || undefined,
        criteria: criteria.trim() || undefined
      });
    } else {
      addTag({
        name: name.trim(),
        slug: generatedSlug,
        category,
        color,
        description: description.trim() || undefined,
        criteria: criteria.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingTag) return;
    deleteTag(deletingTag.id);
    setDeletingTag(null);
  };

  const handleNavigateToQuestionsWithTag = (tagId: string) => {
    setSelectedTagFilter(tagId);
    setCurrentView('questions');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TagIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Tag & Karakteristik Butir Soal
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Kelola taksonomi karakteristik pedagogis soal seperti HOTS, dimensi Literasi-Numerasi, Profil Pelajar Pancasila, tingkat kesulitan, serta kriteria stimulus asesmen.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-reset-tags-template"
              type="button"
              onClick={resetTagsToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
              title="Muat Ulang Template Karakteristik Standar Kemdikbudristek"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Template Standar
            </button>

            <button
              id="btn-add-tag"
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Karakteristik
            </button>
          </div>
        )}
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(['kognitif', 'literasi_numerasi', 'profil_pancasila', 'kesulitan', 'stimulus', 'umum'] as CharacteristicType[]).map((catKey) => {
          const meta = categoryMeta[catKey];
          const Icon = meta.icon;
          const count = tags.filter(t => (t.category || 'umum') === catKey).length;
          const isSelected = selectedCategoryFilter === catKey;

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategoryFilter(prev => prev === catKey ? 'all' : catKey)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg border ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100">{count}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {meta.label.split('(')[0].trim()}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Karakteristik</p>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-tag"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karakteristik atau kriteria..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Semua ({tags.length})
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            id="select-sort-tag"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="category">Kelompokkan Dimensi</option>
            <option value="count">Soal Terbanyak</option>
            <option value="name">Nama (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Tag Grid Cards */}
      {filteredTags.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <TagIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak ada karakteristik ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada tag atau karakteristik yang cocok dengan kata kunci "${searchQuery}".`
              : 'Belum ada karakteristik yang terdaftar di kategori ini.'}
          </p>
          {isTeacherOrAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Karakteristik Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => {
            const cat = tag.category || 'umum';
            const meta = categoryMeta[cat] || categoryMeta.umum;
            const CatIcon = meta.icon;
            const questionCount = getQuestionCountForTag(tag.id);

            return (
              <div
                key={tag.id}
                id={`card-tag-${tag.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Top metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${getTagBadgeStyle(tag.color)}`}>
                      <TagIcon className="w-3 h-3" />
                      {tag.name}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      <CatIcon className="w-3 h-3 text-indigo-500" />
                      {meta.label.split('(')[0].trim()}
                    </span>
                  </div>

                  {/* Description */}
                  {tag.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {tag.description}
                    </p>
                  )}

                  {/* Criteria / Guidelines */}
                  {tag.criteria && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        <Check className="w-3 h-3 text-emerald-500" /> Kriteria Penilaian
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 italic line-clamp-2">
                        "{tag.criteria}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom stats and action buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavigateToQuestionsWithTag(tag.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    title="Lihat butir soal dengan karakteristik ini"
                  >
                    <FileQuestion className="w-3.5 h-3.5" />
                    <span>{questionCount} Soal Terkait</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {isTeacherOrAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-edit-tag-${tag.id}`}
                        type="button"
                        onClick={() => handleOpenEdit(tag)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        title="Edit Karakteristik"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`btn-delete-tag-${tag.id}`}
                        type="button"
                        onClick={() => setDeletingTag(tag)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Hapus Karakteristik"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Tag & Karakteristik */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <TagIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {editingTag ? 'Edit Tag & Karakteristik' : 'Tambah Tag & Karakteristik Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Definisikan kriteria pedagogis untuk melabeli butir asesmen.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveTag} className="p-6 overflow-y-auto space-y-4">
              {/* Nama Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Tag / Karakteristik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Literasi Sains, HOTS C4, Bernalar Kritis..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              {/* Dimensi / Kelompok Karakteristik */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dimensi / Kategori Karakteristik
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CharacteristicType)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="kognitif">Dimensi Kognitif & HOTS (C4-C6 / Penalaran Tinggi)</option>
                  <option value="literasi_numerasi">Dimensi Literasi & Numerasi (Standar AKM / PISA)</option>
                  <option value="profil_pancasila">Dimensi Profil Pelajar Pancasila</option>
                  <option value="kesulitan">Tingkat Kesulitan (Dasar / Sedang / Tinggi)</option>
                  <option value="stimulus">Karakteristik Stimulus & Konteks Autentik</option>
                  <option value="umum">Umum / Tag Bebas</option>
                </select>
              </div>

              {/* Pilihan Warna Badge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Warna Tampilan Badge
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map((opt) => {
                    const isSelected = color === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setColor(opt.value)}
                        className={`p-2 rounded-xl text-xs font-bold border text-center transition-all flex items-center justify-between ${
                          opt.bg
                        } ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <span className="truncate">{opt.label.split('/')[0]}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Makna Pedagogis
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan tujuan atau kompetensi yang ingin diukur oleh karakteristik ini..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Kriteria Penulisan Butir Soal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kriteria / Panduan Guru (Kapan Butir Soal Layak Diberi Tag Ini)
                </label>
                <textarea
                  rows={2}
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  placeholder="Misal: Memerlukan stimulus grafik data, bukan sekadar ingatan definisi..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pratinjau Badge Tag
                </span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border ${getTagBadgeStyle(color)}`}>
                    <TagIcon className="w-3.5 h-3.5" />
                    {name || 'Nama Karakteristik'}
                  </span>
                  <span className="text-xs text-slate-400">
                    akan muncul di kartu butir soal dan formulir editor
                  </span>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
                >
                  {editingTag ? 'Simpan Perubahan' : 'Buat Karakteristik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Hapus Karakteristik?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apakah Anda yakin ingin menghapus tag <strong>"{deletingTag.name}"</strong>? Tag ini akan dicabut dari butir soal terkait.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTag(null)}
                className="w-1/2 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
