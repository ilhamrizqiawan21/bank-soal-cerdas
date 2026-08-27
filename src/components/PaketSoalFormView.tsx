import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Search,
  Check,
  Clock,
  Shuffle,
  BrainCircuit,
  Layers,
  FolderTree,
  FileDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Jenjang, PaketSoal, PaketSoalItem } from '../types';
import { PaketSoalExportModal } from './PaketSoalExportModal';

interface PaketSoalFormViewProps {
  isEditing?: boolean;
}

export const PaketSoalFormView: React.FC<PaketSoalFormViewProps> = ({ isEditing }) => {
  const {
    paketSoalList,
    questions,
    subjects,
    categories,
    selectedPaketId,
    setCurrentView,
    addPaketSoal,
    updatePaketSoal,
    addToast
  } = useApp();

  const existingPaket = isEditing ? paketSoalList.find(p => p.id === selectedPaketId) : null;

  const [name, setName] = useState(existingPaket?.name || '');
  const [description, setDescription] = useState(existingPaket?.description || '');
  const [jenjang, setJenjang] = useState<Jenjang>(existingPaket?.jenjang || 'SMP');
  const [curriculum, setCurriculum] = useState<'merdeka' | 'kbc' | 'both'>(existingPaket?.curriculum || 'merdeka');
  const [kategoriId, setKategoriId] = useState<string>(existingPaket?.kategori_id || categories[0]?.id || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingPaket?.duration_minutes || 60);
  const [acakSoal, setAcakSoal] = useState<boolean>(existingPaket?.acak_soal ?? true);
  const [acakPilihan, setAcakPilihan] = useState<boolean>(existingPaket?.acak_pilihan ?? true);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(existingPaket?.status || 'draft');
  const [showExportModal, setShowExportModal] = useState(false);

  // Selected questions with scores
  const [selectedItems, setSelectedItems] = useState<Array<{ question_id: string; score: number; order: number }>>(
    existingPaket?.items.map(i => ({ question_id: i.question_id, score: i.score, order: i.order })) || []
  );

  // Bank search/filter states
  const [bankSearch, setBankSearch] = useState('');
  const [bankSubjectFilter, setBankSubjectFilter] = useState('all');

  const filteredBankQuestions = questions.filter((q) => {
    if (bankSubjectFilter !== 'all' && q.subject_id !== bankSubjectFilter) return false;
    if (bankSearch.trim()) {
      const matchText = q.question_text.toLowerCase().includes(bankSearch.toLowerCase());
      if (!matchText) return false;
    }
    return true;
  });

  const toggleSelectQuestion = (qId: string) => {
    const exists = selectedItems.some(i => i.question_id === qId);
    if (exists) {
      setSelectedItems(prev => prev.filter(i => i.question_id !== qId));
    } else {
      setSelectedItems(prev => [
        ...prev,
        { question_id: qId, score: 25, order: prev.length + 1 },
      ]);
    }
  };

  const handleScoreChange = (qId: string, newScore: number) => {
    setSelectedItems(prev =>
      prev.map(i => (i.question_id === qId ? { ...i, score: Math.max(1, newScore) } : i))
    );
  };

  const moveSelectedItem = (qId: string, direction: -1 | 1) => {
    setSelectedItems(prev => {
      const currentIndex = prev.findIndex(item => item.question_id === qId);
      const nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= prev.length) return prev;

      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(nextIndex, 0, moved);

      return next.map((item, index) => ({ ...item, order: index + 1 }));
    });
  };

  const totalCalculatedScore = selectedItems.reduce((sum, i) => sum + i.score, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Nama paket soal tidak boleh kosong!', 'warning');
      return;
    }

    if (selectedItems.length === 0) {
      addToast('Pilih minimal 1 butir soal untuk dimasukkan ke dalam paket!', 'warning');
      return;
    }

    const itemsPayload: PaketSoalItem[] = selectedItems.map((item, idx) => ({
      id: `pitem-${Date.now()}-${idx}`,
      question_id: item.question_id,
      order: idx + 1,
      score: item.score,
    }));

    const payload: Omit<PaketSoal, 'id' | 'created_at' | 'created_by'> = {
      name,
      description: description || undefined,
      jenjang,
      curriculum,
      kategori_id: kategoriId || undefined,
      duration_minutes: durationMinutes,
      status,
      total_soal: selectedItems.length,
      acak_soal: acakSoal,
      acak_pilihan: acakPilihan,
      items: itemsPayload,
    };

    try {
      if (isEditing && existingPaket) {
        await updatePaketSoal(existingPaket.id, payload);
      } else {
        await addPaketSoal(payload);
      }

      setCurrentView('paket-soal');
    } catch {
      // Toast is handled by the data layer.
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-paket"
          onClick={() => setCurrentView('paket-soal')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Paket
        </button>

        <div className="flex items-center gap-2">
          {isEditing && existingPaket && (
            <button
              type="button"
              id="btn-export-from-form"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition-all"
            >
              <FileDown className="w-3.5 h-3.5" /> Ekspor Word / PDF
            </button>
          )}
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
            {isEditing ? 'Edit Paket Soal' : 'Rancang Paket Baru'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Info Paket */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              1. Informasi Paket Asesmen
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama / Judul Paket Soal <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-paket-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Asesmen Sumatif Akhir Semester IPA Kelas 8"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Asesmen
              </label>
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={kategoriId}
                  onChange={(e) => setKategoriId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none font-semibold text-xs"
                >
                  <option value="">-- Pilih Kategori Asesmen (Opsional) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type?.toUpperCase() || 'UMUM'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi / Petunjuk Pengerjaan
              </label>
              <textarea
                id="input-paket-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Petunjuk teknis dan ruang lingkup materi yang diujikan..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenjang
                </label>
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value as Jenjang)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kurikulum
                </label>
                <select
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="merdeka">Kurikulum Merdeka</option>
                  <option value="kbc">Kurikulum KBC</option>
                  <option value="both">Kombinasi Keduanya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Durasi Pengerjaan (Menit)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Publikasi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none font-semibold"
                >
                  <option value="published">Siap Ujian (Published)</option>
                  <option value="draft">Konsep (Draft)</option>
                  <option value="archived">Arsip (Archived)</option>
                </select>
              </div>
            </div>

            {/* Randomization Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acakSoal}
                  onChange={(e) => setAcakSoal(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Acak Urutan Soal Siswa (Anti-Sontek)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acakPilihan}
                  onChange={(e) => setAcakPilihan(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Acak Opsi Pilihan Ganda (A-B-C-D)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 2: Pilih & Bobot Butir Soal */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                2. Pemilihan Butir Soal & Bobot Nilai
              </h3>
              <p className="text-xs text-slate-400">
                Pilih soal dari bank soal dan tentukan bobot poin masing-masing butir
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {selectedItems.length} Soal Terpilih
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Total Bobot: {totalCalculatedScore} Poin
              </span>
            </div>
          </div>

          {/* Search filter for question bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Cari teks soal dalam bank..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <select
              value={bankSubjectFilter}
              onChange={(e) => setBankSubjectFilter(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {selectedItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Urutan Soal Terpilih
              </p>
              <div className="space-y-2">
                {selectedItems.map((item, index) => {
                  const question = questions.find(q => q.id === item.question_id);
                  const subject = question ? subjects.find(s => s.id === question.subject_id) : null;

                  return (
                    <div
                      key={item.question_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 text-[10px] font-bold">
                              {subject?.code || 'MAPEL'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold uppercase">
                              {question?.type || 'soal'}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                            {question?.question_text || 'Soal tidak ditemukan'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveSelectedItem(item.question_id, -1)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800"
                          title="Naikkan urutan"
                          aria-label={`Naikkan urutan soal ${question?.question_text || item.question_id}`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedItems.length - 1}
                          onClick={() => moveSelectedItem(item.question_id, 1)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800"
                          title="Turunkan urutan"
                          aria-label={`Turunkan urutan soal ${question?.question_text || item.question_id}`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={item.score}
                          onChange={(e) => handleScoreChange(item.question_id, Number(e.target.value))}
                          className="w-14 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center font-bold text-indigo-600 dark:text-indigo-400 outline-none"
                          title="Bobot poin"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSelectQuestion(item.question_id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Hapus dari paket"
                          aria-label={`Hapus soal ${question?.question_text || item.question_id} dari paket`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question selection rows */}
          <div className="max-h-96 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-800/30">
            {filteredBankQuestions.map((q) => {
              const selectedItem = selectedItems.find(i => i.question_id === q.id);
              const isSelected = !!selectedItem;
              const subj = subjects.find(s => s.id === q.subject_id);

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'border-indigo-300 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleSelectQuestion(q.id)}
                      className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 text-[10px]">
                          {subj?.code || 'MAPEL'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold uppercase text-[10px]">
                          {q.type}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/50 font-bold text-[10px]">
                          {q.level_c}
                        </span>
                      </div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                        {q.question_text}
                      </p>
                    </div>
                  </div>

                  {/* Bobot Score Input if selected */}
                  {isSelected && (
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">Bobot:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={selectedItem.score}
                        onChange={(e) => handleScoreChange(q.id, Number(e.target.value))}
                        className="w-14 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center font-bold text-indigo-600 dark:text-indigo-400 outline-none"
                      />
                      <span className="text-[11px] text-slate-400">Poin</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('paket-soal')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            id="btn-save-paket"
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            aria-label={isEditing ? 'Simpan perubahan paket soal' : 'Simpan paket soal baru'}
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Simpan Perubahan Paket' : 'Simpan Paket Soal'}
          </button>
        </div>
      </form>

      {/* Export Modal */}
      {showExportModal && existingPaket && (
        <PaketSoalExportModal
          paket={existingPaket}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
