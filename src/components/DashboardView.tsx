import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  BookOpen,
  Layers,
  BarChart3,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  PlusCircle,
  FileCheck2,
  CheckCircle2,
  Clock,
  ClipboardCheck
} from 'lucide-react';
import { BloomLevel, Question } from '../types';
import { ChartCanvas } from './charts/ChartCanvas';

const usersCountFromExams = (exams: { siswa_id: string }[]) => new Set(exams.map(exam => exam.siswa_id)).size;

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    questions,
    subjects,
    paketSoalList,
    ujianList,
    setCurrentView,
    setSelectedQuestionId,
    setSelectedUjianId,
    dashboardData,
  } = useApp();

  const isStudent = currentUser.role === 'siswa';

  // Stats calculation
  const totalSoal = dashboardData?.summary.total_soal ?? questions.length;
  const totalPaket = dashboardData?.summary.total_paket ?? paketSoalList.length;
  const totalUjian = dashboardData?.summary.total_ujian ?? ujianList.length;
  const totalSiswa = dashboardData?.summary.total_siswa ?? usersCountFromExams(ujianList);
  const merdekaCount = dashboardData?.summary.merdeka_count ?? questions.filter(q => q.curriculum === 'merdeka').length;
  const kbcCount = dashboardData?.summary.kbc_count ?? questions.filter(q => q.curriculum === 'kbc').length;
  const hotsCount = dashboardData?.summary.hots_count ?? questions.filter(q => ['C4', 'C5', 'C6'].includes(q.level_c)).length;
  const hotsPercentage = totalSoal > 0 ? Math.round((hotsCount / totalSoal) * 100) : 0;

  // Taksonomi Bloom breakdown
  const bloomLevels: BloomLevel[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  const bloomLabels: Record<BloomLevel, { name: string; type: string; color: string }> = {
    C1: { name: 'Mengingat', type: 'LOTS (L1)', color: 'bg-sky-500 text-white' },
    C2: { name: 'Memahami', type: 'LOTS (L1)', color: 'bg-emerald-500 text-white' },
    C3: { name: 'Menerapkan', type: 'MOTS (L2)', color: 'bg-indigo-500 text-white' },
    C4: { name: 'Menganalisis', type: 'HOTS (L3)', color: 'bg-amber-500 text-white' },
    C5: { name: 'Mengevaluasi', type: 'HOTS (L3)', color: 'bg-orange-500 text-white' },
    C6: { name: 'Menciptakan', type: 'HOTS (L3)', color: 'bg-rose-500 text-white' },
  };

  const getBloomCount = (level: BloomLevel) => {
    const serverLevel = dashboardData?.level_distribution;
    if (serverLevel && ['C4', 'C5', 'C6'].includes(level)) return serverLevel.L3 ?? serverLevel[level] ?? 0;
    if (serverLevel && level === 'C3') return serverLevel.L2 ?? serverLevel[level] ?? 0;
    if (serverLevel && ['C1', 'C2'].includes(level)) return serverLevel.L1 ?? serverLevel[level] ?? 0;
    return questions.filter(q => q.level_c === level).length;
  };

  // Chart.js visualizations (teacher/admin only).
  const bloomChartConfig = useMemo(
    () => ({
      type: 'bar' as const,
      data: {
        labels: bloomLevels,
        datasets: [
          {
            label: 'Jumlah soal',
            data: bloomLevels.map(lvl => getBloomCount(lvl)),
            backgroundColor: ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#f97316', '#f43f5e'],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(148,163,184,0.2)' } },
          x: { grid: { display: false } },
        },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions]
  );

  const curriculumChartConfig = useMemo(
    () => ({
      type: 'doughnut' as const,
      data: {
        labels: ['Kurikulum Merdeka', 'Kurikulum KBC'],
        datasets: [
          {
            data: [merdekaCount, kbcCount],
            backgroundColor: ['#2563eb', '#14b8a6'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: { legend: { position: 'bottom' as const } },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions]
  );

  // Recent questions
  const recentQuestions = dashboardData?.recent_questions?.length
    ? dashboardData.recent_questions
    : [...questions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const recentUjian = dashboardData?.recent_ujian?.length ? dashboardData.recent_ujian : ujianList.slice(0, 4);

  // Student specific stats
  const studentExams = ujianList.filter(u => u.siswa_id === currentUser.id);
  const activeStudentExams = dashboardData?.active_ujian?.length ? dashboardData.active_ujian : studentExams.filter(u => u.status === 'active');
  const finishedStudentExams = studentExams.filter(u => u.status === 'finished');
  const averageScore = dashboardData?.summary.average_score ?? (finishedStudentExams.length > 0
    ? Math.round(finishedStudentExams.reduce((sum, e) => sum + (e.total_score || 0), 0) / finishedStudentExams.length)
    : 0);
  const finishedStudentTotal = dashboardData?.summary.finished_ujian ?? finishedStudentExams.length;
  const studentExamTotal = dashboardData?.summary.total_ujian ?? studentExams.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 md:p-8 text-white shadow-lg shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Bank Soal & CBT Cerdas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.name}!
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            {isStudent
              ? 'Akses ujian berbasis komputer (CBT), kerjakan latihan soal terstandarisasi, dan pantau hasil evaluasi belajarmu secara real-time.'
              : 'Kelola butir soal terstandarisasi Taksonomi Bloom, rancang paket asesmen HOTS/LOTS, dan evaluasi hasil belajar siswa dengan analisis butir instan.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isStudent ? (
              <button
                id="btn-dash-cbt-siswa"
                onClick={() => setCurrentView('ujian-siswa')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold bg-white text-blue-800 hover:bg-blue-50 rounded-xl shadow-md transition-all active:scale-95"
              >
                <GraduationCap className="w-4 h-4" />
                Lihat Daftar Ujian CBT ({activeStudentExams.length} Aktif)
              </button>
            ) : (
              <>
                <button
                  id="btn-dash-create-question"
                  onClick={() => setCurrentView('questions-create')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold bg-white text-blue-800 hover:bg-blue-50 rounded-xl shadow-md transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  Buat Soal Baru
                </button>
                <button
                  id="btn-dash-paket"
                  onClick={() => setCurrentView('paket-soal')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium bg-blue-800/60 hover:bg-blue-800/80 border border-blue-400/30 text-white rounded-xl backdrop-blur-md transition-all"
                >
                  <Layers className="w-4 h-4" />
                  Kelola Paket Soal
                </button>
              </>
            )}
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 -bottom-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main KPI Stats Grid */}
      {isStudent ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Ujian Terjadwal</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{studentExamTotal}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ujian Selesai</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{finishedStudentTotal}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-Rata Nilai</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{averageScore} / 100</h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Butir Soal</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalSoal}</h3>
              <p className="text-[11px] text-slate-500">{subjects.length} Mata Pelajaran</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paket Soal</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalPaket}</h3>
              <p className="text-[11px] text-emerald-600 font-medium">{hotsPercentage}% soal HOTS</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Ujian</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalUjian}</h3>
              <p className="text-[11px] text-indigo-600 font-medium">{dashboardData?.status_distribution?.active ?? ujianList.filter(u => u.status === 'active').length} aktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Siswa Aktif</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalSiswa}</h3>
              <p className="text-[11px] text-amber-600 font-medium">Peserta tersedia</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Taksonomi Bloom Cognitive Distribution */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-600" />
              Distribusi Taksonomi Bloom (C1 - C6)
            </h3>
            <p className="text-xs text-slate-500">
              Pemetaan tingkat kognitif dan Kata Kerja Operasional (KKO) pada seluruh butir soal
            </p>
          </div>
          <button
            id="btn-dash-all-questions"
            onClick={() => setCurrentView('questions')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Lihat Semua Soal <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {bloomLevels.map((lvl) => {
            const count = getBloomCount(lvl);
            const percent = totalSoal > 0 ? Math.round((count / totalSoal) * 100) : 0;
            const meta = bloomLabels[lvl];

            return (
              <div
                key={lvl}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${meta.color}`}>
                    {lvl}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{percent}%</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{meta.name}</p>
                  <p className="text-[10px] text-slate-400">{meta.type}</p>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">{count}</span>
                  <span className="text-[11px] text-slate-400">soal</span>
                </div>
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart.js visualizations */}
      {!isStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Sebaran Tingkat Kognitif (C1-C6)</h3>
            <div style={{ height: 260 }}>
              <ChartCanvas config={bloomChartConfig} ariaLabel="Diagram batang sebaran soal per tingkat Taksonomi Bloom" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Komposisi Kurikulum</h3>
            <div style={{ height: 260 }}>
              <ChartCanvas config={curriculumChartConfig} ariaLabel="Diagram donat komposisi soal per kurikulum" />
            </div>
          </div>
        </div>
      )}

      {/* Grid: Recent Questions & Active Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Questions Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              Butir Soal Terbaru
            </h3>
            <button
              id="btn-dash-manage-questions"
              onClick={() => setCurrentView('questions')}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Kelola Bank Soal
            </button>
          </div>

          <div className="space-y-3">
            {recentQuestions.map((q) => {
              const subj = subjects.find(s => s.id === q.subject_id);
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestionId(q.id);
                    setCurrentView('questions');
                  }}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-900 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/30 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {subj?.code || 'MAPEL'}
                    </span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {q.level_c} ({q.level_kognitif})
                    </span>
                    <span className="text-slate-400 text-[11px] ml-auto">
                      Jenjang: {q.jenjang} | Kurikulum {q.curriculum.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                    {q.question_text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Activity & CBT Status Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                Status CBT & Ujian
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Pantauan jadwal ujian berbasis komputer</p>
            </div>

            <div className="space-y-2.5">
              {recentUjian.slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                      {u.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : u.status === 'finished'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {u.duration_minutes} Menit
                    </span>
                    {u.status === 'finished' ? (
                      <span className="font-bold text-emerald-600">Nilai: {u.total_score}</span>
                    ) : (
                      <span>Token: {u.token_ujian || '-'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            id="btn-dash-all-ujian"
            onClick={() => setCurrentView(isStudent ? 'ujian-siswa' : 'ujian')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            {isStudent ? 'Buka Ruang Ujian CBT' : 'Kelola Seluruh Jadwal Ujian'}
          </button>
        </div>
      </div>
    </div>
  );
};
