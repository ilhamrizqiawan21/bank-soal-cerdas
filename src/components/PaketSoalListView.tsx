import React, { useState } from 'react';
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
  Calendar,
  CheckCircle2,
  Eye,
  Send,
  X,
  FileDown,
  Printer,
  FileText,
  FolderTree
} from 'lucide-react';
import { PaketSoal } from '../types';
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
    sharePaketAction,
    addUjian,
    addToast
  } = useApp();

  const [sharingPaketId, setSharingPaketId] = useState<string | null>(null);
  const [selectedTeacherToShare, setSelectedTeacherToShare] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit' | 'copy'>('view');
  const [shareMessage, setShareMessage] = useState<string>('');

  // Exam assignment modal
  const [assigningPaket, setAssigningPaket] = useState<PaketSoal | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Export Modal state
  const [exportingPaket, setExportingPaket] = useState<PaketSoal | null>(null);

  const students = users.filter(u => u.role === 'siswa' && u.is_active);
  const otherTeachers = users.filter(u => (u.role === 'guru' || u.role === 'admin') && u.id !== currentUser.id);

  const handleOpenAssign = (paket: PaketSoal) => {
    setAssigningPaket(paket);
    setExamTitle(`CBT ${paket.name}`);
    setSelectedStudents(students.map(s => s.id)); // select all active students by default
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningPaket || selectedStudents.length === 0) {
      addToast('Pilih setidaknya 1 siswa untuk dijadwalkan ujian!', 'warning');
      return;
    }

    addUjian({
      paket_soal_id: assigningPaket.id,
      siswa_ids: selectedStudents,
      title: examTitle,
      duration_minutes: assigningPaket.duration_minutes || 60,
    });

    setAssigningPaket(null);
    setCurrentView('ujian');
  };

  const handleOpenShare = (paketId: string) => {
    setSharingPaketId(paketId);
    setShareMessage('');
    if (otherTeachers.length > 0) {
      setSelectedTeacherToShare(otherTeachers[0].id);
    }
  };

  const handleConfirmShare = () => {
    if (!sharingPaketId || !selectedTeacherToShare) return;
    sharePaketAction(sharingPaketId, selectedTeacherToShare, selectedPermission, shareMessage.trim() || undefined);
    setSharingPaketId(null);
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

      {/* Paket Soal Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paketSoalList.map((paket) => {
          const totalScore = paket.items.reduce((sum, i) => sum + (i.score || 0), 0);
          const creator = users.find(u => u.id === paket.created_by);
          const canEdit = currentUser.role === 'admin' || currentUser.id === paket.created_by;

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
                  >
                    <FileDown className="w-3.5 h-3.5" /> Ekspor Naskah
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-share-paket-${paket.id}`}
                      onClick={() => handleOpenShare(paket.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                      title="Bagikan ke Guru Lain"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-duplicate-paket-${paket.id}`}
                      onClick={() => duplicatePaketSoal(paket.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                      title="Duplikasi Paket"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
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
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-delete-paket-${paket.id}`}
                        onClick={() => {
                          if (window.confirm(`Hapus paket soal "${paket.name}"?`)) {
                            deletePaketSoal(paket.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:bg-rose-950/40 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Schedule / Assign CBT Exam */}
      {assigningPaket && (
        <div
          id="modal-assign-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" /> Jadwalkan Ujian CBT
                </h3>
                <p className="text-xs text-slate-400">{assigningPaket.name}</p>
              </div>
              <button
                onClick={() => setAssigningPaket(null)}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" /> Bagikan Paket Soal
              </h3>
              <button
                onClick={() => setSharingPaketId(null)}
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
                onClick={() => setSharingPaketId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
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
