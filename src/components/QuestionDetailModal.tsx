import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Calendar,
  User,
  CheckCircle2,
  Share2,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { Question } from '../types';
import { canManageOwnableResource, canUseSharedResource } from '../lib/roleAccess';
import { useFocusTrap } from '../lib/useFocusTrap';

interface QuestionDetailModalProps {
  question: Question | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onShare,
}) => {
  const { subjects, kkoList, users, currentUser, categories, tags, shareSoalList } = useApp();
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, Boolean(question), onClose);

  if (!question) return null;

  const subject = subjects.find(s => s.id === question.subject_id);
  const kko = kkoList.find(k => k.id === question.kko_id);
  const creator = users.find(u => u.id === question.created_by);
  const ownershipAllowed = canManageOwnableResource(currentUser.role, currentUser.id, question.created_by);
  const acceptedShare = shareSoalList.find(share =>
    share.question_id === question.id &&
    share.shared_to === currentUser.id &&
    share.is_accepted
  );
  const canShare = ownershipAllowed;
  const canEdit = ownershipAllowed || canUseSharedResource(acceptedShare?.permission, 'edit');
  const canDuplicate = ownershipAllowed || canUseSharedResource(acceptedShare?.permission, 'copy');

  return (
    <div
      id="modal-question-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      role="presentation"
    >
      <div
        ref={dialogRef}
        id="modal-question-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-question-detail-title"
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 outline-none"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span id="modal-question-detail-title" className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              {subject?.name || 'Mata Pelajaran'}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
              {question.level_c} ({question.level_kognitif})
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
              {question.type.replace('_', ' ')}
            </span>
          </div>
          <button
            id="btn-close-modal-question-detail"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup modal detail soal"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teks Soal / Stimulus</h4>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
              {question.question_text}
            </div>
          </div>

          {/* Question Specific Content */}
          {question.type === 'pg' && question.pg_options && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilihan Ganda</h4>
              <div className="space-y-2">
                {question.pg_options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-all ${
                      opt.is_correct
                        ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-semibold'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        opt.is_correct
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {opt.label || String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 pt-0.5">{opt.option_text}</span>
                    {opt.is_correct && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Kunci Jawaban
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.type === 'benar_salah' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kunci Jawaban</h4>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Pernyataan di atas adalah: {question.correct_boolean ? 'BENAR (TRUE)' : 'SALAH (FALSE)'}
              </div>
            </div>
          )}

          {question.type === 'menjodohkan' && question.matching_pairs && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pasangan Menjodohkan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.matching_pairs.map((pair, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{pair.left_text}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{pair.right_text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.type === 'uraian' && question.essay_rubric && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rubrik Penilaian Uraian</h4>
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-sm text-indigo-950 dark:text-indigo-200 space-y-1">
                <p className="font-medium">{question.essay_rubric.rubric_text}</p>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Skor Maksimal: {question.essay_rubric.max_score || 10} Poin
                </p>
              </div>
            </div>
          )}

          {/* Indicator & Explanation */}
          {question.indicator_text && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indikator Soal</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">{question.indicator_text}</p>
            </div>
          )}

          {question.explanation && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pembahasan Soal</h4>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                {question.explanation}
              </div>
            </div>
          )}

          {/* Categories and Tags */}
          {(question.kategori_ids || question.tag_ids) && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {question.kategori_ids && question.kategori_ids.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kategori Asesmen</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {question.kategori_ids.map(kid => {
                      const kat = categories.find(c => c.id === kid);
                      if (!kat) return null;
                      return (
                        <span key={kid} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                          {kat.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {question.tag_ids && question.tag_ids.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Karakteristik & Tag Pedagogis</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {question.tag_ids.map(tid => {
                      const tag = tags.find(t => t.id === tid);
                      if (!tag) return null;
                      return (
                        <span key={tid} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                          🏷️ {tag.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata Footer info */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500">
            <div>
              <span className="block text-slate-400 text-[10px]">Jenjang / Kurikulum</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {question.jenjang} / {question.curriculum.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">Kata Kerja Operasional (KKO)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {kko?.verb || 'KKO Terapan'}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">Dibuat Oleh</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {creator?.name || 'Guru'}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">Tanggal Pembuatan</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {new Date(question.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          {canShare ? (
            <button
              id="btn-modal-share-question"
              onClick={() => onShare(question.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Share2 className="w-4 h-4 text-blue-600" /> Bagikan Soal
            </button>
          ) : <span />}

          <div className="flex items-center gap-2">
            {canDuplicate && (
              <button
                id="btn-modal-duplicate-question"
                onClick={() => onDuplicate(question.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Copy className="w-4 h-4" /> Duplikasi
              </button>
            )}
            {canEdit && (
              <>
                <button
                  id="btn-modal-edit-question"
                  onClick={() => onEdit(question.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                {ownershipAllowed && (
                  <button
                    id="btn-modal-delete-question"
                    type="button"
                    onClick={() => onDelete(question.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    aria-label={`Hapus soal ${question.id}`}
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
