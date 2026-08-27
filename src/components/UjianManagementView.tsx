import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardCheck,
  Plus,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Play,
  Send,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { Ujian } from '../types';

export const UjianManagementView: React.FC = () => {
  const {
    ujianList,
    users,
    paketSoalList,
    publishUjian,
    deleteUjian,
    setSelectedUjianId,
    setCurrentView,
    addToast
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingResultExam, setViewingResultExam] = useState<Ujian | null>(null);

  const filteredExams = ujianList.filter((u) => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            Manajemen Jadwal & Hasil Ujian CBT
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status pengerjaan ujian siswa dan rekapitulasi nilai secara terpusat
          </p>
        </div>

        <button
          id="btn-schedule-from-paket"
          onClick={() => setCurrentView('paket-soal')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Jadwalkan dari Paket Soal
        </button>
      </div>

      {/* Filter status tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['all', 'active', 'finished', 'draft'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all capitalize ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {st === 'all' ? 'Semua Status' : st}
          </button>
        ))}
      </div>

      {/* Table of Scheduled Exams */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredExams.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Tidak ada jadwal ujian dengan status ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
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
                {filteredExams.map((u) => {
                  const student = users.find(s => s.id === u.siswa_id);
                  const paket = paketSoalList.find(p => p.id === u.paket_soal_id);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div>{student?.name || 'Siswa'}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          NISN: {student?.nip_nisn || '-'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{u.title}</div>
                        <span className="text-[11px] text-slate-400">{paket?.name || 'Paket Soal'}</span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <KeyRound className="w-3 h-3 text-amber-500" /> {u.token_ujian || '-'}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <div>{u.duration_minutes} Menit</div>
                        <span className="text-[10px] text-slate-400">{u.total_soal} Butir Soal</span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                              : u.status === 'finished'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="p-4">
                        {u.status === 'finished' ? (
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-emerald-600 text-sm">
                              {u.total_score} / {u.max_score || 100}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {u.submitted_at ? new Date(u.submitted_at).toLocaleTimeString('id-ID') : '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum dikerjakan</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status === 'draft' && (
                            <button
                              id={`btn-publish-exam-${u.id}`}
                              onClick={() => publishUjian(u.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                              title="Aktifkan Ujian untuk Siswa"
                              aria-label={`Aktifkan ujian ${u.title} untuk siswa`}
                            >
                              <Play className="w-3 h-3" /> Buka Ujian
                            </button>
                          )}

                          {u.status === 'finished' && (
                            <button
                              id={`btn-view-result-${u.id}`}
                              onClick={() => {
                                setSelectedUjianId(u.id);
                                setCurrentView('ujian-hasil');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 rounded-lg transition-colors"
                              title="Lihat Lembar Jawaban & Nilai"
                              aria-label={`Lihat hasil ujian ${u.title}`}
                            >
                              <Eye className="w-3.5 h-3.5" /> Hasil
                            </button>
                          )}

                          <button
                            id={`btn-delete-exam-${u.id}`}
                            onClick={() => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus jadwal ujian ini?')) {
                                deleteUjian(u.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Hapus Jadwal"
                            aria-label={`Hapus jadwal ujian ${u.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
};
