import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  ShieldAlert,
  BrainCircuit,
  Lock,
  Flag
} from 'lucide-react';
import { MatchingPair, PgOption, Question } from '../types';

export const UjianKerjakanCBTView: React.FC = () => {
  const {
    ujianList,
    questions,
    selectedUjianId,
    saveUjianJawaban,
    submitUjianCBT,
    setSelectedUjianId,
    setCurrentView,
    addToast
  } = useApp();

  const exam = ujianList.find(u => u.id === selectedUjianId);
  const examQuestions = exam
    ? exam.jawaban
        .map(j => questions.find(q => q.id === j.question_id))
        .filter((q): q is Question => q !== undefined)
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [doubtfulFlags, setDoubtfulFlags] = useState<Record<number, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [cheatCount, setCheatCount] = useState(0);

  // Remaining time in seconds
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    return exam ? exam.duration_minutes * 60 : 3600;
  });

  const currentQuestion = examQuestions[currentIndex];
  const currentJawaban = exam?.jawaban.find(j => j.question_id === currentQuestion?.id);

  // Auto-timer countdown
  useEffect(() => {
    if (!exam || exam.status === 'finished') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  // Anti-Cheat: Visibility Change & Window Blur Detection (replicates original exam security)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && exam && exam.status !== 'finished') {
        setCheatCount(prev => {
          const next = prev + 1;
          setShowCheatWarning(true);
          if (next >= 3) {
            handleFinalSubmit();
          }
          return next;
        });
      }
    };

    const handleBlur = () => {
      if (exam && exam.status !== 'finished') {
        setCheatCount(prev => {
          const next = prev + 1;
          setShowCheatWarning(true);
          if (next >= 3) {
            handleFinalSubmit();
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [exam]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handlePgSelect = (optionIndex: number) => {
    if (!exam || !currentQuestion) return;
    saveUjianJawaban(exam.id, currentQuestion.id, {
      selected_option: optionIndex,
    });
  };

  const handleBenarSalahSelect = (isBenar: boolean) => {
    if (!exam || !currentQuestion) return;
    saveUjianJawaban(exam.id, currentQuestion.id, {
      selected_option: isBenar ? 1 : 0,
    });
  };

  const handleEssayChange = (text: string) => {
    if (!exam || !currentQuestion) return;
    saveUjianJawaban(exam.id, currentQuestion.id, {
      jawaban: text,
    });
  };

  const handleMatchingChange = (pairId: string, matchedText: string) => {
    if (!exam || !currentQuestion) return;
    const currentMap = (typeof currentJawaban?.jawaban === 'object' && currentJawaban?.jawaban !== null)
      ? (currentJawaban.jawaban as Record<string, string>)
      : {};

    const updated = {
      ...currentMap,
      [pairId]: matchedText,
    };

    saveUjianJawaban(exam.id, currentQuestion.id, {
      jawaban: updated,
    });
  };

  const handleToggleDoubtful = () => {
    setDoubtfulFlags(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleFinalSubmit = () => {
    if (!exam) return;
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    submitUjianCBT(exam.id);
    setSelectedUjianId(exam.id);
    setCurrentView('ujian-hasil');
  };

  if (!exam || examQuestions.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Ujian tidak ditemukan.</p>
        <button
          onClick={() => setCurrentView('ujian-siswa')}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
        >
          Kembali ke Daftar Ujian
        </button>
      </div>
    );
  }

  // Time format helper
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isTimeCritical = secondsLeft < 60;

  // Question Answered check
  const isAnswered = (qId: string) => {
    const ans = exam.jawaban.find(j => j.question_id === qId);
    if (!ans) return false;
    if (ans.selected_option !== null && ans.selected_option !== undefined) return true;
    if (typeof ans.jawaban === 'string' && ans.jawaban.trim().length > 0) return true;
    if (typeof ans.jawaban === 'object' && ans.jawaban !== null && Object.keys(ans.jawaban).length > 0) return true;
    return false;
  };

  const answeredCount = examQuestions.filter(q => isAnswered(q.id)).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 flex flex-col justify-between select-none">
      {/* Top Fixed Control Bar */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm">
            CBT
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
              {exam.title}
            </h2>
            <p className="text-xs text-slate-400">
              Soal No. <b className="text-blue-600">{currentIndex + 1}</b> dari {examQuestions.length} Butir
            </p>
          </div>
        </div>

        {/* Timer & Actions */}
        <div className="flex items-center gap-3">
          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-all ${
              isTimeCritical
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse ring-2 ring-rose-400 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Fullscreen button */}
          <button
            id="btn-cbt-toggle-fullscreen"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Selesai / Submit Button */}
          <button
            id="btn-cbt-submit-exam"
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Kumpulkan Ujian
          </button>
        </div>
      </header>

      {/* Main Content Layout (Question Area + Question Navigator) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
        {/* Left: Question Box & Answers */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between min-h-[500px]">
          <div className="space-y-4">
            {/* Header info for current question */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  Nomor {currentIndex + 1}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                  {currentQuestion?.type.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                  {currentQuestion?.level_c} ({currentQuestion?.level_kognitif})
                </span>
              </div>

              {/* Doubtful / Ragu-ragu button */}
              <button
                id="btn-toggle-ragu"
                onClick={handleToggleDoubtful}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  doubtfulFlags[currentIndex]
                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {doubtfulFlags[currentIndex] ? 'Ditandai Ragu-Ragu' : 'Ragu-Ragu'}
              </button>
            </div>

            {/* Stimulus / Question Text */}
            <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap p-2">
              {currentQuestion?.question_text}
            </div>

            {/* Interactive Answer Input based on type */}
            <div className="pt-2 space-y-3">
              {/* 1. Pilihan Ganda */}
              {currentQuestion?.type === 'pg' && currentQuestion.pg_options && (
                <div className="space-y-2.5">
                  {currentQuestion.pg_options.map((opt, idx) => {
                    const isSelected = currentJawaban?.selected_option === idx;
                    return (
                      <div
                        key={idx}
                        id={`opt-choice-${idx}`}
                        onClick={() => handlePgSelect(idx)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 dark:border-blue-700 text-blue-950 dark:text-blue-100 font-semibold ring-2 ring-blue-400/30'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.label || String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 pt-0.5 leading-snug">{opt.option_text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. Benar / Salah */}
              {currentQuestion?.type === 'benar_salah' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500">Pilihlah salah satu status kebenaran pernyataan:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="btn-answer-benar"
                      type="button"
                      onClick={() => handleBenarSalahSelect(true)}
                      className={`p-4 rounded-2xl font-bold text-sm border transition-all text-center ${
                        currentJawaban?.selected_option === 1
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      BENAR (TRUE)
                    </button>
                    <button
                      id="btn-answer-salah"
                      type="button"
                      onClick={() => handleBenarSalahSelect(false)}
                      className={`p-4 rounded-2xl font-bold text-sm border transition-all text-center ${
                        currentJawaban?.selected_option === 0
                          ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 ring-2 ring-rose-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      SALAH (FALSE)
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Menjodohkan */}
              {currentQuestion?.type === 'menjodohkan' && currentQuestion.matching_pairs && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500">Pasangkan pernyataan premis di kiri dengan opsi di kanan:</p>
                  <div className="space-y-2.5">
                    {currentQuestion.matching_pairs.map((pair, idx) => {
                      const currentSelected = typeof currentJawaban?.jawaban === 'object' && currentJawaban?.jawaban !== null
                        ? (currentJawaban.jawaban as Record<string, string>)[pair.id] || ''
                        : '';

                      return (
                        <div
                          key={pair.id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <span className="font-semibold text-slate-900 dark:text-slate-100 flex-1">
                            {idx + 1}. {pair.left_text}
                          </span>
                          <span className="text-slate-400 font-bold hidden sm:inline">→</span>
                          <select
                            value={currentSelected}
                            onChange={(e) => handleMatchingChange(pair.id, e.target.value)}
                            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 outline-none font-bold text-blue-600 dark:text-blue-400"
                          >
                            <option value="">-- Pilih Pasangan --</option>
                            {currentQuestion.matching_pairs?.map(p => (
                              <option key={p.id} value={p.right_text}>
                                {p.right_text}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Uraian */}
              {currentQuestion?.type === 'uraian' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tuliskan Jawaban Uraian Anda Secara Lengkap:
                  </label>
                  <textarea
                    id="input-answer-uraian"
                    rows={5}
                    value={typeof currentJawaban?.jawaban === 'string' ? currentJawaban.jawaban : ''}
                    onChange={(e) => handleEssayChange(e.target.value)}
                    placeholder="Ketikkan argumen, langkah-langkah, dan jawaban terperinci di sini..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Question Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              id="btn-prev-question"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
            </button>

            <span className="text-xs text-slate-400 font-medium">
              Tersimpan otomatis
            </span>

            <button
              id="btn-next-question"
              disabled={currentIndex === examQuestions.length - 1}
              onClick={() => setCurrentIndex(i => Math.min(examQuestions.length - 1, i + 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-all shadow-xs"
            >
              Soal Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Question Navigation Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Navigasi Soal</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Terjawab: <b>{answeredCount}</b> dari {examQuestions.length}
            </p>
          </div>

          {/* Grid Numbers */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {examQuestions.map((q, idx) => {
              const answered = isAnswered(q.id);
              const isCurrent = currentIndex === idx;
              const isDoubt = doubtfulFlags[idx];

              return (
                <button
                  key={q.id}
                  id={`nav-q-btn-${idx}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${
                    isCurrent
                      ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900'
                      : ''
                  } ${
                    isDoubt
                      ? 'bg-amber-400 text-amber-950 font-extrabold'
                      : answered
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600" />
              <span>Sudah Dijawab</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400" />
              <span>Ragu-Ragu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
              <span>Belum Dijawab</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Submit Confirmation */}
      {showSubmitModal && (
        <div
          id="modal-submit-exam-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Konfirmasi Pengumpulan Ujian</h3>
              <p className="text-xs text-slate-500">
                Anda telah menjawab <b>{answeredCount}</b> dari <b>{examQuestions.length}</b> butir soal.
              </p>
              {answeredCount < examQuestions.length && (
                <p className="text-xs text-amber-600 font-semibold">
                  Peringatan: Masih terdapat {examQuestions.length - answeredCount} butir soal yang belum dijawab!
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                id="btn-confirm-final-submit"
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                Ya, Kumpulkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Warning Modal */}
      {showCheatWarning && (
        <div
          id="modal-anti-cheat-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border-2 border-rose-500 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-rose-600">Peringatan Keamanan CBT!</h3>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Sistem mendeteksi Anda beralih ke aplikasi/tab lain atau keluar dari layar ujian.
              </p>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                Pelanggaran #{cheatCount} dari Maksimal 3 Kali
              </div>
              {cheatCount >= 3 ? (
                <p className="text-xs text-rose-600 font-bold">
                  Batas pelanggaran terlampaui. Ujian akan dikumpulkan secara otomatis!
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Pelanggaran ke-3 akan memaksa sistem mengumpulkan lembar jawaban seketika.
                </p>
              )}
            </div>

            <button
              id="btn-dismiss-cheat-warning"
              onClick={() => setShowCheatWarning(false)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
            >
              Saya Mengerti & Kembali Ujian
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
