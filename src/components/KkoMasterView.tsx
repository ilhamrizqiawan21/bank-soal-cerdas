import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BrainCircuit,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { BloomLevel, KkoMaster } from '../types';

export const KkoMasterView: React.FC = () => {
  const { kkoList, setCurrentView } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filteredKko = kkoList.filter((k) => {
    if (levelFilter !== 'all' && k.bloom_level !== levelFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchVerb = k.verb.toLowerCase().includes(q);
      const matchDesc = k.description.toLowerCase().includes(q);
      if (!matchVerb && !matchDesc) return false;
    }
    return true;
  });

  const bloomSections: { level: BloomLevel; name: string; tag: string; color: string }[] = [
    { level: 'C1', name: 'Mengingat (Remembering)', tag: 'LOTS - L1', color: 'border-emerald-500 text-emerald-700 dark:text-emerald-300' },
    { level: 'C2', name: 'Memahami (Understanding)', tag: 'LOTS - L1', color: 'border-teal-500 text-teal-700 dark:text-teal-300' },
    { level: 'C3', name: 'Menerapkan (Applying)', tag: 'MOTS - L2', color: 'border-blue-500 text-blue-700 dark:text-blue-300' },
    { level: 'C4', name: 'Menganalisis (Analyzing)', tag: 'HOTS - L3', color: 'border-indigo-500 text-indigo-700 dark:text-indigo-300' },
    { level: 'C5', name: 'Mengevaluasi (Evaluating)', tag: 'HOTS - L3', color: 'border-amber-500 text-amber-700 dark:text-amber-300' },
    { level: 'C6', name: 'Menciptakan (Creating)', tag: 'HOTS - L3', color: 'border-rose-500 text-rose-700 dark:text-rose-300' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            Matriks Kata Kerja Operasional (KKO Bloom)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kamus referensi perumusan indikator soal dan capaian pembelajaran terstandarisasi
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="kko-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kata kerja operasional (e.g. menganalisis, membedakan, menyimpulkan)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none text-slate-700 dark:text-slate-200"
        >
          <option value="all">Semua Level Bloom (C1 - C6)</option>
          <option value="C1">C1 - Mengingat</option>
          <option value="C2">C2 - Memahami</option>
          <option value="C3">C3 - Menerapkan</option>
          <option value="C4">C4 - Menganalisis (HOTS)</option>
          <option value="C5">C5 - Mengevaluasi (HOTS)</option>
          <option value="C6">C6 - Menciptakan (HOTS)</option>
        </select>
      </div>

      {/* Section by Section Bloom View */}
      <div className="space-y-6">
        {bloomSections.map((sec) => {
          const list = filteredKko.filter(k => k.bloom_level === sec.level);
          if (list.length === 0 && levelFilter !== 'all' && levelFilter !== sec.level) return null;

          return (
            <div
              key={sec.level}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300`}>
                    Level {sec.level}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {sec.name}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {sec.tag}
                </span>
              </div>

              {list.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Tidak ada KKO yang cocok dalam level ini.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((kko) => (
                    <div
                      key={kko.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 transition-colors space-y-1"
                    >
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 capitalize">
                        {kko.verb}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {kko.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
