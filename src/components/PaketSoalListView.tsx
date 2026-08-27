import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Plus,
  Clock,
  HelpCircle,
  Edit,
  Copy,
  Trash2,
  Share2,
  Send,
  X,
  FileDown,
  FolderTree,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PaketSoal } from '../types';
import { apiErrorMessage, isBootstrapped } from '../lib/api';
import { PaginationMeta, paketSoalApi } from '../lib/domainApi';
import { canManageOwnableResource, canUseSharedResource } from '../lib/roleAccess';
import { useFocusTrap } from '../lib/useFocusTrap';
import { PaketSoalExportModal } from './PaketSoalExportModal';

export const PaketSoalListView: React.FC = () => {
  const {
    paketSoalList,
    questions,
    users,
    categories,
    currentUser,
    setCurrentView,
    setSelectedPaketId,
    deletePaketSoal,
    duplicatePaketSoal,
    updatePaketSoal,
    sharePaketList,
    sharePaketAction,
    addUjian,
    addToast
  } = useApp();

  const [sharingPaketId, setSharingPaketId] = useState<string | null>(null);
  const [selectedTeacherToShare, setSelectedTeacherToShare] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit' | 'copy'>('view');
  const [shareMessage, setShareMessage] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('all');
  const [curriculumFilter, setCurriculumFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const productionMode = isBootstrapped();
  const [serverPaketSoal, setServerPaketSoal] = useState<PaketSoal[]>([]);
  const [serverMeta, setServerMeta] = useState<PaginationMeta | null>(null);
  const [isListLoading, setIsListLoading] = useState(productionMode);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Exam assignment modal
  const [assigningPaket, setAssigningPaket] = useState<PaketSoal | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Export Modal state
  const [exportingPaket, setExportingPaket] = useState<PaketSoal | null>(null);
  const assignDialogRef = useRef<HTMLDivElement>(null);
  const shareDialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(assignDialogRef, Boolean(assigningPaket), () => setAssigningPaket(null));
  useFocusTrap(shareDialogRef, Boolean(sharingPaketId), () => setSharingPaketId(null));

  const students = users.filter(u => u.role === 'siswa' && u.is_active);
  const otherTeachers = users.filter(u => (u.role === 'guru' || u.role === 'admin') && u.id !== currentUser.id);

  React.useEffect(() => {
    if (!productionMode) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsListLoading(true);
      setListError(null);
      paketSoalApi
        .paginate({
          page: currentPage,
          per_page: itemsPerPage,
          search: searchFilter.trim() || undefined,
          jenjang: jenjangFilter === 'all' ? undefined : jenjangFilter,
          curriculum: curriculumFilter === 'all' ? undefined : curriculumFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          sort: 'latest',
        })
        .then(result => {
          if (controller.signal.aborted) return;
          setServerPaketSoal(result.data);
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
  }, [productionMode, currentPage, searchFilter, jenjangFilter, curriculumFilter, statusFilter, reloadKey]);

  const filteredPaketSoal = useMemo(() => {
    return paketSoalList.filter((paket) => {
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesName = paket.name.toLowerCase().includes(query);
        const matchesDescription = paket.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) return false;
      }
      if (jenjangFilter !== 'all' && paket.jenjang !== jenjangFilter) return false;
      if (curriculumFilter !== 'all' && paket.curriculum !== curriculumFilter) return false;
      if (statusFilter !== 'all' && paket.status !== statusFilter) return false;
      return true;
    });
  }, [paketSoalList, searchFilter, jenjangFilter, curriculumFilter, statusFilter]);

  const localTotalPages = Math.ceil(filteredPaketSoal.length / itemsPerPage) || 1;
  const totalPages = productionMode ? serverMeta?.last_page ?? 1 : localTotalPages;
  const displayedPaketSoal = productionMode ? serverPaketSoal : filteredPaketSoal.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPaketSoal = productionMode ? serverMeta?.total ?? 0 : filteredPaketSoal.length;
  const refreshPaketPage = () => setReloadKey(key => key + 1);

  const handleOpenAssign = (paket: PaketSoal) => {
    setAssigningPaket(paket);
    setExamTitle(`CBT ${paket.name}`);
    setSelectedStudents(students.map(s => s.id)); // select all active students by default
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningPaket || selectedStudents.length === 0) {
      addToast('Pilih setidaknya 1 siswa untuk dijadwalkan ujian!', 'warning');
      return;
    }

    try {
      await addUjian({
        paket_soal_id: assigningPaket.id,
        siswa_ids: selectedStudents,
        title: examTitle,
        duration_minutes: assigningPaket.duration_minutes || 60,
      });

      setAssigningPaket(null);
      setCurrentView('ujian');
    } catch {
      // Toast is handled by the data layer.
    }
  };

  const handleOpenShare = (paketId: string) => {
    setSharingPaketId(paketId);
    setShareMessage('');
    if (otherTeachers.length > 0) {
      setSelectedTeacherToShare(otherTeachers[0].id);
    }
  };

  const handleConfirmShare = async () => {
    if (!sharingPaketId || !selectedTeacherToShare) return;
    const ok = await sharePaketAction(sharingPaketId, selectedTeacherToShare, selectedPermission, shareMessage.trim() || undefined);
    if (ok) setSharingPaketId(null);
  };

  const handleDuplicatePaket = async (id: string) => {
    await duplicatePaketSoal(id);
    if (productionMode) refreshPaketPage();
  };

  const handleDeletePaket = async (id: string) => {
    await deletePaketSoal(id);
    if (productionMode) refreshPaketPage();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Paket Soal & Evaluasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Susun dan jadwalkan kumpulan butir soal menjadi paket asesmen terstruktur
          </p>
        </div>

        <button
          id="btn-create-paket-soal"
          onClick={() => {
            setSelectedPaketId(null);
            setCurrentView('paket-soal-create');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Rancang Paket Baru
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama paket atau deskripsi..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <select
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
          </select>
          <select
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
            <option value="both">Kombinasi</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearchFilter('');
              setJenjangFilter('all');
              setCurriculumFilter('all');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Filter className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Paket Soal Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <b>{displayedPaketSoal.length}</b> dari <b>{totalPaketSoal}</b> paket soal</span>
          <span>Halaman {currentPage} dari {totalPages}</span>
        </div>

        {isListLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2, 3, 4, 5].map(item => (
              <div key={item} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex gap-2">
                  <div className="h-5 w-14 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-5 w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="h-5 w-4/5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-10 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        ) : listError ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data paket soal gagal dimuat.</p>
            <p className="text-xs text-slate-500">{listError}</p>
            <button
              onClick={refreshPaketPage}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Coba Lagi
            </button>
          </div>
        ) : displayedPaketSoal.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada paket soal yang sesuai filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedPaketSoal.map((paket) => {
          const totalScore = paket.items.reduce((sum, i) => sum + (i.score || 0), 0);
          const creator = users.find(u => u.id === paket.created_by);
          const ownershipAllowed = canManageOwnableResource(currentUser.role, currentUser.id, paket.created_by);
          const acceptedShare = sharePaketList.find(share =>
            share.paket_soal_id === paket.id &&
            share.shared_to === currentUser.id &&
            share.is_accepted
          );
          const canShare = ownershipAllowed;
          const canEdit = ownershipAllowed || canUseSharedResource(acceptedShare?.permission, 'edit');
          const canDuplicate = ownershipAllowed || canUseSharedResource(acceptedShare?.permission, 'copy');

          return (
            <div
              key={paket.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all"
            >
              <div className="space-y-3">
                {/* Status and badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {paket.jenjang}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                      {paket.curriculum.toUpperCase()}
                    </span>
                    {categories.find(c => c.id === paket.kategori_id) && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <FolderTree className="w-2.5 h-2.5" />
                        {categories.find(c => c.id === paket.kategori_id)?.name.split('(')[0].trim() || 'Asesmen'}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      paket.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : paket.status === 'archived'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {paket.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                    {paket.name}
                  </h3>
                  {paket.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {paket.description}
                    </p>
                  )}
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    <span><b>{paket.items.length}</b> Butir Soal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span><b>{paket.duration_minutes || 60}</b> Menit</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Jadwalkan Ujian Button */}
                  <button
                    id={`btn-assign-exam-${paket.id}`}
                    onClick={() => handleOpenAssign(paket)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> CBT Ujian
                  </button>

                  {/* Ekspor Word & PDF Button */}
                  <button
                    id={`btn-export-paket-${paket.id}`}
                    onClick={() => setExportingPaket(paket)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-all"
                    title="Ekspor ke Word (.doc) dan Cetak PDF"
                    aria-label={`Ekspor naskah paket ${paket.name}`}
                  >
                    <FileDown className="w-3.5 h-3.5" /> Ekspor Naskah
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    {canShare && (
                      <button
                        id={`btn-share-paket-${paket.id}`}
                        onClick={() => handleOpenShare(paket.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Bagikan ke Guru Lain"
                        aria-label={`Bagikan paket ${paket.name} ke guru lain`}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDuplicate && (
                      <button
                        id={`btn-duplicate-paket-${paket.id}`}
                        onClick={() => handleDuplicatePaket(paket.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Duplikasi Paket"
                        aria-label={`Duplikasi paket ${paket.name}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-edit-paket-${paket.id}`}
                        onClick={() => {
                          setSelectedPaketId(paket.id);
                          setCurrentView('paket-soal-edit');
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Paket"
                        aria-label={`Edit paket ${paket.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {ownershipAllowed && (
                        <button
                          id={`btn-delete-paket-${paket.id}`}
                          onClick={() => {
                            if (window.confirm(`Hapus paket soal "${paket.name}"?`)) {
                              handleDeletePaket(paket.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus"
                          aria-label={`Hapus paket ${paket.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Schedule / Assign CBT Exam */}
      {assigningPaket && (
        <div
          id="modal-assign-backdrop"
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            ref={assignDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-assign-title"
            tabIndex={-1}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 outline-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 id="modal-assign-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" /> Jadwalkan Ujian CBT
                </h3>
                <p className="text-xs text-slate-400">{assigningPaket.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningPaket(null)}
                aria-label="Tutup modal jadwalkan ujian"
                title="Tutup"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Ujian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Pilih Peserta Siswa ({selectedStudents.length} Siswa Terpilih)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedStudents.length === students.length) setSelectedStudents([]);
                      else setSelectedStudents(students.map(s => s.id));
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    {selectedStudents.length === students.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/40">
                  {students.map((st) => {
                    const isChecked = selectedStudents.includes(st.id);
                    return (
                      <label
                        key={st.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStudents(prev => [...prev, st.id]);
                              else setSelectedStudents(prev => prev.filter(id => id !== st.id));
                            }}
                            className="rounded text-blue-600"
                          />
                          <span>{st.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">NISN: {st.nip_nisn || '-'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningPaket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-assign-exam"
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  <Send className="w-4 h-4" /> Publikasikan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      {sharingPaketId && (
        <div
          id="modal-share-paket-backdrop"
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            ref={shareDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-share-paket-title"
            tabIndex={-1}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 outline-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 id="modal-share-paket-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" /> Bagikan Paket Soal
              </h3>
              <button
                type="button"
                onClick={() => setSharingPaketId(null)}
                aria-label="Tutup modal bagikan paket soal"
                title="Tutup"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Rekan Guru:
                </label>
                <select
                  value={selectedTeacherToShare}
                  onChange={(e) => setSelectedTeacherToShare(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
                >
                  {otherTeachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hak Akses:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['view', 'edit', 'copy'] as const).map((perm) => (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => setSelectedPermission(perm)}
                      className={`p-2 rounded-xl text-center font-bold border transition-all ${
                        selectedPermission === perm
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
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
                onClick={() => setSharingPaketId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-share-paket"
                onClick={handleConfirmShare}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                Kirim Undangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Export Word & PDF */}
      {exportingPaket && (
        <PaketSoalExportModal
          paket={exportingPaket}
          onClose={() => setExportingPaket(null)}
        />
      )}
    </div>
  );
};
