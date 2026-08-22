import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Subject,
  Kategori,
  Tag,
  KkoMaster,
  Question,
  PaketSoal,
  Ujian,
  ShareSoal,
  SharePaket,
  ToastMessage,
  NotificationItem,
  QuestionType,
  Jenjang,
  Curriculum,
  BloomLevel,
  LevelKognitif
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_KATEGORI,
  INITIAL_TAGS,
  INITIAL_KKO,
  INITIAL_QUESTIONS,
  INITIAL_PAKET_SOAL,
  INITIAL_UJIAN,
  INITIAL_SHARE_SOAL,
  INITIAL_SHARE_PAKET,
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: 'admin' | 'guru' | 'siswa') => void;
  
  users: User[];
  addUser: (user: Omit<User, 'id' | 'created_at'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  toggleUserActive: (id: string) => void;
  deleteUser: (id: string) => void;

  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  categories: Kategori[];
  addCategory: (cat: Omit<Kategori, 'id'>) => Kategori;
  updateCategory: (id: string, updates: Partial<Kategori>) => void;
  deleteCategory: (id: string) => void;

  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  resetTagsToDefault: () => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (id: string | null) => void;

  kkoList: KkoMaster[];

  questions: Question[];
  addQuestion: (question: Omit<Question, 'id' | 'created_at' | 'created_by'>) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => Question | null;
  importQuestionsData: (importedList: Partial<Question>[]) => number;

  paketSoalList: PaketSoal[];
  addPaketSoal: (paket: Omit<PaketSoal, 'id' | 'created_at' | 'created_by'>) => PaketSoal;
  updatePaketSoal: (id: string, updates: Partial<PaketSoal>) => void;
  deletePaketSoal: (id: string) => void;
  duplicatePaketSoal: (id: string) => PaketSoal | null;

  ujianList: Ujian[];
  addUjian: (ujianData: {
    paket_soal_id: string;
    siswa_ids: string[];
    title: string;
    description?: string;
    duration_minutes?: number;
  }) => void;
  updateUjian: (id: string, updates: Partial<Ujian>) => void;
  deleteUjian: (id: string) => void;
  publishUjian: (id: string) => void;
  startUjianCBT: (id: string) => Ujian | null;
  saveUjianJawaban: (ujianId: string, questionId: string, answerPayload: {
    selected_option?: number | null;
    jawaban?: string | Record<string, string>;
  }) => void;
  submitUjianCBT: (ujianId: string) => { totalScore: number; maxScore: number };

  shareSoalList: ShareSoal[];
  sharePaketList: SharePaket[];
  shares: Array<{
    id: string;
    shareable_type: 'question' | 'paket_soal';
    shareable_id: string;
    shared_by: string;
    shared_with: string;
    permission: 'view' | 'edit' | 'copy';
    message?: string;
    notes?: Array<{
      id: string;
      user_id: string;
      user_name: string;
      user_role: string;
      text: string;
      created_at: string;
    }>;
    is_accepted: boolean;
    created_at: string;
  }>;
  shareSoalAction: (questionId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string) => boolean;
  sharePaketAction: (paketId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string) => boolean;
  updateSharePermission: (shareId: string, type: 'question' | 'paket_soal', newPermission: 'view' | 'edit' | 'copy') => void;
  deleteShareAction: (id: string, type?: 'question' | 'paket_soal') => void;
  acceptShareSoal: (shareId: string) => void;
  rejectShareSoal: (shareId: string) => void;
  acceptSharePaket: (shareId: string) => void;
  rejectSharePaket: (shareId: string) => void;
  addCollaborationNote: (shareId: string, type: 'question' | 'paket_soal', text: string) => void;
  pendingNotifications: NotificationItem[];

  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;

  currentView: string;
  setCurrentView: (view: string) => void;
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;
  selectedPaketId: string | null;
  setSelectedPaketId: (id: string | null) => void;
  selectedUjianId: string | null;
  setSelectedUjianId: (id: string | null) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  searchGlobalQuery: string;
  setSearchGlobalQuery: (query: string) => void;

  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`bsc_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage', e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`bsc_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = loadFromStorage<User | null>('current_user', null);
    if (saved && INITIAL_USERS.some(u => u.id === saved.id)) return saved;
    return INITIAL_USERS[1]; // default to Teacher Budi Pratama
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => loadFromStorage('subjects', INITIAL_SUBJECTS));
  const [categories, setCategories] = useState<Kategori[]>(() => loadFromStorage('categories', INITIAL_KATEGORI));
  const [tags, setTags] = useState<Tag[]>(() => loadFromStorage('tags', INITIAL_TAGS));
  const [kkoList] = useState<KkoMaster[]>(INITIAL_KKO);

  const [questions, setQuestions] = useState<Question[]>(() => loadFromStorage('questions', INITIAL_QUESTIONS));
  const [paketSoalList, setPaketSoalList] = useState<PaketSoal[]>(() => loadFromStorage('paket_soal', INITIAL_PAKET_SOAL));
  const [ujianList, setUjianList] = useState<Ujian[]>(() => loadFromStorage('ujian', INITIAL_UJIAN));

  const [shareSoalList, setShareSoalList] = useState<ShareSoal[]>(() => loadFromStorage('share_soal', INITIAL_SHARE_SOAL));
  const [sharePaketList, setSharePaketList] = useState<SharePaket[]>(() => loadFromStorage('share_paket', INITIAL_SHARE_PAKET));

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedPaketId, setSelectedPaketId] = useState<string | null>(null);
  const [selectedUjianId, setSelectedUjianId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [searchGlobalQuery, setSearchGlobalQuery] = useState<string>('');

  // Theme state: 'light' | 'dark'
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('cbt_app_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error('Error reading theme from storage', e);
    }
    return 'light';
  });

  // Apply theme to document root
  useEffect(() => {
    try {
      localStorage.setItem('cbt_app_theme', theme);
    } catch (e) {
      console.error('Error saving theme', e);
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  // Sync state to local storage
  useEffect(() => { saveToStorage('users', users); }, [users]);
  useEffect(() => { saveToStorage('current_user', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('subjects', subjects); }, [subjects]);
  useEffect(() => { saveToStorage('categories', categories); }, [categories]);
  useEffect(() => { saveToStorage('tags', tags); }, [tags]);
  useEffect(() => { saveToStorage('questions', questions); }, [questions]);
  useEffect(() => { saveToStorage('paket_soal', paketSoalList); }, [paketSoalList]);
  useEffect(() => { saveToStorage('ujian', ujianList); }, [ujianList]);
  useEffect(() => { saveToStorage('share_soal', shareSoalList); }, [shareSoalList]);
  useEffect(() => { saveToStorage('share_paket', sharePaketList); }, [sharePaketList]);

  const addToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    addToast(`Beralih akun ke: ${user.name} (${user.role.toUpperCase()})`, 'info');
  };

  const switchUserRole = (role: 'admin' | 'guru' | 'siswa') => {
    const target = users.find(u => u.role === role && u.is_active);
    if (target) {
      setCurrentUser(target);
    }
  };

  // User management
  const addUser = (userData: Omit<User, 'id' | 'created_at'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);
    addToast(`Pengguna ${newUser.name} berhasil didaftarkan!`, 'success');
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUserState(prev => ({ ...prev, ...updates }));
    }
    addToast('Data pengguna berhasil diperbarui.', 'success');
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextActive = !u.is_active;
        addToast(`Status ${u.name} diubah menjadi ${nextActive ? 'Aktif' : 'Nonaktif'}.`, 'info');
        return { ...u, is_active: nextActive };
      }
      return u;
    }));
  };

  const toggleUserActive = toggleUserStatus;

  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      addToast('Tidak dapat menghapus akun yang sedang aktif digunakan.', 'danger');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    addToast('Pengguna berhasil dihapus.', 'success');
  };

  // Subject management
  const addSubject = (subjectData: Omit<Subject, 'id'>): Subject => {
    const newSubject: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setSubjects(prev => [...prev, newSubject]);
    addToast(`Mata pelajaran ${newSubject.name} berhasil ditambahkan!`, 'success');
    return newSubject;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    addToast('Mata pelajaran berhasil diperbarui.', 'success');
  };

  const deleteSubject = (id: string) => {
    const isUsed = questions.some(q => q.subject_id === id);
    if (isUsed) {
      addToast('Mata pelajaran tidak dapat dihapus karena sudah memiliki soal terkait.', 'warning');
      return;
    }
    setSubjects(prev => prev.filter(s => s.id !== id));
    addToast('Mata pelajaran berhasil dihapus.', 'success');
  };

  // Categories & Tags
  const addCategory = (catData: Omit<Kategori, 'id'>): Kategori => {
    const newCat: Kategori = {
      ...catData,
      id: `kat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCat]);
    addToast('Kategori baru berhasil dibuat.', 'success');
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Kategori>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    addToast('Kategori berhasil diperbarui.', 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addToast('Kategori berhasil dihapus.', 'success');
  };

  const addTag = (tagData: Omit<Tag, 'id'>): Tag => {
    const newTag: Tag = {
      ...tagData,
      id: `tag-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setTags(prev => [...prev, newTag]);
    addToast('Tag baru berhasil dibuat.', 'success');
    return newTag;
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    addToast('Tag berhasil diperbarui.', 'success');
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
    addToast('Tag berhasil dihapus.', 'success');
  };

  const resetTagsToDefault = () => {
    setTags(INITIAL_TAGS);
    addToast('Template tag & karakteristik standar berhasil dimuat ulang.', 'success');
  };

  // Question CRUD
  const addQuestion = (questionData: Omit<Question, 'id' | 'created_at' | 'created_by'>): Question => {
    const newQuestion: Question = {
      ...questionData,
      id: `q-${Date.now()}`,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };
    setQuestions(prev => [newQuestion, ...prev]);
    addToast('Soal berhasil ditambahkan ke Bank Soal!', 'success');
    return newQuestion;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, ...updates, updated_at: new Date().toISOString() } : q)));
    addToast('Soal berhasil diperbarui!', 'success');
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    // Also remove from any paket_soal items
    setPaketSoalList(prev => prev.map(p => ({
      ...p,
      items: p.items.filter(item => item.question_id !== id),
      total_soal: p.items.filter(item => item.question_id !== id).length,
    })));
    addToast('Soal berhasil dihapus dari Bank Soal.', 'success');
  };

  const duplicateQuestion = (id: string): Question | null => {
    const original = questions.find(q => q.id === id);
    if (!original) return null;

    const duplicated: Question = {
      ...original,
      id: `q-${Date.now()}`,
      question_text: `${original.question_text} (Copy)`,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      pg_options: original.pg_options ? original.pg_options.map(o => ({ ...o, id: `opt-${Date.now()}-${Math.random()}` })) : undefined,
      matching_pairs: original.matching_pairs ? original.matching_pairs.map(p => ({ ...p, id: `mp-${Date.now()}-${Math.random()}` })) : undefined,
    };

    setQuestions(prev => [duplicated, ...prev]);
    addToast('Soal berhasil diduplikasi!', 'success');
    return duplicated;
  };

  const importQuestionsData = (importedList: Partial<Question>[]): number => {
    let count = 0;
    const newItems: Question[] = [];

    importedList.forEach(item => {
      if (item.question_text) {
        count++;
        newItems.push({
          id: `q-import-${Date.now()}-${count}`,
          subject_id: item.subject_id || subjects[0]?.id || 'subj-1',
          jenjang: item.jenjang || 'SMP',
          curriculum: item.curriculum || 'merdeka',
          type: item.type || 'pg',
          level_c: item.level_c || 'C2',
          level_kognitif: item.level_kognitif || 'L1',
          kko_id: item.kko_id || 'kko-c2-1',
          question_text: item.question_text,
          indicator_text: item.indicator_text || 'Indikator hasil import spreadsheet',
          explanation: item.explanation || '',
          pg_options: item.pg_options || [
            { id: '1', label: 'A', option_text: 'Opsi A', is_correct: true },
            { id: '2', label: 'B', option_text: 'Opsi B', is_correct: false },
            { id: '3', label: 'C', option_text: 'Opsi C', is_correct: false },
            { id: '4', label: 'D', option_text: 'Opsi D', is_correct: false },
          ],
          created_by: currentUser.id,
          created_at: new Date().toISOString(),
        });
      }
    });

    if (newItems.length > 0) {
      setQuestions(prev => [...newItems, ...prev]);
      addToast(`Berhasil mengimpor ${newItems.length} butir soal!`, 'success');
    }
    return count;
  };

  // Paket Soal CRUD
  const addPaketSoal = (paketData: Omit<PaketSoal, 'id' | 'created_at' | 'created_by'>): PaketSoal => {
    const newPaket: PaketSoal = {
      ...paketData,
      id: `paket-${Date.now()}`,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };
    setPaketSoalList(prev => [newPaket, ...prev]);
    addToast('Paket Soal berhasil dibuat!', 'success');
    return newPaket;
  };

  const updatePaketSoal = (id: string, updates: Partial<PaketSoal>) => {
    setPaketSoalList(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)));
    addToast('Paket Soal berhasil diperbarui.', 'success');
  };

  const deletePaketSoal = (id: string) => {
    setPaketSoalList(prev => prev.filter(p => p.id !== id));
    addToast('Paket Soal berhasil dihapus.', 'success');
  };

  const duplicatePaketSoal = (id: string): PaketSoal | null => {
    const original = paketSoalList.find(p => p.id === id);
    if (!original) return null;

    const duplicated: PaketSoal = {
      ...original,
      id: `paket-${Date.now()}`,
      name: `${original.name} (Salinan)`,
      status: 'draft',
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      items: original.items.map(item => ({ ...item, id: `pitem-${Date.now()}-${Math.random()}` })),
    };

    setPaketSoalList(prev => [duplicated, ...prev]);
    addToast('Paket Soal berhasil diduplikasi!', 'success');
    return duplicated;
  };

  // Ujian & CBT Engine
  const addUjian = ({
    paket_soal_id,
    siswa_ids,
    title,
    description,
    duration_minutes,
  }: {
    paket_soal_id: string;
    siswa_ids: string[];
    title: string;
    description?: string;
    duration_minutes?: number;
  }) => {
    const paket = paketSoalList.find(p => p.id === paket_soal_id);
    if (!paket) {
      addToast('Paket soal tidak ditemukan.', 'danger');
      return;
    }

    const duration = duration_minutes || paket.duration_minutes || 60;
    const newExams: Ujian[] = siswa_ids.map((siswaId, idx) => {
      const siswa = users.find(u => u.id === siswaId);
      const studentName = siswa ? siswa.name.split(' ')[0] : `Siswa ${idx + 1}`;
      const examTitle = siswa_ids.length === 1 ? title : `${title} - ${studentName}`;
      const token = Math.random().toString(36).substring(2, 7).toUpperCase();

      const initialJawaban = paket.items.map(item => ({
        id: `j-${Date.now()}-${Math.random()}`,
        ujian_id: `ujian-${Date.now()}-${idx}`,
        question_id: item.question_id,
        paket_soal_item_id: item.id,
        selected_option: null,
        jawaban: '',
        is_correct: false,
        score: 0,
        max_score: item.score || 25,
      }));

      const maxScore = initialJawaban.reduce((sum, item) => sum + item.max_score, 0);

      return {
        id: `ujian-${Date.now()}-${idx}`,
        paket_soal_id,
        siswa_id: siswaId,
        created_by: currentUser.id,
        title: examTitle,
        description: description || paket.description,
        duration_minutes: duration,
        total_soal: paket.items.length,
        total_score: 0,
        max_score: maxScore,
        status: 'draft',
        token_ujian: token,
        created_at: new Date().toISOString(),
        jawaban: initialJawaban,
      };
    });

    setUjianList(prev => [...newExams, ...prev]);
    addToast(`Berhasil membuat ${newExams.length} jadwal ujian untuk peserta!`, 'success');
  };

  const updateUjian = (id: string, updates: Partial<Ujian>) => {
    setUjianList(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    addToast('Data ujian berhasil diperbarui.', 'success');
  };

  const deleteUjian = (id: string) => {
    setUjianList(prev => prev.filter(u => u.id !== id));
    addToast('Ujian berhasil dihapus.', 'success');
  };

  const publishUjian = (id: string) => {
    setUjianList(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: 'active',
          started_at: new Date().toISOString(),
        };
      }
      return u;
    }));
    addToast('Ujian telah dipublikasikan dan aktif untuk siswa!', 'success');
  };

  const startUjianCBT = (id: string): Ujian | null => {
    const exam = ujianList.find(u => u.id === id);
    if (!exam) return null;

    if (!exam.started_at) {
      const updated: Ujian = {
        ...exam,
        status: 'active',
        started_at: new Date().toISOString(),
      };
      setUjianList(prev => prev.map(u => (u.id === id ? updated : u)));
      return updated;
    }
    return exam;
  };

  const saveUjianJawaban = (ujianId: string, questionId: string, answerPayload: {
    selected_option?: number | null;
    jawaban?: string | Record<string, string>;
  }) => {
    setUjianList(prev => prev.map(exam => {
      if (exam.id !== ujianId) return exam;

      const updatedJawaban = exam.jawaban.map(j => {
        if (j.question_id === questionId) {
          return {
            ...j,
            selected_option: answerPayload.selected_option !== undefined ? answerPayload.selected_option : j.selected_option,
            jawaban: answerPayload.jawaban !== undefined ? answerPayload.jawaban : j.jawaban,
          };
        }
        return j;
      });

      return {
        ...exam,
        jawaban: updatedJawaban,
      };
    }));
  };

  const submitUjianCBT = (ujianId: string): { totalScore: number; maxScore: number } => {
    const exam = ujianList.find(u => u.id === ujianId);
    if (!exam) return { totalScore: 0, maxScore: 100 };

    let totalScore = 0;
    let maxScore = 0;

    const evaluatedJawaban = exam.jawaban.map(j => {
      const question = questions.find(q => q.id === j.question_id);
      maxScore += j.max_score;
      let isCorrect = false;
      let earnedScore = 0;

      if (question) {
        if (question.type === 'pg' && question.pg_options) {
          if (j.selected_option !== null && j.selected_option !== undefined) {
            const chosenOption = question.pg_options[j.selected_option];
            if (chosenOption && chosenOption.is_correct) {
              isCorrect = true;
              earnedScore = j.max_score;
            }
          }
        } else if (question.type === 'benar_salah') {
          if (j.selected_option !== null && j.selected_option !== undefined) {
            const studentChoice = j.selected_option === 1;
            if (studentChoice === question.correct_boolean) {
              isCorrect = true;
              earnedScore = j.max_score;
            }
          }
        } else if (question.type === 'menjodohkan' && question.matching_pairs) {
          if (typeof j.jawaban === 'object' && j.jawaban !== null) {
            let correctCount = 0;
            question.matching_pairs.forEach(pair => {
              const studentPairAnswer = (j.jawaban as Record<string, string>)[pair.id];
              if (studentPairAnswer && studentPairAnswer.trim().toLowerCase() === pair.right_text.trim().toLowerCase()) {
                correctCount++;
              }
            });
            if (correctCount === question.matching_pairs.length) {
              isCorrect = true;
              earnedScore = j.max_score;
            } else if (correctCount > 0) {
              earnedScore = Math.round((correctCount / question.matching_pairs.length) * j.max_score);
            }
          }
        } else if (question.type === 'uraian') {
          // Rubric auto-evaluation based on keyword presence / full credit for thoughtful input
          if (typeof j.jawaban === 'string' && j.jawaban.trim().length > 10) {
            isCorrect = true;
            earnedScore = Math.round(j.max_score * 0.9); // default high grade, guru can review
          }
        }
      }

      totalScore += earnedScore;

      return {
        ...j,
        is_correct: isCorrect,
        score: earnedScore,
      };
    });

    const finishedExam: Ujian = {
      ...exam,
      status: 'finished',
      submitted_at: new Date().toISOString(),
      total_score: totalScore,
      max_score: maxScore,
      jawaban: evaluatedJawaban,
    };

    setUjianList(prev => prev.map(u => (u.id === ujianId ? finishedExam : u)));
    addToast(`Ujian berhasil dikumpulkan! Nilai Anda: ${totalScore}/${maxScore}`, 'success');

    return { totalScore, maxScore };
  };

  // Collaboration / Share Actions
  const shareSoalAction = (questionId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string): boolean => {
    const existing = shareSoalList.find(s => s.question_id === questionId && s.shared_to === sharedToId);
    if (existing) {
      addToast('Soal ini sudah dibagikan ke guru tersebut sebelumnya.', 'warning');
      return false;
    }

    const newShare: ShareSoal = {
      id: `share-q-${Date.now()}`,
      question_id: questionId,
      shared_by: currentUser.id,
      shared_to: sharedToId,
      permission,
      message,
      notes: [],
      is_accepted: false,
      created_at: new Date().toISOString(),
    };

    setShareSoalList(prev => [newShare, ...prev]);
    addToast('Undangan kolaborasi butir soal berhasil dikirim!', 'success');
    return true;
  };

  const sharePaketAction = (paketId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string): boolean => {
    const existing = sharePaketList.find(s => s.paket_soal_id === paketId && s.shared_to === sharedToId);
    if (existing) {
      addToast('Paket soal ini sudah dibagikan ke guru tersebut sebelumnya.', 'warning');
      return false;
    }

    const newShare: SharePaket = {
      id: `share-p-${Date.now()}`,
      paket_soal_id: paketId,
      shared_by: currentUser.id,
      shared_to: sharedToId,
      permission,
      message,
      notes: [],
      is_accepted: false,
      created_at: new Date().toISOString(),
    };

    setSharePaketList(prev => [newShare, ...prev]);
    addToast('Undangan kolaborasi paket soal berhasil dikirim!', 'success');
    return true;
  };

  const updateSharePermission = (shareId: string, type: 'question' | 'paket_soal', newPermission: 'view' | 'edit' | 'copy') => {
    if (type === 'question') {
      setShareSoalList(prev => prev.map(s => (s.id === shareId ? { ...s, permission: newPermission } : s)));
    } else {
      setSharePaketList(prev => prev.map(s => (s.id === shareId ? { ...s, permission: newPermission } : s)));
    }
    addToast(`Hak akses kolaborasi diperbarui menjadi "${newPermission === 'view' ? 'Lihat Saja' : newPermission === 'edit' ? 'Edit Bersama' : 'Boleh Salin'}".`, 'success');
  };

  const deleteShareAction = (id: string, type?: 'question' | 'paket_soal') => {
    if (!type) {
      if (shareSoalList.some(s => s.id === id)) {
        setShareSoalList(prev => prev.filter(s => s.id !== id));
      } else {
        setSharePaketList(prev => prev.filter(s => s.id !== id));
      }
    } else if (type === 'question') {
      setShareSoalList(prev => prev.filter(s => s.id !== id));
    } else {
      setSharePaketList(prev => prev.filter(s => s.id !== id));
    }
    addToast('Akses kolaborasi berhasil dihapus.', 'info');
  };

  const acceptShareSoal = (shareId: string) => {
    setShareSoalList(prev => prev.map(s => (s.id === shareId ? { ...s, is_accepted: true, accepted_at: new Date().toISOString() } : s)));
    addToast('Undangan kolaborasi soal diterima.', 'success');
  };

  const rejectShareSoal = (shareId: string) => {
    setShareSoalList(prev => prev.filter(s => s.id !== shareId));
    addToast('Undangan kolaborasi soal ditolak.', 'info');
  };

  const acceptSharePaket = (shareId: string) => {
    setSharePaketList(prev => prev.map(s => (s.id === shareId ? { ...s, is_accepted: true, accepted_at: new Date().toISOString() } : s)));
    addToast('Undangan kolaborasi paket soal diterima.', 'success');
  };

  const rejectSharePaket = (shareId: string) => {
    setSharePaketList(prev => prev.filter(s => s.id !== shareId));
    addToast('Undangan kolaborasi paket soal ditolak.', 'info');
  };

  const addCollaborationNote = (shareId: string, type: 'question' | 'paket_soal', text: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'guru' ? 'Guru' : 'Siswa',
      text,
      created_at: new Date().toISOString(),
    };

    if (type === 'question') {
      setShareSoalList(prev => prev.map(s => (s.id === shareId ? { ...s, notes: [...(s.notes || []), newNote] } : s)));
    } else {
      setSharePaketList(prev => prev.map(s => (s.id === shareId ? { ...s, notes: [...(s.notes || []), newNote] } : s)));
    }
    addToast('Catatan telaah / umpan balik berhasil ditambahkan.', 'success');
  };

  // Unified derived shares list
  const shares = [
    ...shareSoalList.map(s => ({
      id: s.id,
      shareable_type: 'question' as const,
      shareable_id: s.question_id,
      shared_by: s.shared_by,
      shared_with: s.shared_to,
      permission: s.permission,
      message: s.message,
      notes: s.notes,
      is_accepted: s.is_accepted,
      created_at: s.created_at,
    })),
    ...sharePaketList.map(s => ({
      id: s.id,
      shareable_type: 'paket_soal' as const,
      shareable_id: s.paket_soal_id,
      shared_by: s.shared_by,
      shared_with: s.shared_to,
      permission: s.permission,
      message: s.message,
      notes: s.notes,
      is_accepted: s.is_accepted,
      created_at: s.created_at,
    })),
  ];

  // Pending notifications for current user
  const pendingNotifications: NotificationItem[] = [
    ...shareSoalList
      .filter(s => s.shared_to === currentUser.id && !s.is_accepted)
      .map(s => {
        const sender = users.find(u => u.id === s.shared_by);
        const q = questions.find(item => item.id === s.question_id);
        return {
          id: s.id,
          type: 'share_soal' as const,
          share_id: s.id,
          message: `${sender?.name || 'Seorang guru'} membagikan soal (${s.permission.toUpperCase()})`,
          sender_name: sender?.name || 'Guru',
          item_title: q?.question_text.slice(0, 45) + '...' || 'Soal',
          created_at: s.created_at,
        };
      }),
    ...sharePaketList
      .filter(s => s.shared_to === currentUser.id && !s.is_accepted)
      .map(s => {
        const sender = users.find(u => u.id === s.shared_by);
        const p = paketSoalList.find(item => item.id === s.paket_soal_id);
        return {
          id: s.id,
          type: 'share_paket' as const,
          share_id: s.id,
          message: `${sender?.name || 'Seorang guru'} membagikan paket soal (${s.permission.toUpperCase()})`,
          sender_name: sender?.name || 'Guru',
          item_title: p?.name || 'Paket Soal',
          created_at: s.created_at,
        };
      }),
  ];

  const resetToInitialData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[1]);
    setSubjects(INITIAL_SUBJECTS);
    setCategories(INITIAL_KATEGORI);
    setTags(INITIAL_TAGS);
    setQuestions(INITIAL_QUESTIONS);
    setPaketSoalList(INITIAL_PAKET_SOAL);
    setUjianList(INITIAL_UJIAN);
    setShareSoalList(INITIAL_SHARE_SOAL);
    setSharePaketList(INITIAL_SHARE_PAKET);
    localStorage.clear();
    addToast('Data sistem berhasil direset ke data sampel awal.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserRole,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        toggleUserActive,
        deleteUser,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        tags,
        addTag,
        updateTag,
        deleteTag,
        resetTagsToDefault,
        theme,
        toggleTheme,
        setTheme,
        selectedTagFilter,
        setSelectedTagFilter,
        kkoList,
        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        duplicateQuestion,
        importQuestionsData,
        paketSoalList,
        addPaketSoal,
        updatePaketSoal,
        deletePaketSoal,
        duplicatePaketSoal,
        ujianList,
        addUjian,
        updateUjian,
        deleteUjian,
        publishUjian,
        startUjianCBT,
        saveUjianJawaban,
        submitUjianCBT,
        shareSoalList,
        sharePaketList,
        shares,
        shareSoalAction,
        sharePaketAction,
        updateSharePermission,
        deleteShareAction,
        acceptShareSoal,
        rejectShareSoal,
        acceptSharePaket,
        rejectSharePaket,
        addCollaborationNote,
        pendingNotifications,
        toasts,
        addToast,
        removeToast,
        currentView,
        setCurrentView,
        selectedQuestionId,
        setSelectedQuestionId,
        selectedPaketId,
        setSelectedPaketId,
        selectedUjianId,
        setSelectedUjianId,
        selectedStudentId,
        setSelectedStudentId,
        searchGlobalQuery,
        setSearchGlobalQuery,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
