import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  Eye,
  KeyRound,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useConfirm } from '../context/ConfirmContext';
import { Ujian, UjianStatus } from '../types';
import { apiErrorMessage, isBootstrapped } from '../lib/api';
import { PaginationMeta, ujianApi } from '../lib/api/ujian';
import { readWithRetry } from '../lib/dataFetching';
import { getUrlQuery, queryPage, queryValue, updateUrlQuery } from '../lib/urlQuery';
import { Button, EmptyState, Modal, Skeleton } from './ui';

type ExamFormState = {
  paket_soal_id: string;
  siswa_id: string;
  title: string;
  description: string;
  duration_minutes: string;
};

const statusLabels: Record<UjianStatus | 'all', string> = {
  all: 'Semua Status',
  draft: 'Draft',
  active: 'Aktif',
  finished: 'Selesai',
  expired: 'Kedaluwarsa',
};

const emptyForm: ExamFormState = {
  paket_soal_id: '',
  siswa_id: '',
  title: '',
  description: '',
  duration_minutes: '',
};

export const UjianManagementView: React.FC = () => {
  const {
    ujianList,
    users,
    paketSoalList,
    addUjian,
    updateUjian,
    publishUjian,
    deleteUjian,
    setSelectedUjianId,
    setCurrentView,
    refreshServerData,
    addToast,
  } = useApp();
  const confirm = useConfirm();

  const initialQuery = useMemo(() => getUrlQuery(), []);
  const [searchFilter, setSearchFilter] = useState(() => initialQuery.get('q') || '');
  const [statusFilter, setStatusFilter] = useState<UjianStatus | 'all'>(() => {
    const status = queryValue(initialQuery, 'status');
    return ['draft', 'active', 'finished', 'expired'].includes(status) ? status as UjianStatus : 'all';
  });
  const [studentFilter, setStudentFilter] = useState<string>(() => queryValue(initialQuery, 'siswa_id'));
  const [currentPage, setCurrentPage] = useState(() => queryPage(initialQuery));
  const [serverExams, setServerExams] = useState<Ujian[]>([]);
  const [serverMeta, setServerMeta] = useState<PaginationMeta | null>(null);
  const [isListLoading, setIsListLoading] = useState(isBootstrapped());
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingExam, setEditingExam] = useState<Ujian | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ExamFormState>(emptyForm);

  const productionMode = isBootstrapped();
  const itemsPerPage = 10;
  const students = users.filter(user => user.role === 'siswa' && user.is_active);
  const publishedPaket = paketSoalList.filter(paket => paket.status === 'published');

  React.useEffect(() => {
    updateUrlQuery({
      page: currentPage === 1 ? undefined : currentPage,
      q: searchFilter.trim() || undefined,
      status: statusFilter,
      siswa_id: studentFilter,
      sort: 'latest',
    });
  }, [currentPage, searchFilter, statusFilter, studentFilter]);

  React.useEffect(() => {
    if (!productionMode) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsListLoading(true);
      setListError(null);

      readWithRetry(() => ujianApi.paginate({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchFilter.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        siswa_id: studentFilter === 'all' ? undefined : studentFilter,
        sort: 'latest',
      }))
        .then(result => {
          if (controller.signal.aborted) return;
          setServerExams(result.data);
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
  }, [productionMode, currentPage, searchFilter, statusFilter, studentFilter, reloadKey]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, statusFilter, studentFilter]);

  const filteredLocalExams = useMemo(() => {
    return ujianList.filter(exam => {
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const student = users.find(user => user.id === exam.siswa_id);
        const paket = paketSoalList.find(item => item.id === exam.paket_soal_id);
        const matches = [
          exam.title,
          exam.description,
          student?.name,
          student?.nip_nisn,
          paket?.name,
        ].some(value => value?.toLowerCase().includes(query));
        if (!matches) return false;
      }
      if (statusFilter !== 'all' && exam.status !== statusFilter) return false;
      if (studentFilter !== 'all' && exam.siswa_id !== studentFilter) return false;
      return true;
    });
  }, [ujianList, users, paketSoalList, searchFilter, statusFilter, studentFilter]);

  const totalPages = productionMode
    ? serverMeta?.last_page ?? 1
    : Math.ceil(filteredLocalExams.length / itemsPerPage) || 1;
  const displayedExams = productionMode
    ? serverExams
    : filteredLocalExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalExams = productionMode ? serverMeta?.total ?? 0 : filteredLocalExams.length;

  const reloadExams = async () => {
    setReloadKey(key => key + 1);
    await refreshServerData().catch(() => {});
  };

  const openCreateForm = () => {
    const firstPaket = publishedPaket[0];
    setEditingExam(null);
    setForm({
      ...emptyForm,
      paket_soal_id: firstPaket?.id || '',
      siswa_id: students[0]?.id || '',
      title: firstPaket ? `CBT ${firstPaket.name}` : '',
      description: firstPaket?.description || '',
      duration_minutes: String(firstPaket?.duration_minutes || 60),
    });
    setIsFormOpen(true);
  };

  const openEditForm = (exam: Ujian) => {
    setEditingExam(exam);
    setForm({
      paket_soal_id: exam.paket_soal_id,
      siswa_id: exam.siswa_id,
      title: exam.title,
      description: exam.description || '',
      duration_minutes: String(exam.duration_minutes || ''),
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      addToast('Judul ujian wajib diisi.', 'warning');
      return;
    }

    if (!editingExam && (!form.paket_soal_id || !form.siswa_id)) {
      addToast('Pilih paket soal dan siswa peserta.', 'warning');
      return;
    }

    const duration = Number(form.duration_minutes);
    if (!Number.isFinite(duration) || duration < 1 || duration > 180) {
      addToast('Durasi ujian harus antara 1 sampai 180 menit.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExam) {
        if (productionMode) {
          await ujianApi.update(editingExam.id, {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            duration_minutes: duration,
            status: editingExam.status,
          });
          addToast('Data ujian berhasil diperbarui.', 'success');
          await reloadExams();
        } else {
          await updateUjian(editingExam.id, {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            duration_minutes: duration,
          });
        }
      } else if (productionMode) {
        await ujianApi.create({
          paket_soal_id: form.paket_soal_id,
          siswa_id: form.siswa_id,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          duration_minutes: duration,
        });
        addToast('Jadwal ujian berhasil dibuat.', 'success');
        await reloadExams();
      } else {
        await addUjian({
          paket_soal_id: form.paket_soal_id,
          siswa_ids: [form.siswa_id],
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          duration_minutes: duration,
        });
      }

      setIsFormOpen(false);
      setEditingExam(null);
    } catch (error) {
      if (productionMode) addToast(apiErrorMessage(error), 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishUjian = async (ujian: Ujian) => {
    const confirmed = await confirm({
      title: 'Buka Ujian?',
      message: `Ujian "${ujian.title}" akan dipublikasikan dan bisa diakses siswa.`,
      confirmLabel: 'Ya, Buka Ujian',
    });
    if (!confirmed) return;

    await publishUjian(ujian.id);
    if (productionMode) await reloadExams();
  };

  const handleDeleteUjian = async (ujian: Ujian) => {
    const confirmed = await confirm({
      title: 'Hapus Jadwal Ujian?',
      message: `Jadwal ujian "${ujian.title}" akan dihapus dari sistem.`,
      confirmLabel: 'Ya, Hapus',
    });
    if (!confirmed) return;

    await deleteUjian(ujian.id);
    if (productionMode) await reloadExams();
  };

  const handleViewResult = (exam: Ujian) => {
    setSelectedUjianId(exam.id);
    setCurrentView('ujian-hasil');
  };

  const clearFilters = () => {
    setSearchFilter('');
    setStatusFilter('all');
    setStudentFilter('all');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            Manajemen Jadwal & Hasil Ujian CBT
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Pantau jadwal, status pengerjaan, token, dan rekap nilai ujian siswa.
          </p>
        </div>

        <Button id="btn-create-exam" onClick={openCreateForm} className="self-start lg:self-auto">
          <Plus className="h-4 w-4" />
          Jadwalkan Ujian
        </Button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchFilter}
            onChange={event => setSearchFilter(event.target.value)}
            placeholder="Cari judul, paket, siswa, atau NISN"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {searchFilter && (
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Bersihkan pencarian"
              title="Bersihkan pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={studentFilter}
          onChange={event => setStudentFilter(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="all">Semua Siswa</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>{student.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value as UjianStatus | 'all')}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {isListLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : listError ? (
          <EmptyState
            className="px-4 py-16"
            icon={<ClipboardCheck className="h-6 w-6" />}
            title="Gagal Memuat Jadwal Ujian"
            description={listError}
            action={<Button variant="secondary" size="sm" onClick={() => setReloadKey(key => key + 1)}>Coba Lagi</Button>}
          />
        ) : displayedExams.length === 0 ? (
          <EmptyState
            className="px-4 py-16"
            icon={<ClipboardCheck className="h-6 w-6" />}
            title="Tidak Ada Jadwal Ujian"
            description="Tidak ada jadwal ujian yang cocok dengan filter saat ini."
            action={<Button variant="secondary" size="sm" onClick={clearFilters}>Reset Filter</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                <tr>
                  <th className="p-4">Peserta Siswa</th>
                  <th className="p-4">Judul & Paket Soal</th>
                  <th className="p-4">Token</th>
                  <th className="p-4">Durasi / Soal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Hasil / Nilai</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedExams.map(exam => {
                  const student = exam.siswa ?? users.find(user => user.id === exam.siswa_id);
                  const paket = exam.paket_soal ?? paketSoalList.find(item => item.id === exam.paket_soal_id);

                  return (
                    <tr key={exam.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div>{student?.name || 'Siswa'}</div>
                        <span className="font-mono text-[10px] text-slate-400">
                          NISN: {student?.nip_nisn || '-'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{exam.title}</div>
                        <span className="text-[11px] text-slate-400">{paket?.name || 'Paket Soal'}</span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 font-mono font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <KeyRound className="h-3 w-3 text-amber-500" /> {exam.token_ujian || '-'}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <div>{exam.duration_minutes} Menit</div>
                        <span className="text-[10px] text-slate-400">{exam.total_soal} Butir Soal</span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            exam.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : exam.status === 'finished'
                              ? 'bg-blue-100 text-blue-800'
                              : exam.status === 'expired'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {statusLabels[exam.status]}
                        </span>
                      </td>

                      <td className="p-4">
                        {exam.status === 'finished' ? (
                          <div className="space-y-0.5">
                            <span className="text-sm font-extrabold text-emerald-600">
                              {exam.total_score} / {exam.max_score || 100}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {exam.submitted_at ? new Date(exam.submitted_at).toLocaleString('id-ID') : '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="italic text-slate-400">Belum selesai</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {exam.status === 'draft' && (
                            <button
                              id={`btn-publish-exam-${exam.id}`}
                              onClick={() => handlePublishUjian(exam)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
                              title="Aktifkan Ujian untuk Siswa"
                              aria-label={`Aktifkan ujian ${exam.title} untuk siswa`}
                            >
                              <Play className="h-3 w-3" /> Buka
                            </button>
                          )}

                          {exam.status !== 'finished' && (
                            <button
                              onClick={() => openEditForm(exam)}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
                              title="Edit Jadwal"
                              aria-label={`Edit jadwal ujian ${exam.title}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}

                          {exam.status === 'finished' && (
                            <button
                              id={`btn-view-result-${exam.id}`}
                              onClick={() => handleViewResult(exam)}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
                              title="Lihat Lembar Jawaban & Nilai"
                              aria-label={`Lihat hasil ujian ${exam.title}`}
                            >
                              <Eye className="h-3.5 w-3.5" /> Hasil
                            </button>
                          )}

                          <button
                            id={`btn-delete-exam-${exam.id}`}
                            onClick={() => handleDeleteUjian(exam)}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            title="Hapus Jadwal"
                            aria-label={`Hapus jadwal ujian ${exam.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isListLoading && !listError && totalExams > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Menampilkan {displayedExams.length} dari {totalExams} jadwal
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-20 text-center font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={isFormOpen}
        title={editingExam ? 'Edit Jadwal Ujian' : 'Jadwalkan Ujian'}
        onClose={() => {
          if (!isSubmitting) setIsFormOpen(false);
        }}
        maxWidth="lg"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" form="exam-form" loading={isSubmitting}>
              {editingExam ? 'Simpan Perubahan' : 'Buat Jadwal'}
            </Button>
          </>
        )}
      >
        <form id="exam-form" onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          {!editingExam && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 font-bold text-slate-700 dark:text-slate-300">
                Paket Soal
                <select
                  value={form.paket_soal_id}
                  onChange={event => {
                    const paket = paketSoalList.find(item => item.id === event.target.value);
                    setForm(prev => ({
                      ...prev,
                      paket_soal_id: event.target.value,
                      title: prev.title || (paket ? `CBT ${paket.name}` : ''),
                      description: prev.description || paket?.description || '',
                      duration_minutes: prev.duration_minutes || String(paket?.duration_minutes || 60),
                    }));
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="">Pilih paket soal</option>
                  {publishedPaket.map(paket => (
                    <option key={paket.id} value={paket.id}>{paket.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5 font-bold text-slate-700 dark:text-slate-300">
                Peserta Siswa
                <select
                  value={form.siswa_id}
                  onChange={event => setForm(prev => ({ ...prev, siswa_id: event.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="">Pilih siswa</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <label className="space-y-1.5 font-bold text-slate-700 dark:text-slate-300">
            Judul Ujian
            <input
              value={form.title}
              onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <label className="space-y-1.5 font-bold text-slate-700 dark:text-slate-300">
              Deskripsi
              <input
                value={form.description}
                onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>

            <label className="space-y-1.5 font-bold text-slate-700 dark:text-slate-300">
              Durasi
              <input
                type="number"
                min={1}
                max={180}
                value={form.duration_minutes}
                onChange={event => setForm(prev => ({ ...prev, duration_minutes: event.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
          </div>

          {editingExam && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              Status ujian mengikuti transisi backend. Draft dibuka melalui tombol <strong>Buka</strong>; ujian selesai/expired tidak diubah dari form ini.
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
