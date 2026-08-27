import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  Printer,
  Sparkles,
  BookOpen,
  Check,
  X,
  BrainCircuit
} from 'lucide-react';
import { Question } from '../types';

export const UjianHasilView: React.FC = () => {
  const {
    ujianList,
    questions,
    users,
    selectedUjianId,
    currentUser,
    setCurrentView
  } = useApp();

  const exam = ujianList.find(u => u.id === selectedUjianId);
  const student = users.find(u => u.id === exam?.siswa_id);

  if (!exam) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Hasil ujian tidak ditemukan.</p>
        <button
          onClick={() => setCurrentView('ujian')}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
        >
          Kembali
        </button>
      </div>
    );
  }

  const examQuestions = exam.jawaban
    .map(j => ({
      jawabanItem: j,
      question: questions.find(q => q.id === j.question_id),
    }))
    .filter((item): item is { jawabanItem: typeof item.jawabanItem; question: Question } => item.question !== undefined);

  const percentage = Math.round(((exam.total_score || 0) / (exam.max_score || 100)) * 100) || 0;
  const isPassed = percentage >= 75;
  const canShowAnswerKey = currentUser.role !== 'siswa' || exam.status === 'finished';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between print:hidden">
        <button
          id="btn-back-from-hasil"
          onClick={() => setCurrentView('ujian')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <button
          id="btn-print-hasil"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs hover:bg-slate-50 transition-all"
        >
          <Printer className="w-4 h-4 text-blue-600" /> Cetak Lembar Hasil
        </button>
      </div>

      {/* Score Card Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto ring-8 ring-blue-50/50 dark:ring-blue-950/20">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hasil Evaluasi CBT
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {exam.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Peserta: <b>{student?.name}</b> (NISN: {student?.nip_nisn || '-'})
          </p>
        </div>

        {/* Score & Badge */}
        <div className="py-4 border-y border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-8">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
              {exam.total_score}
              <span className="text-lg font-bold text-slate-400"> / {exam.max_score || 100}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Nilai Akhir</span>
          </div>

          <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100">
              {percentage}%
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Persentase Capaian</span>
          </div>

          <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase ${
                isPassed
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {isPassed ? 'LULUS / TERCAPAI' : 'BELUM TERCAPAI'}
            </div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase mt-1">
              Kriteria Kelulusan
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Diselesaikan pada:{' '}
            {exam.submitted_at ? new Date(exam.submitted_at).toLocaleString('id-ID') : '-'}
          </span>
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          {canShowAnswerKey ? 'Telaah Jawaban & Pembahasan Soal' : 'Ringkasan Jawaban'}
        </h3>

        <div className="space-y-4">
          {examQuestions.map(({ question, jawabanItem }, idx) => {
            const isCorrect = jawabanItem.is_correct;

            return (
              <div
                key={question.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      Soal #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                      {question.level_c} ({question.level_kognitif})
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                      {question.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Benar (+{jawabanItem.score_earned} Poin)
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 stroke-[3]" /> Salah (0 Poin)
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Stimulus & Question */}
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {question.question_text}
                </p>

                {/* Answer Detail Breakdown */}
                {question.type === 'pg' && question.pg_options && (
                  <div className="space-y-2 text-xs">
                    {question.pg_options.map((opt, oIdx) => {
                      const isChosen = jawabanItem.selected_option_id
                        ? jawabanItem.selected_option_id === opt.id
                        : jawabanItem.selected_option === oIdx;
                      const isRealKey = canShowAnswerKey && opt.is_correct;

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isRealKey
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : isChosen && !isRealKey
                              ? 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{opt.label}.</span>
                            <span>{opt.option_text}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isChosen && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900">
                                Jawaban Anda
                              </span>
                            )}
                            {isRealKey && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                                Kunci Benar
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Benar/Salah answer review */}
                {question.type === 'benar_salah' && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <p>
                      Jawaban Anda:{' '}
                      <b className="uppercase">{jawabanItem.selected_option === 1 ? 'Benar' : 'Salah'}</b>
                    </p>
                    {canShowAnswerKey && (
                      <p className="text-emerald-600 font-bold">
                        Kunci Jawaban:{' '}
                        <b className="uppercase">{question.correct_boolean ? 'Benar' : 'Salah'}</b>
                      </p>
                    )}
                  </div>
                )}

                {/* Uraian review */}
                {question.type === 'uraian' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-500 block mb-1">Jawaban Tertulis Siswa:</span>
                      <p className="font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {typeof jawabanItem.jawaban === 'string' ? jawabanItem.jawaban : '-'}
                      </p>
                    </div>
                    {canShowAnswerKey && question.essay_rubric && (
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                        <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                          Rubrik Penilaian:
                        </span>
                        <p className="text-blue-800 dark:text-blue-200">
                          {question.essay_rubric.rubric_text}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Box */}
                {canShowAnswerKey && question.explanation && (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5" /> Pembahasan / Catatan Analisis:
                    </span>
                    <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
