import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  Share2,
  BrainCircuit,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Tag as TagIcon,
  X
} from 'lucide-react';
import { BloomLevel, Curriculum, Jenjang, LevelKognitif, Question, QuestionType } from '../types';
import { writeSpreadsheet } from '../lib/spreadsheet';
import { apiErrorMessage, isBootstrapped } from '../lib/api';
import { PaginationMeta, questionsApi } from '../lib/api/questions';
import { readWithRetry } from '../lib/dataFetching';
import { getUrlQuery, queryPage, queryValue, updateUrlQuery } from '../lib/urlQuery';
import { canManageOwnableResource, canUseSharedResource } from '../lib/roleAccess';
import { useFocusTrap } from '../lib/useFocusTrap';
import { QuestionDetailModal } from './QuestionDetailModal';
import { QuestionImportModal } from './QuestionImportModal';
import { useConfirm } from '../context/ConfirmContext';

export const QuestionListView: React.FC = () => {
  const {
    questions,
    subjects,
    categories,
    tags,
    kkoList,
    currentUser,
    setCurrentView,
    deleteQuestion,
    duplicateQuestion,
    selectedQuestionId,
    setSelectedQuestionId,
    selectedTagFilter,
    setSelectedTagFilter,
    shareSoalList,
    shareSoalAction,
    users,
    addToast,
    searchGlobalQuery,
    setSearchGlobalQuery,
  } = useApp();
  const confirm = useConfirm();

  const initialQuery = useMemo(() => getUrlQuery(), []);
  const [searchFilter, setSearchFilter] = useState(searchGlobalQuery || initialQuery.get('q') || '');
  const [subjectFilter, setSubjectFilter] = useState<string>(() => queryValue(initialQuery, 'subject_id'));
  const [curriculumFilter, setCurriculumFilter] = useState<string>(() => queryValue(initialQuery, 'curriculum'));
  const [bloomFilter, setBloomFilter] = useState<string>(() => queryValue(initialQuery, 'bloom_level'));
  const [levelKognitifFilter, setLevelKognitifFilter] = useState<string>(() => queryValue(initialQuery, 'level_c'));
  const [typeFilter, setTypeFilter] = useState<string>(() => queryValue(initialQuery, 'type'));
  const [jenjangFilter, setJenjangFilter] = useState<string>(() => queryValue(initialQuery, 'jenjang'));
  const [tagFilter, setTagFilter] = useState<string>(selectedTagFilter || queryValue(initialQuery, 'tag_id'));

  const [currentPage, setCurrentPage] = useState(() => queryPage(initialQuery));
  const itemsPerPage = 8;
  const productionMode = isBootstrapped();
  const [serverQuestions, setServerQuestions] = useState<Question[]>([]);
  const [serverMeta, setServerMeta] = useState<PaginationMeta | null>(null);
  const [isListLoading, setIsListLoading] = useState(productionMode);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [showImportModal, setShowImportModal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [sharingQuestionId, setSharingQuestionId] = useState<string | null>(null);
  const [selectedTeacherToShare, setSelectedTeacherToShare] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit' | 'copy'>('view');
  const [shareMessage, setShareMessage] = useState<string>('');
  const shareDialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(shareDialogRef, Boolean(sharingQuestionId), () => setSharingQuestionId(null));

  // React to selectedTagFilter changes from context
  React.useEffect(() => {
    if (selectedTagFilter) {
      setTagFilter(selectedTagFilter);
      setCurrentPage(1);
      setSelectedTagFilter(null);
    }
  }, [selectedTagFilter, setSelectedTagFilter]);

  React.useEffect(() => {
    setSearchFilter(searchGlobalQuery || '');
    setCurrentPage(1);
  }, [searchGlobalQuery]);

  React.useEffect(() => {
    updateUrlQuery({
      page: currentPage === 1 ? undefined : currentPage,
      q: searchFilter.trim() || undefined,
      subject_id: subjectFilter,
      curriculum: curriculumFilter,
      bloom_level: bloomFilter,
      level_c: levelKognitifFilter,
      type: typeFilter,
      jenjang: jenjangFilter,
      tag_id: tagFilter,
      sort: 'latest',
    });
  }, [
    currentPage,
    searchFilter,
    subjectFilter,
    curriculumFilter,
    bloomFilter,
    levelKognitifFilter,
    typeFilter,
    jenjangFilter,
    tagFilter,
  ]);

  React.useEffect(() => {
    if (!productionMode) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsListLoading(true);
      setListError(null);
      const params = {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchFilter.trim() || undefined,
          subject_id: subjectFilter === 'all' ? undefined : subjectFilter,
          curriculum: curriculumFilter === 'all' ? undefined : curriculumFilter,
          bloom_level: bloomFilter === 'all' ? undefined : bloomFilter,
          level_c: levelKognitifFilter === 'all' ? undefined : levelKognitifFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
          jenjang: jenjangFilter === 'all' ? undefined : jenjangFilter,
          tag_id: tagFilter === 'all' ? undefined : tagFilter,
          sort: 'latest',
        };

      readWithRetry(() => questionsApi.paginate(params))
        .then(result => {
          if (controller.signal.aborted) return;
          setServerQuestions(result.data);
          setServerMeta(result.meta);
        })
        .catch(error => {
          if (controller.signal.aborted) return;
          setListError(apiErrorMessage(error));
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsListLoading(false);
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [
    productionMode,
    currentPage,
    searchFilter,
    subjectFilter,
    curriculumFilter,
    bloomFilter,
    levelKognitifFilter,
    typeFilter,
    jenjangFilter,
    tagFilter,
    reloadKey,
  ]);

  // If preselected from dashboard or search
  React.useEffect(() => {
    if (selectedQuestionId) {
      const q = questions.find(item => item.id === selectedQuestionId);
      if (q) setViewingQuestion(q);
      setSelectedQuestionId(null);
    }
  }, [selectedQuestionId, questions, setSelectedQuestionId]);

  // Filter logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesText = q.question_text.toLowerCase().includes(query);
        const matchesIndicator = q.indicator_text?.toLowerCase().includes(query);
        if (!matchesText && !matchesIndicator) return false;
      }
      if (subjectFilter !== 'all' && q.subject_id !== subjectFilter) return false;
      if (curriculumFilter !== 'all' && q.curriculum !== curriculumFilter) return false;
      if (bloomFilter !== 'all' && q.level_c !== bloomFilter) return false;
      if (levelKognitifFilter !== 'all' && q.level_kognitif !== levelKognitifFilter) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (jenjangFilter !== 'all' && q.jenjang !== jenjangFilter) return false;
      if (tagFilter !== 'all') {
        if (!q.tag_ids || !q.tag_ids.includes(tagFilter)) return false;
      }

      return true;
    });
  }, [
    questions,
    searchFilter,
    subjectFilter,
    curriculumFilter,
    bloomFilter,
    levelKognitifFilter,
    typeFilter,
    jenjangFilter,
    tagFilter,
  ]);

  const localTotalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
  const totalPages = productionMode ? serverMeta?.last_page ?? 1 : localTotalPages;
  const displayedQuestions = productionMode ? serverQuestions : filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalQuestions = productionMode ? serverMeta?.total ?? 0 : filteredQuestions.length;

  const handleExportExcel = async () => {
    if (productionMode) {
      window.location.href = '/api/questions/export';
      addToast('Export Bank Soal sedang diproses oleh server.', 'info');
      return;
    }

    const sourceQuestions = questions;
    if (sourceQuestions.length === 0) {
      addToast('Tidak ada data soal untuk diekspor.', 'warning');
      return;
    }

    const exportRows = sourceQuestions.map((q, idx) => {
      const subj = subjects.find(s => s.id === q.subject_id);
      const kko = kkoList.find(k => k.id === q.kko_id);

      return {
        No: idx + 1,
        ID: q.id,
        Mata_Pelajaran: subj?.name || '-',
        Jenjang: q.jenjang,
        Kurikulum: q.curriculum.toUpperCase(),
        Tipe: q.type.toUpperCase(),
        Taksonomi_Bloom: q.level_c,
        Level_Kognitif: q.level_kognitif,
        KKO: kko?.verb || '-',
        Teks_Soal: q.question_text,
        Indikator: q.indicator_text || '',
        Pembahasan: q.explanation || '',
        Kunci_Jawaban:
          q.type === 'pg'
            ? q.pg_options?.find(o => o.is_correct)?.label || '-'
            : q.type === 'benar_salah'
            ? q.correct_boolean
              ? 'BENAR'
              : 'SALAH'
            : '-',
      };
    });

    try {
      await writeSpreadsheet(exportRows, `Export_Bank_Soal_${new Date().toISOString().slice(0, 10)}.xlsx`, 'BankSoal');
      addToast('Data Bank Soal berhasil diekspor ke format Excel!', 'success');
    } catch (error) {
      console.error(error);
      addToast('Gagal mengekspor data Bank Soal.', 'danger');
    }
  };

  const handleOpenShare = (questionId: string) => {
    setSharingQuestionId(questionId);
    setShareMessage('');
    const otherTeachers = users.filter(u => u.role === 'guru' && u.id !== currentUser.id);
    if (otherTeachers.length > 0) {
      setSelectedTeacherToShare(otherTeachers[0].id);
    }
  };

  const handleConfirmShare = async () => {
    if (!sharingQuestionId || !selectedTeacherToShare) return;
    const ok = await shareSoalAction(sharingQuestionId, selectedTeacherToShare, selectedPermission, shareMessage.trim() || undefined);
    if (ok) {
      setSharingQuestionId(null);
      if (productionMode) refreshQuestionPage();
    }
  };

  const otherTeachers = users.filter(u => (u.role === 'guru' || u.role === 'admin') && u.id !== currentUser.id);

  const refreshQuestionPage = () => setReloadKey(key => key + 1);

  const handleDuplicateQuestion = async (id: string) => {
    await duplicateQuestion(id);
    if (productionMode) refreshQuestionPage();
  };

  const handleDeleteQuestion = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Soal?',
      message: 'Butir soal ini akan dihapus dari Bank Soal.',
      confirmLabel: 'Ya, Hapus',
    });
    if (!confirmed) return;

    await deleteQuestion(id);
    if (productionMode) refreshQuestionPage();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Bank Soal Cerdas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola repositori butir soal terstandarisasi Taksonomi Bloom & Kurikulum
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-import-excel"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Import Excel
          </button>

          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Export Data
          </button>

          <button
            id="btn-add-new-question"
            onClick={() => setCurrentView('questions-create')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Buat Soal Baru
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="question-search-input"
            type="text"
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari teks pertanyaan, indikator soal, atau kata kunci..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Mapel */}
          <select
            id="filter-subject"
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Semua Mapel</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Kurikulum */}
          <select
            id="filter-curriculum"
            value={curriculumFilter}
            onChange={(e) => {
              setCurriculumFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Semua Kurikulum</option>
            <option value="merdeka">Kurikulum Merdeka</option>
            <option value="kbc">Kurikulum KBC</option>
          </select>

          {/* Bloom Taxonomy */}
          <select
            id="filter-bloom"
            value={bloomFilter}
            onChange={(e) => {
              setBloomFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none font-medium"
          >
            <option value="all">Taksonomi Bloom (Semua)</option>
            <option value="C1">C1 - Mengingat</option>
            <option value="C2">C2 - Memahami</option>
            <option value="C3">C3 - Menerapkan</option>
            <option value="C4">C4 - Menganalisis (HOTS)</option>
            <option value="C5">C5 - Mengevaluasi (HOTS)</option>
            <option value="C6">C6 - Menciptakan (HOTS)</option>
          </select>

          {/* Level Kognitif */}
          <select
            id="filter-level-kognitif"
            value={levelKognitifFilter}
            onChange={(e) => {
              setLevelKognitifFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Level Kognitif (Semua)</option>
            <option value="L1">L1 (LOTS: C1, C2)</option>
            <option value="L2">L2 (MOTS: C3)</option>
            <option value="L3">L3 (HOTS: C4, C5, C6)</option>
          </select>

          {/* Tipe Soal */}
          <select
            id="filter-type"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Semua Tipe Soal</option>
            <option value="pg">Pilihan Ganda</option>
            <option value="uraian">Uraian / Essay</option>
            <option value="menjodohkan">Menjodohkan</option>
            <option value="benar_salah">Benar / Salah</option>
          </select>

          {/* Tag & Karakteristik */}
          <select
            id="filter-tag"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none font-medium"
          >
            <option value="all">Semua Karakteristik / Tag</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Jenjang */}
          <select
            id="filter-jenjang"
            value={jenjangFilter}
            onChange={(e) => {
              setJenjangFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="SMK">SMK</option>
          </select>
        </div>
      </div>

      {/* Questions Table / Cards List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <b>{displayedQuestions.length}</b> dari <b>{totalQuestions}</b> butir soal</span>
          <span>Halaman {currentPage} dari {totalPages}</span>
        </div>

        {isListLoading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[0, 1, 2, 3].map(item => (
              <div key={item} className="p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-5 w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="h-5 w-3/4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        ) : listError ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 mx-auto flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data bank soal gagal dimuat.</p>
            <p className="text-xs text-slate-500">{listError}</p>
            <button
              onClick={() => setReloadKey(key => key + 1)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Coba Lagi
            </button>
          </div>
        ) : displayedQuestions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada butir soal yang sesuai filter.</p>
            <button
              onClick={() => {
                setSearchFilter('');
                setSubjectFilter('all');
                setCurriculumFilter('all');
                setBloomFilter('all');
                setLevelKognitifFilter('all');
                setTypeFilter('all');
                setJenjangFilter('all');
                setTagFilter('all');
                setCurrentPage(1);
              }}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedQuestions.map((q, idx) => {
              const subj = subjects.find(s => s.id === q.subject_id);
              const kko = kkoList.find(k => k.id === q.kko_id);
              const isHots = ['C4', 'C5', 'C6'].includes(q.level_c);
              const ownershipAllowed = canManageOwnableResource(currentUser.role, currentUser.id, q.created_by);
              const acceptedShare = shareSoalList.find(share =>
                share.question_id === q.id &&
                share.shared_to === currentUser.id &&
                share.is_accepted
              );
              const canShare = ownershipAllowed;
              const canEdit = ownershipAllowed || canUseSharedResource(acceptedShare?.permission, 'edit');
              const canDuplicate = ownershipAllowed || canUseSharedResource(acceptedShare?.permission, 'copy');

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-400 mr-1">
                        #{(currentPage - 1) * itemsPerPage + idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {subj?.code || 'MAPEL'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {q.type.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          isHots
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                        }`}
                      >
                        {q.level_c} ({q.level_kognitif})
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px]">
                        {q.jenjang} • {q.curriculum.toUpperCase()}
                      </span>
                      {kko && (
                        <span className="text-[11px] text-slate-400 italic">
                          KKO: {kko.verb}
                        </span>
                      )}
                    </div>

                    {/* Question Statement */}
                    <p
                      onClick={() => setViewingQuestion(q)}
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-2 leading-relaxed"
                    >
                      {q.question_text}
                    </p>

                    {/* Indicator text snippet */}
                    {q.indicator_text && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        <span className="font-medium text-slate-600 dark:text-slate-300">Indikator:</span> {q.indicator_text}
                      </p>
                    )}

                    {/* Characteristic / Tag Badges */}
                    {q.tag_ids && q.tag_ids.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {q.tag_ids.map((tid) => {
                          const tagObj = tags.find((t) => t.id === tid);
                          if (!tagObj) return null;
                          return (
                            <button
                              key={tid}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTagFilter(tid);
                                setCurrentPage(1);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 transition-colors"
                              aria-label={`Filter soal berdasarkan karakteristik ${tagObj.name}`}
                              title={`Filter soal berdasarkan karakteristik "${tagObj.name}"`}
                            >
                              <TagIcon className="w-2.5 h-2.5" />
                              {tagObj.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      id={`btn-view-q-${q.id}`}
                      onClick={() => setViewingQuestion(q)}
                      className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                      title="Lihat Detail"
                      aria-label={`Lihat detail soal ${q.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {canShare && (
                      <button
                        id={`btn-share-q-${q.id}`}
                        onClick={() => handleOpenShare(q.id)}
                        className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Bagikan ke Guru Lain"
                        aria-label={`Bagikan soal ${q.id} ke guru lain`}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}

                    {canDuplicate && (
                      <button
                        id={`btn-duplicate-q-${q.id}`}
                        onClick={() => handleDuplicateQuestion(q.id)}
                        className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Duplikasi Soal"
                        aria-label={`Duplikasi soal ${q.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}

                    {canEdit && (
                      <button
                        id={`btn-edit-q-${q.id}`}
                        onClick={() => {
                          setSelectedQuestionId(q.id);
                          setCurrentView('questions-edit');
                        }}
                        className="p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Soal"
                        aria-label={`Edit soal ${q.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {ownershipAllowed && (
                      <button
                        id={`btn-delete-q-${q.id}`}
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:bg-rose-950/40 transition-colors"
                        title="Hapus Soal"
                        aria-label={`Hapus soal ${q.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              id="btn-prev-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              id="btn-next-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewingQuestion && (
        <QuestionDetailModal
          question={viewingQuestion}
          onClose={() => setViewingQuestion(null)}
          onEdit={(id) => {
            setViewingQuestion(null);
            setSelectedQuestionId(id);
            setCurrentView('questions-edit');
          }}
          onDuplicate={(id) => {
            handleDuplicateQuestion(id).then(() => setViewingQuestion(null));
          }}
          onDelete={(id) => {
            handleDeleteQuestion(id).then(() => setViewingQuestion(null));
          }}
          onShare={(id) => {
            setViewingQuestion(null);
            handleOpenShare(id);
          }}
        />
      )}

      {showImportModal && (
        <QuestionImportModal onClose={() => setShowImportModal(false)} />
      )}

      {/* Share Modal Dialog */}
      {sharingQuestionId && (
        <div
          id="modal-share-backdrop"
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            ref={shareDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-share-question-title"
            tabIndex={-1}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 outline-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 id="modal-share-question-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600" /> Bagikan Soal ke Rekan Guru
              </h3>
              <button
                type="button"
                onClick={() => setSharingQuestionId(null)}
                aria-label="Tutup modal bagikan soal"
                title="Tutup"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Guru Penerima:
                </label>
                <select
                  value={selectedTeacherToShare}
                  onChange={(e) => setSelectedTeacherToShare(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
                >
                  {otherTeachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role.toUpperCase()}) - {t.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hak Akses Kolaborasi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['view', 'edit', 'copy'] as const).map((perm) => (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => setSelectedPermission(perm)}
                      className={`p-2 rounded-xl text-center font-bold border transition-all ${
                        selectedPermission === perm
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {perm.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pesan Pengantar / Catatan Telaah (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan catatan telaah atau pesan untuk rekan guru..."
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSharingQuestionId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-share-soal"
                onClick={handleConfirmShare}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                Kirim Undangan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
