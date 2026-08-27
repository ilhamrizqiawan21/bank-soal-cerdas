import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BrainCircuit,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  Tag as TagIcon
} from 'lucide-react';
import {
  BloomLevel,
  Curriculum,
  Jenjang,
  LevelKognitif,
  MatchingPair,
  PgOption,
  Question,
  QuestionType
} from '../types';

interface QuestionFormViewProps {
  isEditing?: boolean;
}

export const QuestionFormView: React.FC<QuestionFormViewProps> = ({ isEditing }) => {
  const {
    questions,
    subjects,
    kkoList,
    categories,
    tags,
    addQuestion,
    updateQuestion,
    selectedQuestionId,
    setCurrentView,
    addToast
  } = useApp();

  const existingQuestion = isEditing ? questions.find(q => q.id === selectedQuestionId) : null;

  // Form states
  const [subjectId, setSubjectId] = useState<string>(existingQuestion?.subject_id || subjects[0]?.id || 'subj-1');
  const [jenjang, setJenjang] = useState<Jenjang>(existingQuestion?.jenjang || 'SMP');
  const [curriculum, setCurriculum] = useState<Curriculum>(existingQuestion?.curriculum || 'merdeka');
  const [type, setType] = useState<QuestionType>(existingQuestion?.type || 'pg');
  const [levelC, setLevelC] = useState<BloomLevel>(existingQuestion?.level_c || 'C2');
  const [levelKognitif, setLevelKognitif] = useState<LevelKognitif>(existingQuestion?.level_kognitif || 'L1');
  const [kkoId, setKkoId] = useState<string>(existingQuestion?.kko_id || 'kko-c2-1');
  const [selectedKategoriIds, setSelectedKategoriIds] = useState<string[]>(existingQuestion?.kategori_ids || [categories[0]?.id || 'kat-1']);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(existingQuestion?.tag_ids || []);
  
  const [questionText, setQuestionText] = useState(existingQuestion?.question_text || '');
  const [indicatorText, setIndicatorText] = useState(existingQuestion?.indicator_text || '');
  const [explanation, setExplanation] = useState(existingQuestion?.explanation || '');

  // Specific state for PG
  const [pgOptions, setPgOptions] = useState<PgOption[]>(
    existingQuestion?.pg_options || [
      { id: '1', label: 'A', option_text: '', is_correct: true },
      { id: '2', label: 'B', option_text: '', is_correct: false },
      { id: '3', label: 'C', option_text: '', is_correct: false },
      { id: '4', label: 'D', option_text: '', is_correct: false },
    ]
  );

  // Specific state for Benar/Salah
  const [correctBoolean, setCorrectBoolean] = useState<boolean>(existingQuestion?.correct_boolean ?? true);

  // Specific state for Menjodohkan
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(
    existingQuestion?.matching_pairs || [
      { id: 'mp-1', pair_order: 1, left_text: '', right_text: '' },
      { id: 'mp-2', pair_order: 2, left_text: '', right_text: '' },
    ]
  );

  // Specific state for Uraian
  const [rubricText, setRubricText] = useState(existingQuestion?.essay_rubric?.rubric_text || '');
  const [maxScore, setMaxScore] = useState<number>(existingQuestion?.essay_rubric?.max_score || 10);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-sync cognitive level and KKO when Bloom Level changes
  const handleBloomChange = (newLevel: BloomLevel) => {
    setLevelC(newLevel);
    const newKognitif: LevelKognitif = ['C4', 'C5', 'C6'].includes(newLevel)
      ? 'L3'
      : newLevel === 'C3'
      ? 'L2'
      : 'L1';
    setLevelKognitif(newKognitif);

    // Pick first matching KKO
    const matchingKko = kkoList.find(k => k.bloom_level === newLevel);
    if (matchingKko) {
      setKkoId(matchingKko.id);
    }
  };

  const handlePgTextChange = (index: number, text: string) => {
    setPgOptions(prev => prev.map((opt, i) => (i === index ? { ...opt, option_text: text } : opt)));
  };

  const handleSetPgCorrect = (index: number) => {
    setPgOptions(prev => prev.map((opt, i) => ({ ...opt, is_correct: i === index })));
  };

  const handleAddPgOption = () => {
    if (pgOptions.length >= 5) return;
    const nextLabel = String.fromCharCode(65 + pgOptions.length);
    setPgOptions(prev => [...prev, { id: `opt-${Date.now()}`, label: nextLabel, option_text: '', is_correct: false }]);
  };

  const handleRemovePgOption = (index: number) => {
    if (pgOptions.length <= 2) return;
    setPgOptions(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((opt, i) => ({
        ...opt,
        label: String.fromCharCode(65 + i),
        is_correct: i === 0 && !filtered.some(o => o.is_correct) ? true : opt.is_correct,
      }));
    });
  };

  const handleAddMatchingPair = () => {
    setMatchingPairs(prev => [
      ...prev,
      { id: `mp-${Date.now()}`, pair_order: prev.length + 1, left_text: '', right_text: '' },
    ]);
  };

  const handleRemoveMatchingPair = (index: number) => {
    if (matchingPairs.length <= 1) return;
    setMatchingPairs(prev => prev.filter((_, i) => i !== index));
  };

  const handleMatchingPairChange = (index: number, field: 'left_text' | 'right_text', val: string) => {
    setMatchingPairs(prev =>
      prev.map((p, i) => (i === index ? { ...p, [field]: val } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      addToast('Teks pertanyaan tidak boleh kosong!', 'warning');
      return;
    }

    if (type === 'pg') {
      const emptyOpt = pgOptions.some(o => !o.option_text.trim());
      if (emptyOpt) {
        addToast('Semua opsi pilihan ganda harus diisi!', 'warning');
        return;
      }
      const hasCorrect = pgOptions.some(o => o.is_correct);
      if (!hasCorrect) {
        addToast('Pilih salah satu opsi sebagai kunci jawaban benar!', 'warning');
        return;
      }
    }

    if (type === 'menjodohkan') {
      const emptyPair = matchingPairs.some(p => !p.left_text.trim() || !p.right_text.trim());
      if (emptyPair) {
        addToast('Semua pasangan kolom kiri dan kanan harus diisi!', 'warning');
        return;
      }
    }

    const payload: Omit<Question, 'id' | 'created_at' | 'created_by'> = {
      subject_id: subjectId,
      jenjang,
      curriculum,
      type,
      level_c: levelC,
      level_kognitif: levelKognitif,
      kko_id: kkoId,
      kategori_ids: selectedKategoriIds.length > 0 ? selectedKategoriIds : undefined,
      tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      question_text: questionText,
      indicator_text: indicatorText || undefined,
      explanation: explanation || undefined,
      pg_options: type === 'pg' ? pgOptions : undefined,
      correct_boolean: type === 'benar_salah' ? correctBoolean : undefined,
      matching_pairs: type === 'menjodohkan' ? matchingPairs : undefined,
      essay_rubric: type === 'uraian' ? { rubric_text: rubricText, max_score: maxScore } : undefined,
    };

    setIsSaving(true);
    try {
      if (isEditing && existingQuestion) {
        await updateQuestion(existingQuestion.id, payload);
      } else {
        await addQuestion(payload);
      }

      setCurrentView('questions');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const availableKkos = kkoList.filter(k => k.bloom_level === levelC);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-questions"
          onClick={() => setCurrentView('questions')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Bank Soal
        </button>
        <div className="text-right">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full">
            {isEditing ? 'Mode Edit Soal' : 'Pembuatan Soal Baru'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Klasifikasi & Taksonomi Bloom */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-blue-600" />
              1. Klasifikasi Mapel & Taksonomi Bloom
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
              Level {levelC} • {levelKognitif}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Subject */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mata Pelajaran <span className="text-rose-500">*</span>
              </label>
              <select
                id="input-question-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            {/* Jenjang */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jenjang Pendidikan <span className="text-rose-500">*</span>
              </label>
              <select
                id="input-question-jenjang"
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value as Jenjang)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="SD">SD (Sekolah Dasar)</option>
                <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
              </select>
            </div>

            {/* Kurikulum */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kurikulum Acuan <span className="text-rose-500">*</span>
              </label>
              <select
                id="input-question-curriculum"
                value={curriculum}
                onChange={(e) => setCurriculum(e.target.value as Curriculum)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="merdeka">Kurikulum Merdeka (Capaian Pembelajaran)</option>
                <option value="kbc">Kurikulum KBC / Standar Nasional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            {/* Taksonomi Bloom Level */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat Taksonomi Bloom <span className="text-rose-500">*</span>
              </label>
              <select
                id="input-question-bloom"
                value={levelC}
                onChange={(e) => handleBloomChange(e.target.value as BloomLevel)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none font-semibold"
              >
                <option value="C1">C1 - Mengingat (Remembering) [LOTS - L1]</option>
                <option value="C2">C2 - Memahami (Understanding) [LOTS - L1]</option>
                <option value="C3">C3 - Menerapkan (Applying) [MOTS - L2]</option>
                <option value="C4">C4 - Menganalisis (Analyzing) [HOTS - L3]</option>
                <option value="C5">C5 - Mengevaluasi (Evaluating) [HOTS - L3]</option>
                <option value="C6">C6 - Menciptakan (Creating) [HOTS - L3]</option>
              </select>
            </div>

            {/* Kata Kerja Operasional (KKO) */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kata Kerja Operasional (KKO)
              </label>
              <select
                id="input-question-kko"
                value={kkoId}
                onChange={(e) => setKkoId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              >
                {availableKkos.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.verb} ({k.description.slice(0, 45)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kategori Asesmen Tags */}
          <div className="pt-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
              Kategori Asesmen Terkait
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => {
                const isSelected = selectedKategoriIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedKategoriIds(prev =>
                        prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag & Karakteristik Pedagogis */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                Tag & Karakteristik Butir Soal (HOTS, Literasi/Numerasi, Profil Pancasila, dll.)
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedTagIds.length} dipilih
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const isSelected = selectedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTagIds(prev =>
                        prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                      );
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                    aria-label={`${isSelected ? 'Hapus' : 'Pilih'} karakteristik ${t.name}`}
                    title={t.description || t.name}
                  >
                    <TagIcon className="w-3 h-3" />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Format & Tipe Butir Soal */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              2. Tipe Soal & Konten Stimulus
            </h3>
          </div>

          {/* Tipe Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Pilih Bentuk / Tipe Soal:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'pg', label: 'Pilihan Ganda' },
                { id: 'uraian', label: 'Uraian / Essay' },
                { id: 'menjodohkan', label: 'Menjodohkan' },
                { id: 'benar_salah', label: 'Benar / Salah' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as QuestionType)}
                  className={`p-2.5 rounded-xl font-bold border transition-all text-center ${
                    type === t.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Teks Pertanyaan / Soal <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-question-text"
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Tuliskan stimulus, teks kasus, narasi, atau pertanyaan utama soal di sini..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type-Specific Answer Inputs */}
          {/* 1. Pilihan Ganda */}
          {type === 'pg' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Opsi Pilihan Ganda & Kunci Jawaban (Klik lingkaran untuk memilih kunci benar)
                </label>
                {pgOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddPgOption}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Opsi (E)
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {pgOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      opt.is_correct
                        ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSetPgCorrect(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                        opt.is_correct
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                      aria-label={
                        opt.is_correct
                          ? `Pilihan ${opt.label} sudah menjadi kunci jawaban`
                          : `Jadikan pilihan ${opt.label} sebagai kunci jawaban`
                      }
                      title={opt.is_correct ? 'Kunci Jawaban Terpilih' : 'Klik untuk jadikan kunci jawaban'}
                    >
                      {opt.label}
                    </button>

                    <input
                      type="text"
                      value={opt.option_text}
                      onChange={(e) => handlePgTextChange(idx, e.target.value)}
                      placeholder={`Teks pilihan ${opt.label}...`}
                      className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none"
                    />

                    {opt.is_correct && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:inline">
                        Kunci Benar
                      </span>
                    )}

                    {pgOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePgOption(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        aria-label={`Hapus opsi ${opt.label}`}
                        title="Hapus Opsi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Benar / Salah */}
          {type === 'benar_salah' && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Kunci Kebenaran Pernyataan:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCorrectBoolean(true)}
                  className={`flex-1 p-3 rounded-xl font-bold text-xs border transition-all text-center ${
                    correctBoolean === true
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  BENAR (TRUE)
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectBoolean(false)}
                  className={`flex-1 p-3 rounded-xl font-bold text-xs border transition-all text-center ${
                    correctBoolean === false
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 ring-2 ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  SALAH (FALSE)
                </button>
              </div>
            </div>
          )}

          {/* 3. Menjodohkan */}
          {type === 'menjodohkan' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pasangan Menjodohkan (Kolom Kiri dipasangkan dengan Kolom Kanan)
                </label>
                <button
                  type="button"
                  onClick={handleAddMatchingPair}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pasangan
                </button>
              </div>

              <div className="space-y-2">
                {matchingPairs.map((pair, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      value={pair.left_text}
                      onChange={(e) => handleMatchingPairChange(idx, 'left_text', e.target.value)}
                      placeholder="Pernyataan Kiri (Premis)"
                      className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <span className="text-slate-400 font-bold">→</span>
                    <input
                      type="text"
                      value={pair.right_text}
                      onChange={(e) => handleMatchingPairChange(idx, 'right_text', e.target.value)}
                      placeholder="Pasangan Kanan (Kunci)"
                      className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none font-semibold text-blue-600 dark:text-blue-400"
                    />
                    {matchingPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMatchingPair(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Uraian & Rubrik */}
          {type === 'uraian' && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pedoman / Rubrik Penilaian Uraian
                </label>
                <textarea
                  rows={3}
                  value={rubricText}
                  onChange={(e) => setRubricText(e.target.value)}
                  placeholder="Contoh: Skor 10 jika memuat 3 kata kunci, skor 5 jika hanya menyebutkan 1 konsep dasar..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Skor Maksimal Soal Uraian
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-32 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none font-bold"
                />
              </div>
            </div>
          )}

          {/* Indikator & Pembahasan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Indikator Capaian Pembelajaran
              </label>
              <textarea
                rows={2}
                value={indicatorText}
                onChange={(e) => setIndicatorText(e.target.value)}
                placeholder="Peserta didik dapat..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Pembahasan / Kunci Telaah
              </label>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Penjelasan langkah penyelesaian..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            id="btn-cancel-question-form"
            type="button"
            onClick={() => setCurrentView('questions')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            id="btn-save-question"
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            aria-label={isEditing ? 'Simpan perubahan soal' : 'Simpan soal baru ke bank soal'}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan Soal' : 'Simpan ke Bank Soal'}
          </button>
        </div>
      </form>
    </div>
  );
};
