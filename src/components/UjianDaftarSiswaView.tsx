import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Clock,
  KeyRound,
  Play,
  CheckCircle2,
  Eye,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Ujian } from '../types';
import { useFocusTrap } from '../lib/useFocusTrap';

export const UjianDaftarSiswaView: React.FC = () => {
  const {
    ujianList,
    currentUser,
    paketSoalList,
    startUjianCBT,
    setSelectedUjianId,
    setCurrentView,
    addToast
  } = useApp();

  const [tokenInput, setTokenInput] = useState('');
  const [activeTokenExam, setActiveTokenExam] = useState<Ujian | null>(null);
  const tokenDialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(tokenDialogRef, Boolean(activeTokenExam), () => setActiveTokenExam(null));

  // Student specific exams
  const myExams = ujianList.filter(u => u.siswa_id === currentUser.id);

  const handleStartWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTokenExam) return;

    if (activeTokenExam.token_ujian && tokenInput.trim().toUpperCase() !== activeTokenExam.token_ujian.toUpperCase()) {
      addToast('Token ujian salah! Silakan tanyakan token kepada guru pengawas.', 'danger');
      return;
    }

    try {
      await startUjianCBT(activeTokenExam.id);
      setSelectedUjianId(activeTokenExam.id);
      setCurrentView('ujian-cbt');
    } catch {
      // Toast is handled by the data layer.
    }
  };

  const handleDirectStart = async (exam: Ujian) => {
    if (exam.token_ujian) {
      setActiveTokenExam(exam);
      setTokenInput('');
    } else {
      try {
        await startUjianCBT(exam.id);
        setSelectedUjianId(exam.id);
        setCurrentView('ujian-cbt');
      } catch {
        // Toast is handled by the data layer.
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
          <GraduationCap className="w-4 h-4 text-amber-300" />
          <span>Ruang Ujian Siswa (Computer Based Test)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">
          Daftar Ujian Anda: {currentUser.name}
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
          Pilihlah jadwal ujian yang sedang aktif, masukkan token ujian jika diminta pengawas, dan kerjakan dengan penuh integritas.
        </p>
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">Ketentuan Keamanan Ujian (Anti-Cheat CBT):</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300">
            <li>Ujian akan mengunci layar menjadi Fullscreen penuh secara otomatis.</li>
            <li>Dilarang berpindah tab browser atau meminimalkan layar (Maksimal 3 kali peringatan pelanggaran).</li>
            <li>Jawaban tersimpan otomatis secara berkala (Auto-Save).</li>
          </ul>
        </div>
      </div>

      {/* List of Exams */}
      <div className="space-y-4">
        {myExams.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum Ada Jadwal Ujian</h4>
            <p className="text-xs text-slate-400">Guru belum menjadwalkan paket ujian untuk akun siswa ini.</p>
          </div>
        ) : (
          myExams.map((exam) => {
            const paket = paketSoalList.find(p => p.id === exam.paket_soal_id);
            const isFinished = exam.status === 'finished';
            const isActive = exam.status === 'active' || exam.status === 'draft';

            return (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-900 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isFinished
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse'
                      }`}
                    >
                      {isFinished ? 'Selesai Dikerjakan' : 'Siap / Sedang Berlangsung'}
                    </span>
                    {exam.token_ujian && !isFinished && (
                      <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                        Token: {exam.token_ujian}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> {exam.total_soal} Soal
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> {exam.duration_minutes} Menit
                    </span>
                    {isFinished && (
                      <span className="font-extrabold text-emerald-600">
                        Nilai Akhir: {exam.total_score} / {exam.max_score || 100}
                      </span>
                    )}
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  {isFinished ? (
                    <button
                      id={`btn-view-my-result-${exam.id}`}
                      onClick={() => {
                        setSelectedUjianId(exam.id);
                        setCurrentView('ujian-hasil');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Lihat Pembahasan & Nilai
                    </button>
                  ) : (
                    <button
                      id={`btn-start-my-cbt-${exam.id}`}
                      onClick={() => handleDirectStart(exam)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4" /> Mulai Kerjakan Ujian
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Token Verification Modal */}
      {activeTokenExam && (
        <div
          id="modal-token-backdrop"
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            ref={tokenDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-token-title"
            tabIndex={-1}
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 id="modal-token-title" className="text-base font-bold text-slate-900 dark:text-white">Masukkan Token Ujian</h3>
              <p className="text-xs text-slate-400">
                {activeTokenExam.title} (Hint: {activeTokenExam.token_ujian})
              </p>
            </div>

            <form onSubmit={handleStartWithToken} className="space-y-4">
              <input
                id="input-exam-token"
                type="text"
                required
                autoFocus
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                aria-label="Token ujian"
                placeholder="CONTOH: SAS9A"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 rounded-xl text-center font-mono font-bold tracking-widest text-lg text-slate-900 dark:text-white uppercase outline-none"
              />

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTokenExam(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-token-start"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Konfirmasi & Masuk CBT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
