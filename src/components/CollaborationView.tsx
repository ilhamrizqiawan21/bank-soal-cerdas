import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Share2,
  BookOpen,
  Layers,
  Copy,
  Eye,
  Trash2,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Clock,
  Send,
  X,
  Edit3,
  HelpCircle,
  Users,
  Check,
  AlertCircle,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Tag as TagIcon
} from 'lucide-react';
import { Question, PaketSoal, User } from '../types';

export const CollaborationView: React.FC = () => {
  const {
    shareSoalList,
    sharePaketList,
    questions,
    paketSoalList,
    subjects,
    categories,
    tags,
    users,
    currentUser,
    duplicateQuestion,
    duplicatePaketSoal,
    setSelectedQuestionId,
    setSelectedPaketId,
    setCurrentView,
    shareSoalAction,
    sharePaketAction,
    updateSharePermission,
    deleteShareAction,
    acceptShareSoal,
    rejectShareSoal,
    acceptSharePaket,
    rejectSharePaket,
    addCollaborationNote,
    addToast
  } = useApp();

  // Tab State: 'received' | 'sent' | 'pool'
  const [tab, setTab] = useState<'received' | 'sent' | 'pool'>('received');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'question' | 'paket_soal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [modalShareType, setModalShareType] = useState<'question' | 'paket_soal'>('question');
  const [modalSelectedItemId, setModalSelectedItemId] = useState('');
  const [modalSelectedTeacherId, setModalSelectedTeacherId] = useState('');
  const [modalPermission, setModalPermission] = useState<'view' | 'edit' | 'copy'>('edit');
  const [modalMessage, setModalMessage] = useState('');
  const [modalItemSearch, setModalItemSearch] = useState('');

  // Preview Modal
  const [previewModalData, setPreviewModalData] = useState<{
    type: 'question' | 'paket_soal';
    question?: Question;
    paket?: PaketSoal;
  } | null>(null);

  // Discussion Modal
  const [discussionModalData, setDiscussionModalData] = useState<{
    shareId: string;
    type: 'question' | 'paket_soal';
    title: string;
    notes: Array<{
      id: string;
      user_id: string;
      user_name: string;
      user_role: string;
      text: string;
      created_at: string;
    }>;
  } | null>(null);
  const [newDiscussionText, setNewDiscussionText] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string; type: 'question' | 'paket_soal' } | null>(null);

  const otherTeachers = useMemo(() => {
    return users.filter(u => (u.role === 'guru' || u.role === 'admin') && u.id !== currentUser.id && u.is_active);
  }, [users, currentUser.id]);

  // Unified items list
  const receivedList = useMemo(() => {
    const qList = shareSoalList
      .filter(s => s.shared_to === currentUser.id)
      .map(s => ({
        id: s.id,
        type: 'question' as const,
        shareId: s.id,
        itemId: s.question_id,
        sharedBy: s.shared_by,
        sharedTo: s.shared_to,
        permission: s.permission,
        message: s.message,
        notes: s.notes || [],
        is_accepted: s.is_accepted,
        accepted_at: s.accepted_at,
        created_at: s.created_at,
        question: questions.find(q => q.id === s.question_id),
        paket: undefined,
      }));

    const pList = sharePaketList
      .filter(s => s.shared_to === currentUser.id)
      .map(s => ({
        id: s.id,
        type: 'paket_soal' as const,
        shareId: s.id,
        itemId: s.paket_soal_id,
        sharedBy: s.shared_by,
        sharedTo: s.shared_to,
        permission: s.permission,
        message: s.message,
        notes: s.notes || [],
        is_accepted: s.is_accepted,
        accepted_at: s.accepted_at,
        created_at: s.created_at,
        question: undefined,
        paket: paketSoalList.find(p => p.id === s.paket_soal_id),
      }));

    return [...qList, ...pList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [shareSoalList, sharePaketList, currentUser.id, questions, paketSoalList]);

  const sentList = useMemo(() => {
    const qList = shareSoalList
      .filter(s => s.shared_by === currentUser.id)
      .map(s => ({
        id: s.id,
        type: 'question' as const,
        shareId: s.id,
        itemId: s.question_id,
        sharedBy: s.shared_by,
        sharedTo: s.shared_to,
        permission: s.permission,
        message: s.message,
        notes: s.notes || [],
        is_accepted: s.is_accepted,
        accepted_at: s.accepted_at,
        created_at: s.created_at,
        question: questions.find(q => q.id === s.question_id),
        paket: undefined,
      }));

    const pList = sharePaketList
      .filter(s => s.shared_by === currentUser.id)
      .map(s => ({
        id: s.id,
        type: 'paket_soal' as const,
        shareId: s.id,
        itemId: s.paket_soal_id,
        sharedBy: s.shared_by,
        sharedTo: s.shared_to,
        permission: s.permission,
        message: s.message,
        notes: s.notes || [],
        is_accepted: s.is_accepted,
        accepted_at: s.accepted_at,
        created_at: s.created_at,
        question: undefined,
        paket: paketSoalList.find(p => p.id === s.paket_soal_id),
      }));

    return [...qList, ...pList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [shareSoalList, sharePaketList, currentUser.id, questions, paketSoalList]);

  // Pool List: all accepted shares across the whole school/platform
  const poolList = useMemo(() => {
    const qList = shareSoalList
      .filter(s => s.is_accepted)
      .map(s => ({
        id: s.id,
        type: 'question' as const,
        shareId: s.id,
        itemId: s.question_id,
        sharedBy: s.shared_by,
        sharedTo: s.shared_to,
        permission: s.permission,
        message: s.message,
        notes: s.notes || [],
        is_accepted: true,
        accepted_at: s.accepted_at,
        created_at: s.created_at,
        question: questions.find(q => q.id === s.question_id),
        paket: undefined,
      }));

    const pList = sharePaketList
      .filter(s => s.is_accepted)
      .map(s => ({
        id: s.id,
        type: 'paket_soal' as const,
        shareId: s.id,
        itemId: s.paket_soal_id,
        sharedBy: s.shared_by,
        sharedTo: s.shared_to,
        permission: s.permission,
        message: s.message,
        notes: s.notes || [],
        is_accepted: true,
        accepted_at: s.accepted_at,
        created_at: s.created_at,
        question: undefined,
        paket: paketSoalList.find(p => p.id === s.paket_soal_id),
      }));

    // Deduplicate by item ID
    const seen = new Set<string>();
    const combined: Array<(typeof qList)[number] | (typeof pList)[number]> = [];
    [...qList, ...pList].forEach(item => {
      if (!seen.has(item.itemId)) {
        seen.add(item.itemId);
        combined.push(item);
      }
    });

    return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [shareSoalList, sharePaketList, questions, paketSoalList]);

  // Filtered List based on active tab
  const filteredList = useMemo(() => {
    let list = tab === 'received' ? receivedList : tab === 'sent' ? sentList : poolList;

    if (typeFilter !== 'all') {
      list = list.filter(item => item.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        list = list.filter(item => !item.is_accepted);
      } else if (statusFilter === 'accepted') {
        list = list.filter(item => item.is_accepted);
      }
    }

    if (subjectFilter !== 'all') {
      list = list.filter(item => {
        if (item.type === 'question' && item.question) {
          return item.question.subject_id === subjectFilter;
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => {
        const sender = users.find(u => u.id === item.sharedBy);
        const receiver = users.find(u => u.id === item.sharedTo);
        const titleText = item.type === 'question' ? item.question?.question_text || '' : item.paket?.name || '';
        const msgText = item.message || '';

        return (
          titleText.toLowerCase().includes(q) ||
          msgText.toLowerCase().includes(q) ||
          sender?.name.toLowerCase().includes(q) ||
          receiver?.name.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [tab, receivedList, sentList, poolList, typeFilter, statusFilter, subjectFilter, searchQuery, users]);

  // Stats
  const pendingReceivedCount = receivedList.filter(item => !item.is_accepted).length;
  const activeReceivedCount = receivedList.filter(item => item.is_accepted).length;
  const sentCount = sentList.length;
  const poolCount = poolList.length;

  // Open Share Modal
  const handleOpenShareModal = () => {
    setModalShareType('question');
    setModalSelectedItemId(questions[0]?.id || '');
    setModalSelectedTeacherId(otherTeachers[0]?.id || '');
    setModalPermission('edit');
    setModalMessage('');
    setModalItemSearch('');
    setIsShareModalOpen(true);
  };

  // Submit Share Modal
  const handleConfirmShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSelectedItemId || !modalSelectedTeacherId) {
      addToast('Pilih butir/paket soal dan guru penerima kolaborasi!', 'warning');
      return;
    }

    if (modalShareType === 'question') {
      const ok = shareSoalAction(modalSelectedItemId, modalSelectedTeacherId, modalPermission, modalMessage.trim() || undefined);
      if (ok) setIsShareModalOpen(false);
    } else {
      const ok = sharePaketAction(modalSelectedItemId, modalSelectedTeacherId, modalPermission, modalMessage.trim() || undefined);
      if (ok) setIsShareModalOpen(false);
    }
  };

  // Handle Accept
  const handleAccept = (item: { shareId: string; type: 'question' | 'paket_soal' }) => {
    if (item.type === 'question') {
      acceptShareSoal(item.shareId);
    } else {
      acceptSharePaket(item.shareId);
    }
  };

  // Handle Reject
  const handleReject = (item: { shareId: string; type: 'question' | 'paket_soal' }) => {
    if (item.type === 'question') {
      rejectShareSoal(item.shareId);
    } else {
      rejectSharePaket(item.shareId);
    }
  };

  // Handle Clone
  const handleClone = (item: { type: 'question' | 'paket_soal'; question?: Question; paket?: PaketSoal }) => {
    if (item.type === 'question' && item.question) {
      duplicateQuestion(item.question.id);
    } else if (item.type === 'paket_soal' && item.paket) {
      duplicatePaketSoal(item.paket.id);
    }
  };

  // Open Preview
  const handleOpenPreview = (item: { type: 'question' | 'paket_soal'; question?: Question; paket?: PaketSoal }) => {
    setPreviewModalData({
      type: item.type,
      question: item.question,
      paket: item.paket,
    });
  };

  // Open Discussion
  const handleOpenDiscussion = (item: {
    shareId: string;
    type: 'question' | 'paket_soal';
    question?: Question;
    paket?: PaketSoal;
    notes: Array<{ id: string; user_id: string; user_name: string; user_role: string; text: string; created_at: string }>;
  }) => {
    const title = item.type === 'question' ? item.question?.question_text.slice(0, 50) + '...' : item.paket?.name || 'Item Kolaborasi';
    setDiscussionModalData({
      shareId: item.shareId,
      type: item.type,
      title: title || 'Diskusi & Telaah Soal',
      notes: item.notes,
    });
    setNewDiscussionText('');
  };

  // Submit Note
  const handleSubmitDiscussionNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionModalData || !newDiscussionText.trim()) return;

    addCollaborationNote(discussionModalData.shareId, discussionModalData.type, newDiscussionText.trim());

    // Update local modal state immediately
    const newNote = {
      id: `note-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role === 'admin' ? 'Administrator' : 'Guru',
      text: newDiscussionText.trim(),
      created_at: new Date().toISOString(),
    };

    setDiscussionModalData(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
    setNewDiscussionText('');
  };

  // Filter items in share modal
  const selectableItems = useMemo(() => {
    if (modalShareType === 'question') {
      let list = questions;
      if (modalItemSearch.trim()) {
        const q = modalItemSearch.toLowerCase();
        list = list.filter(item => item.question_text.toLowerCase().includes(q));
      }
      return list;
    } else {
      let list = paketSoalList;
      if (modalItemSearch.trim()) {
        const q = modalItemSearch.toLowerCase();
        list = list.filter(item => item.name.toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q));
      }
      return list;
    }
  }, [modalShareType, questions, paketSoalList, modalItemSearch]);

  return (
    <div id="collaboration-view-root" className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Kolaborasi & Berbagi Soal Antar Guru
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sinergi penulisan butir soal, telaah sejawat (peer review), dan kurasi paket ujian bersama MGMP
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-open-share-modal"
            onClick={handleOpenShareModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Bagikan Soal / Paket Baru
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {pendingReceivedCount}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Undangan Menunggu
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {activeReceivedCount}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Diterima & Terhubung
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {sentCount}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Dibagikan oleh Saya
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {poolCount}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Bank Bersama MGMP
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="tab-btn-received"
            onClick={() => setTab('received')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'received'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Kotak Masuk / Diterima
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                tab === 'received' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {receivedList.length}
            </span>
            {pendingReceivedCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            id="tab-btn-sent"
            onClick={() => setTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'sent'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Terkirim / Dibagikan Saya
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                tab === 'sent' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {sentList.length}
            </span>
          </button>

          <button
            id="tab-btn-pool"
            onClick={() => setTab('pool')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === 'pool'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Bank Kolaborasi MGMP
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                tab === 'pool' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {poolList.length}
            </span>
          </button>
        </div>

        {/* Quick hint */}
        <div className="text-xs text-slate-500 dark:text-slate-400 px-2 hidden md:block">
          {tab === 'received'
            ? 'Soal & paket evaluasi yang dibagikan guru lain kepada Anda'
            : tab === 'sent'
            ? 'Soal & paket yang telah Anda bagikan ke rekan sejawat'
            : 'Koleksi soal terkurasi bersama oleh seluruh guru sekolah / MGMP'}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-collaboration-search"
            type="text"
            placeholder="Cari soal, paket, atau guru..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            id="select-type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Tipe (Soal & Paket)</option>
            <option value="question">Hanya Butir Soal</option>
            <option value="paket_soal">Hanya Paket Soal</option>
          </select>

          {/* Status Filter (only in received/sent) */}
          {tab !== 'pool' && (
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="accepted">Sudah Diterima</option>
            </select>
          )}

          {/* Subject Filter */}
          <select
            id="select-subject-filter"
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Mata Pelajaran</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Share2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {tab === 'received'
                ? 'Tidak Ada Soal atau Paket yang Diterima'
                : tab === 'sent'
                ? 'Belum Ada Soal yang Anda Bagikan'
                : 'Belum Ada Item di Bank Bersama MGMP'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {tab === 'received'
                ? 'Ketika guru lain mengirimkan butir soal atau paket untuk kolaborasi, undangan akan tampil di sini.'
                : tab === 'sent'
                ? 'Gunakan tombol "+ Bagikan Soal / Paket Baru" untuk mulai berkolaborasi dengan rekan guru sejawat.'
                : 'Koleksi soal yang dibagikan dan disetujui akan teragregasi secara otomatis di bank kolaborasi ini.'}
            </p>
            {tab !== 'pool' && (
              <button
                onClick={handleOpenShareModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" /> Mulai Bagikan Sekarang
              </button>
            )}
          </div>
        ) : (
          filteredList.map(item => {
            const sender = users.find(u => u.id === item.sharedBy);
            const receiver = users.find(u => u.id === item.sharedTo);
            const isQuestion = item.type === 'question';
            const question = item.question;
            const paket = item.paket;
            const subject = isQuestion && question ? subjects.find(s => s.id === question.subject_id) : null;
            const isPending = !item.is_accepted;
            const isReceived = tab === 'received';
            const isSent = tab === 'sent';

            // Question tag pills
            const questionTags = isQuestion && question?.tag_ids
              ? tags.filter(t => question.tag_ids?.includes(t.id))
              : [];

            return (
              <div
                key={`${item.type}-${item.id}`}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                  isPending && isReceived
                    ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Card Header & Badges */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ${
                          isQuestion
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {isQuestion ? <BookOpen className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                        {isQuestion ? 'Butir Soal' : 'Paket Soal'}
                      </span>

                      {subject && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {subject.name}
                        </span>
                      )}

                      {isQuestion && question && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {question.level_c} ({question.level_kognitif})
                        </span>
                      )}

                      {!isQuestion && paket && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {paket.items.length} Butir Soal • {paket.duration_minutes || 60} Menit
                        </span>
                      )}
                    </div>

                    {/* Permission & Status */}
                    <div className="flex items-center gap-1.5">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Menunggu Persetujuan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          <Check className="w-3 h-3" />
                          Aktif Terhubung
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          item.permission === 'edit'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : item.permission === 'copy'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.permission === 'edit' ? 'Edit Bersama' : item.permission === 'copy' ? 'Boleh Salin' : 'Lihat Saja'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Preview Content */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                      {isQuestion
                        ? question?.question_text || 'Butir Soal Tidak Ditemukan'
                        : paket?.name || 'Paket Soal Tidak Ditemukan'}
                    </h3>

                    {isQuestion && question?.indicator_text && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                        Indikator: {question.indicator_text}
                      </p>
                    )}

                    {!isQuestion && paket?.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {paket.description}
                      </p>
                    )}
                  </div>

                  {/* Question Characteristic Tags */}
                  {questionTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {questionTags.map(tag => (
                        <span
                          key={tag.id}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${tag.color}`}
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message from sender */}
                  {item.message && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                          Pesan Pengantar ({sender?.name.split(',')[0]}):
                        </span>
                        <p className="mt-0.5 italic">"{item.message}"</p>
                      </div>
                    </div>
                  )}

                  {/* Metadata Row: Sender/Receiver & Timestamp */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                        {(tab === 'received' ? sender?.name : receiver?.name)?.charAt(0) || 'G'}
                      </div>
                      <span>
                        {tab === 'received' ? (
                          <>Oleh: <strong className="text-slate-800 dark:text-slate-200">{sender?.name || 'Guru Sejawat'}</strong></>
                        ) : tab === 'sent' ? (
                          <>Penerima: <strong className="text-slate-800 dark:text-slate-200">{receiver?.name || 'Rekan Guru'}</strong></>
                        ) : (
                          <>Kolaborator: <strong className="text-slate-800 dark:text-slate-200">{sender?.name || 'Guru'}</strong></>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      {item.notes.length > 0 && (
                        <button
                          onClick={() => handleOpenDiscussion(item)}
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {item.notes.length} Telaah
                        </button>
                      )}
                      <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  {/* Left Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* If Pending in Received Tab -> Accept & Reject */}
                    {isPending && isReceived ? (
                      <>
                        <button
                          id={`btn-accept-share-${item.id}`}
                          onClick={() => handleAccept(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Terima Undangan
                        </button>
                        <button
                          id={`btn-reject-share-${item.id}`}
                          onClick={() => handleReject(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 transition-colors"
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Duplicate/Clone Button */}
                        <button
                          id={`btn-clone-${item.id}`}
                          onClick={() => handleClone(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 transition-colors"
                          title="Salin ke Bank Soal / Paket Pribadi Saya"
                        >
                          <Copy className="w-3.5 h-3.5" /> Salin ke Bank Saya
                        </button>

                        {/* Edit Button if permission is edit */}
                        {item.permission === 'edit' && (
                          <button
                            onClick={() => {
                              if (isQuestion && question) {
                                setSelectedQuestionId(question.id);
                                setCurrentView('question-form');
                              } else if (!isQuestion && paket) {
                                setSelectedPaketId(paket.id);
                                setCurrentView('paket-soal-form');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                            title="Buka untuk Mengedit Bersama"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Bersama
                          </button>
                        )}
                      </>
                    )}

                    {/* Preview Button */}
                    <button
                      id={`btn-preview-${item.id}`}
                      onClick={() => handleOpenPreview(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Lihat Rincian Butir / Paket"
                    >
                      <Eye className="w-3.5 h-3.5" /> Pratinjau
                    </button>

                    {/* Discussion / Peer Review Button */}
                    <button
                      onClick={() => handleOpenDiscussion(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Buka Catatan Telaah Sejawat"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      Telaah ({item.notes.length})
                    </button>
                  </div>

                  {/* Right Action: Revoke/Delete */}
                  <div className="flex items-center gap-1.5">
                    {/* If sent share, allow quick permission edit */}
                    {isSent && (
                      <select
                        value={item.permission}
                        onChange={e => updateSharePermission(item.shareId, item.type, e.target.value as any)}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                        title="Ubah Hak Akses"
                      >
                        <option value="view">Izin: Lihat</option>
                        <option value="edit">Izin: Edit</option>
                        <option value="copy">Izin: Salin</option>
                      </select>
                    )}

                    <button
                      onClick={() => setDeleteConfirmId({ id: item.shareId, type: item.type })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title={isSent ? 'Cabut Akses Kolaborasi' : 'Hapus dari Daftar Kolaborasi'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Bagikan Soal / Paket Baru */}
      {isShareModalOpen && (
        <div
          id="modal-share-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            id="modal-share-container"
            className="bg-white dark:bg-slate-900 w-full max-w-xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Share2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Bagikan Soal / Paket Evaluasi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kirimkan butir soal atau paket kepada rekan guru untuk sinergi dan telaah
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmShare} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Type Picker */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Pilih Jenis Yang Akan Dibagikan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModalShareType('question');
                      setModalSelectedItemId(questions[0]?.id || '');
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      modalShareType === 'question'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Butir Soal</div>
                      <div className="text-[10px] text-slate-500 font-normal">Soal spesifik per butir</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalShareType('paket_soal');
                      setModalSelectedItemId(paketSoalList[0]?.id || '');
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      modalShareType === 'paket_soal'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Paket Soal</div>
                      <div className="text-[10px] text-slate-500 font-normal">Satu paket asesmen utuh</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Item Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    2. Pilih {modalShareType === 'question' ? 'Butir Soal' : 'Paket Soal'}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {selectableItems.length} opsi tersedia
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={`Filter nama ${modalShareType === 'question' ? 'soal' : 'paket'}...`}
                    value={modalItemSearch}
                    onChange={e => setModalItemSearch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />

                  <select
                    value={modalSelectedItemId}
                    onChange={e => setModalSelectedItemId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    size={4}
                  >
                    {modalShareType === 'question'
                      ? (selectableItems as Question[]).map(q => {
                          const subj = subjects.find(s => s.id === q.subject_id);
                          return (
                            <option key={q.id} value={q.id} className="p-1.5">
                              [{subj?.code || 'MAPEL'} - {q.level_c}] {q.question_text.slice(0, 70)}...
                            </option>
                          );
                        })
                      : (selectableItems as PaketSoal[]).map(p => (
                          <option key={p.id} value={p.id} className="p-1.5">
                            {p.name} ({p.items.length} Soal • {p.duration_minutes || 60}m • {p.jenjang})
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Target Teacher */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  3. Pilih Rekan Guru Tujuan
                </label>
                {otherTeachers.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs">
                    Belum ada guru lain yang terdaftar di sistem. Anda dapat menambahkan pengguna di menu Pengaturan Pengguna.
                  </div>
                ) : (
                  <select
                    value={modalSelectedTeacherId}
                    onChange={e => setModalSelectedTeacherId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {otherTeachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email}) - {t.role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Permission Level */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  4. Hak Akses Kolaborasi
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <label
                    className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      modalPermission === 'view'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Lihat Saja
                      </span>
                      <input
                        type="radio"
                        name="perm"
                        checked={modalPermission === 'view'}
                        onChange={() => setModalPermission('view')}
                        className="text-indigo-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">Hanya membaca & ulasan telaah</p>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      modalPermission === 'edit'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5" /> Edit Bersama
                      </span>
                      <input
                        type="radio"
                        name="perm"
                        checked={modalPermission === 'edit'}
                        onChange={() => setModalPermission('edit')}
                        className="text-indigo-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">Boleh memodifikasi butir soal</p>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      modalPermission === 'copy'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Boleh Salin
                      </span>
                      <input
                        type="radio"
                        name="perm"
                        checked={modalPermission === 'copy'}
                        onChange={() => setModalPermission('copy')}
                        className="text-indigo-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">Dapat menyalin ke bank pribadi</p>
                  </label>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  5. Pesan Pengantar / Catatan Telaah (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Mohon bantuan telaah opsi jawaban dan tingkat kesukaran soal untuk PAS..."
                  value={modalMessage}
                  onChange={e => setModalMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={otherTeachers.length === 0 || !modalSelectedItemId}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Undangan Kolaborasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Preview Detail Soal / Paket */}
      {previewModalData && (
        <div
          id="modal-preview-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            id="modal-preview-container"
            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {previewModalData.type === 'question' ? <BookOpen className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {previewModalData.type === 'question' ? 'Pratinjau Butir Soal Kolaborasi' : 'Pratinjau Paket Soal Kolaborasi'}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {previewModalData.type === 'question' && previewModalData.question && (
                <div className="space-y-4">
                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {subjects.find(s => s.id === previewModalData.question?.subject_id)?.name || 'Mapel'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {previewModalData.question.level_c} ({previewModalData.question.level_kognitif})
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {previewModalData.question.jenjang} • Kurikulum {previewModalData.question.curriculum.toUpperCase()}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Teks Butir Soal:</span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                      {previewModalData.question.question_text}
                    </p>
                  </div>

                  {/* Options for PG */}
                  {previewModalData.question.type === 'pg' && previewModalData.question.pg_options && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Pilihan Jawaban & Kunci:</span>
                      <div className="space-y-1.5">
                        {previewModalData.question.pg_options.map((opt, idx) => (
                          <div
                            key={opt.id || idx}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                              opt.is_correct
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px]">
                                {opt.label}
                              </span>
                              <span>{opt.option_text}</span>
                            </div>
                            {opt.is_correct && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-600 text-white font-bold">
                                Kunci Benar
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {previewModalData.question.explanation && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200">
                      <span className="font-bold block mb-1">Pembahasan / Rasionalisasi:</span>
                      <p>{previewModalData.question.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {previewModalData.type === 'paket_soal' && previewModalData.paket && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {previewModalData.paket.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {previewModalData.paket.description || 'Tidak ada deskripsi paket.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-base font-black text-indigo-600">{previewModalData.paket.items.length}</div>
                      <div className="text-[10px] text-slate-400">Total Soal</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-base font-black text-indigo-600">{previewModalData.paket.duration_minutes || 60}m</div>
                      <div className="text-[10px] text-slate-400">Durasi Pengerjaan</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-base font-black text-indigo-600">{previewModalData.paket.jenjang}</div>
                      <div className="text-[10px] text-slate-400">Jenjang</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Daftar Soal Dalam Paket:</span>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {previewModalData.paket.items.map((item, idx) => {
                        const q = questions.find(qItem => qItem.id === item.question_id);
                        return (
                          <div
                            key={item.id || idx}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs"
                          >
                            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                                {q?.question_text || 'Soal'}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                Tipe: {q?.type.toUpperCase()} • Bobot: {item.score || 25} Poin
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setPreviewModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tutup
              </button>

              <button
                onClick={() => {
                  if (previewModalData.type === 'question' && previewModalData.question) {
                    duplicateQuestion(previewModalData.question.id);
                  } else if (previewModalData.type === 'paket_soal' && previewModalData.paket) {
                    duplicatePaketSoal(previewModalData.paket.id);
                  }
                  setPreviewModalData(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" /> Salin ke Bank Pribadi Saya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Diskusi & Catatan Telaah Sejawat (Peer Review) */}
      {discussionModalData && (
        <div
          id="modal-discussion-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            id="modal-discussion-container"
            className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Telaah & Diskusi Sejawat
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs">
                    {discussionModalData.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDiscussionModalData(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Discussion Feed */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              {discussionModalData.notes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-300">Belum Ada Catatan Telaah</p>
                  <p className="text-[11px]">Tuliskan saran perbaikan konstruktif atau masukan di bawah.</p>
                </div>
              ) : (
                discussionModalData.notes.map(note => {
                  const isMe = note.user_id === currentUser.id;
                  return (
                    <div
                      key={note.id}
                      className={`p-3 rounded-2xl space-y-1 text-xs ${
                        isMe
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 ml-6'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {note.user_name} ({note.user_role})
                        </span>
                        <span>{new Date(note.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-normal leading-relaxed">
                        {note.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSubmitDiscussionNote} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Tulis masukan / telaah butir soal..."
                value={newDiscussionText}
                onChange={e => setNewDiscussionText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newDiscussionText.trim()}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all shrink-0"
                title="Kirim Catatan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Revoke Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Hapus Akses Kolaborasi?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Tautan kolaborasi ini akan dicabut. Anda atau rekan kolaborator tidak akan lagi memiliki akses terhubung.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteShareAction(deleteConfirmId.id, deleteConfirmId.type);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Ya, Hapus Akses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
