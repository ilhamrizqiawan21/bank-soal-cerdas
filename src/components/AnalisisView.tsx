import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Users,
  Layers,
  FileText,
  Activity,
  X
} from 'lucide-react';
import { AnalisisSiswaDetail, AnalisisUjianDetail, BloomLevel, Question } from '../types';
import { apiErrorMessage, isBootstrapped } from '../lib/api';
import { analisisApi } from '../lib/domainApi';

export const AnalisisView: React.FC = () => {
  const {
    questions,
    subjects,
    ujianList,
    analisisData,
    selectedUjianId,
    selectedStudentId,
    setCurrentView,
    setSelectedQuestionId,
    setSelectedUjianId,
    setSelectedStudentId,
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [ujianDetail, setUjianDetail] = useState<AnalisisUjianDetail | null>(null);
  const [siswaDetail, setSiswaDetail] = useState<AnalisisSiswaDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const productionMode = isBootstrapped();

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== 'all' && q.subject_id !== selectedSubject) return false;
    return true;
  });

  const serverLevelDistribution = analisisData?.level_distribution;
  const bloomCounts: Record<BloomLevel, number> = productionMode && serverLevelDistribution
    ? {
        C1: serverLevelDistribution.C1 ?? 0,
        C2: serverLevelDistribution.C2 ?? 0,
        C3: serverLevelDistribution.C3 ?? 0,
        C4: serverLevelDistribution.C4 ?? 0,
        C5: serverLevelDistribution.C5 ?? 0,
        C6: serverLevelDistribution.C6 ?? 0,
      }
    : {
        C1: filteredQuestions.filter(q => q.level_c === 'C1').length,
        C2: filteredQuestions.filter(q => q.level_c === 'C2').length,
        C3: filteredQuestions.filter(q => q.level_c === 'C3').length,
        C4: filteredQuestions.filter(q => q.level_c === 'C4').length,
        C5: filteredQuestions.filter(q => q.level_c === 'C5').length,
        C6: filteredQuestions.filter(q => q.level_c === 'C6').length,
      };

  const totalFiltered = productionMode
    ? Math.max(analisisData?.summary.total_soal ?? 0, 1)
    : filteredQuestions.length || 1;
  const hotsCount = bloomCounts.C4 + bloomCounts.C5 + bloomCounts.C6;
  const motsCount = bloomCounts.C3;
  const lotsCount = bloomCounts.C1 + bloomCounts.C2;

  const hotsPercentage = Math.round((hotsCount / totalFiltered) * 100);
  const motsPercentage = Math.round((motsCount / totalFiltered) * 100);
  const lotsPercentage = Math.round((lotsCount / totalFiltered) * 100);

  const summary = analisisData?.summary;
  const statusDistribution = analisisData?.status_distribution;
  const recentUjian = analisisData?.recent_ujian?.length ? analisisData.recent_ujian : ujianList.slice(0, 5);
  const topSiswa = analisisData?.top_siswa ?? [];

  React.useEffect(() => {
    if (!productionMode || (!selectedUjianId && !selectedStudentId)) return;

    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);

    const request = selectedUjianId
      ? analisisApi.ujian(selectedUjianId).then(result => {
          if (!cancelled) {
            setUjianDetail(result);
            setSiswaDetail(null);
          }
        })
      : analisisApi.siswa(selectedStudentId as string).then(result => {
          if (!cancelled) {
            setSiswaDetail(result);
            setUjianDetail(null);
          }
        });

    request
      .catch(error => {
        if (!cancelled) setDetailError(apiErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productionMode, selectedUjianId, selectedStudentId]);

  const closeDetail = () => {
    setSelectedUjianId(null);
    setSelectedStudentId(null);
    setUjianDetail(null);
    setSiswaDetail(null);
    setDetailError(null);
  };

  const questionStats = useMemo(() => {
    const finishedExams = ujianList.filter(u => u.status === 'finished');

    return filteredQuestions.map((q) => {
      const attempts = finishedExams.flatMap(e => e.jawaban.filter(j => j.question_id === q.id));
      const totalAttempts = attempts.length;
      const correctAttempts = attempts.filter(a => a.is_correct).length;
      const difficultyIndex = totalAttempts > 0 ? correctAttempts / totalAttempts : 0.65;

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
  }, [filteredQuestions, ujianList]);

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

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={productionMode}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none text-slate-800 dark:text-slate-200"
            title={productionMode ? 'Filter mapel analisis menunggu endpoint backend khusus.' : 'Filter mata pelajaran'}
          >
            <option value="all">Semua Mata Pelajaran</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { window.location.href = analisisApi.exportUrl; }}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <FileText className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: 'Total Ujian', value: summary?.total_ujian ?? ujianList.length, icon: Activity, color: 'text-blue-600' },
          { label: 'Total Siswa', value: summary?.total_siswa ?? 0, icon: Users, color: 'text-emerald-600' },
          { label: 'Total Soal', value: summary?.total_soal ?? filteredQuestions.length, icon: BrainCircuit, color: 'text-purple-600' },
          { label: 'Total Paket', value: summary?.total_paket ?? 0, icon: Layers, color: 'text-indigo-600' },
          { label: 'Rata-rata Nilai', value: summary?.avg_score ?? 0, icon: TrendingUp, color: 'text-amber-600' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Distribusi Status Ujian
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {(['draft', 'active', 'finished', 'expired'] as const).map(status => (
              <div key={status} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-500 uppercase">{status}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{statusDistribution?.[status] ?? ujianList.filter(u => u.status === status).length}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Siswa Teratas
          </h3>
          {topSiswa.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada ujian selesai untuk dirangking.</p>
          ) : (
            <div className="space-y-2">
              {topSiswa.map(item => (
                <button
                  key={String(item.siswa_id)}
                  type="button"
                  onClick={() => {
                    setSelectedUjianId(null);
                    setSelectedStudentId(String(item.siswa_id));
                    setCurrentView('analisis');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left"
                >
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.siswa?.name || `Siswa #${item.siswa_id}`}</span>
                  <span className="text-xs font-black text-emerald-600">{Number(item.avg_score).toFixed(1)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Ujian Terbaru
          </h3>
          <span className="text-xs text-slate-400">{recentUjian.length} data</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentUjian.length === 0 ? (
            <p className="p-5 text-xs text-slate-500">Belum ada data ujian.</p>
          ) : recentUjian.map(ujian => (
            <button
              key={ujian.id}
              type="button"
              onClick={() => {
                setSelectedStudentId(null);
                setSelectedUjianId(ujian.id);
                setCurrentView('analisis');
              }}
              className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{ujian.title}</p>
                <p className="text-xs text-slate-500">{ujian.paket_soal?.name || 'Paket soal'} • {ujian.siswa?.name || 'Siswa'}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                {ujian.status}
              </span>
            </button>
          ))}
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

      {(selectedUjianId || selectedStudentId || ujianDetail || siswaDetail || detailLoading || detailError) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedUjianId ? 'Detail Analisis Ujian' : 'Detail Analisis Siswa'}
            </h3>
            <button
              type="button"
              onClick={closeDetail}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Tutup panel detail analisis"
              title="Tutup detail"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {detailLoading ? (
            <div className="p-5 space-y-3">
              <div className="h-5 w-1/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ) : detailError ? (
            <div className="p-5 text-sm text-rose-600 dark:text-rose-300 font-semibold">
              {detailError}
            </div>
          ) : ujianDetail ? (
            <div className="p-5 space-y-4">
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">{ujianDetail.ujian.title}</p>
                <p className="text-xs text-slate-500">{ujianDetail.ujian.paket_soal?.name || 'Paket soal'} • {ujianDetail.ujian.siswa?.name || 'Siswa'}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="p-3">Butir</th>
                      <th className="p-3">Percobaan</th>
                      <th className="p-3">Benar</th>
                      <th className="p-3">Salah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ujianDetail.soal_stats.map((stat, index) => (
                      <tr key={stat.question?.id || index}>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                          <p className="line-clamp-2">{stat.question?.question_text || `Soal #${index + 1}`}</p>
                        </td>
                        <td className="p-3">{stat.total}</td>
                        <td className="p-3 text-emerald-600 font-bold">{stat.correct}</td>
                        <td className="p-3 text-rose-600 font-bold">{stat.wrong}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : siswaDetail ? (
            <div className="p-5 space-y-4">
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">{siswaDetail.siswa.name}</p>
                <p className="text-xs text-slate-500">{siswaDetail.siswa.email}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                {[
                  ['Total Ujian', siswaDetail.stats.total_ujian],
                  ['Selesai', siswaDetail.stats.total_ujian_selesai],
                  ['Rata-rata', siswaDetail.stats.rata_rata_nilai],
                  ['Tertinggi', siswaDetail.stats.nilai_tertinggi],
                  ['Terendah', siswaDetail.stats.nilai_terendah],
                ].map(([label, value]) => (
                  <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <p className="font-bold text-slate-400 uppercase">{label}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{value}</p>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                {siswaDetail.riwayat_ujian.map(ujian => (
                  <div key={ujian.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{ujian.title}</p>
                      <p className="text-slate-500">{ujian.paket_soal?.name || 'Paket soal'}</p>
                    </div>
                    <span className="font-black text-blue-600">{ujian.total_score ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

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
