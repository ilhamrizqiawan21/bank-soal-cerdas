import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { BloomLevel, Question } from '../types';

export const AnalisisView: React.FC = () => {
  const { questions, subjects, ujianList, kkoList, setCurrentView, setSelectedQuestionId } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== 'all' && q.subject_id !== selectedSubject) return false;
    return true;
  });

  // Calculate Bloom Taxonomy Breakdown
  const bloomCounts: Record<BloomLevel, number> = {
    C1: filteredQuestions.filter(q => q.level_c === 'C1').length,
    C2: filteredQuestions.filter(q => q.level_c === 'C2').length,
    C3: filteredQuestions.filter(q => q.level_c === 'C3').length,
    C4: filteredQuestions.filter(q => q.level_c === 'C4').length,
    C5: filteredQuestions.filter(q => q.level_c === 'C5').length,
    C6: filteredQuestions.filter(q => q.level_c === 'C6').length,
  };

  const totalFiltered = filteredQuestions.length || 1;
  const hotsCount = bloomCounts.C4 + bloomCounts.C5 + bloomCounts.C6;
  const motsCount = bloomCounts.C3;
  const lotsCount = bloomCounts.C1 + bloomCounts.C2;

  const hotsPercentage = Math.round((hotsCount / totalFiltered) * 100);
  const motsPercentage = Math.round((motsCount / totalFiltered) * 100);
  const lotsPercentage = Math.round((lotsCount / totalFiltered) * 100);

  // Compute item analysis from completed exams
  const finishedExams = ujianList.filter(u => u.status === 'finished');

  const questionStats = filteredQuestions.map((q) => {
    // Find all attempts on this question
    const attempts = finishedExams.flatMap(e => e.jawaban.filter(j => j.question_id === q.id));
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.is_correct).length;
    const difficultyIndex = totalAttempts > 0 ? correctAttempts / totalAttempts : 0.65; // Tingkat Kesukaran (P)

    let difficultyLabel = 'Sedang';
    if (difficultyIndex > 0.7) difficultyLabel = 'Mudah';
    else if (difficultyIndex < 0.3) difficultyLabel = 'Sukar';

    return {
      question: q,
      totalAttempts,
      correctAttempts,
      difficultyIndex: Number(difficultyIndex.toFixed(2)),
      difficultyLabel,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Analisis Butir Soal & Taksonomi Bloom
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi psikometrik, proporsi HOTS/LOTS, dan daya serap materi evaluasi
          </p>
        </div>

        {/* Filter Mapel */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none text-slate-800 dark:text-slate-200"
        >
          <option value="all">Semua Mata Pelajaran</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Overview Cards: HOTS vs MOTS vs LOTS Proportion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* HOTS (L3) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              HOTS (Level L3)
            </span>
            <span className="text-xs font-bold text-slate-400">C4, C5, C6</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{hotsPercentage}%</span>
            <span className="text-xs text-slate-500 font-medium">({hotsCount} Soal)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${hotsPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Keterampilan berpikir tingkat tinggi (Analisis, Evaluasi, Kreasi).</p>
        </div>

        {/* MOTS (L2) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              MOTS (Level L2)
            </span>
            <span className="text-xs font-bold text-slate-400">C3</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">{motsPercentage}%</span>
            <span className="text-xs text-slate-500 font-medium">({motsCount} Soal)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${motsPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Keterampilan aplikasi dan penerapan konsep ke masalah nyata.</p>
        </div>

        {/* LOTS (L1) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              LOTS (Level L1)
            </span>
            <span className="text-xs font-bold text-slate-400">C1, C2</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{lotsPercentage}%</span>
            <span className="text-xs text-slate-500 font-medium">({lotsCount} Soal)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${lotsPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Keterampilan mengingat informasi faktual dan pemahaman konsep dasar.</p>
        </div>
      </div>

      {/* Bloom Cognitive Breakdown Chart Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-600" />
          Distribusi Taksonomi Bloom (C1 - C6)
        </h3>

        <div className="space-y-3">
          {[
            { level: 'C1', title: 'Mengingat (Remembering)', count: bloomCounts.C1, color: 'bg-emerald-500' },
            { level: 'C2', title: 'Memahami (Understanding)', count: bloomCounts.C2, color: 'bg-teal-500' },
            { level: 'C3', title: 'Menerapkan (Applying)', count: bloomCounts.C3, color: 'bg-blue-500' },
            { level: 'C4', title: 'Menganalisis (Analyzing)', count: bloomCounts.C4, color: 'bg-indigo-500' },
            { level: 'C5', title: 'Mengevaluasi (Evaluating)', count: bloomCounts.C5, color: 'bg-amber-500' },
            { level: 'C6', title: 'Menciptakan (Creating)', count: bloomCounts.C6, color: 'bg-rose-500' },
          ].map((item) => {
            const pct = Math.round((item.count / totalFiltered) * 100);

            return (
              <div key={item.level} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                  <span>
                    <b className="text-slate-900 dark:text-white mr-1.5">{item.level}:</b> {item.title}
                  </span>
                  <span>{item.count} Soal ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Analysis Table (Tingkat Kesukaran & Rekomendasi) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-2">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tabel Analisis Kualitas Butir Soal (Psikometrik)
          </h3>
          <span className="text-xs text-slate-400">Total {questionStats.length} Butir Soal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Butir Soal</th>
                <th className="p-3.5">Taksonomi</th>
                <th className="p-3.5">Indeks Kesukaran (P)</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Rekomendasi Ahli</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {questionStats.map(({ question, difficultyIndex, difficultyLabel }, idx) => (
                <tr key={question.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 max-w-xs font-semibold text-slate-900 dark:text-slate-100">
                    <p className="line-clamp-2">{question.question_text}</p>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                      {question.level_c}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {difficultyIndex}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        difficultyLabel === 'Mudah'
                          ? 'bg-emerald-100 text-emerald-800'
                          : difficultyLabel === 'Sedang'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {difficultyLabel}
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-600 dark:text-slate-400">
                    {difficultyLabel === 'Sedang' ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Butir Soal Sangat Baik
                      </span>
                    ) : difficultyLabel === 'Mudah' ? (
                      <span>Tingkatkan kompleksitas stimulus atau opsi pengecoh</span>
                    ) : (
                      <span>Periksa kejelasan bahasa & telaah kunci jawaban</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedQuestionId(question.id);
                        setCurrentView('questions');
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Lihat Soal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
