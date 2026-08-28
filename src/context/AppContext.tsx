import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  AnalisisData,
  QuestionType,
  Jenjang,
  Curriculum,
  BloomLevel,
  LevelKognitif,
  DashboardData,
  CollaborationNote,
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
import api, { apiErrorMessage } from '../lib/api';
import { authApi } from '../lib/api/auth';
import { routeSelectionFromPath } from '../lib/appRoutes';
import { canAccessView, landingViewForRole } from '../lib/roleAccess';
import { useRouter } from './RouterContext';
import { analisisApi } from '../lib/api/analisis';
import { categoriesApi } from '../lib/api/categories';
import { dashboardApi } from '../lib/api/dashboard';
import { kkoApi } from '../lib/api/kko';
import { paketSoalApi } from '../lib/api/paketSoal';
import { meApi, ProfilePayload } from '../lib/api/profile';
import { questionsApi } from '../lib/api/questions';
import { shareApi } from '../lib/api/share';
import { subjectsApi } from '../lib/api/subjects';
import { tagsApi } from '../lib/api/tags';
import { ujianApi } from '../lib/api/ujian';
import { usersApi } from '../lib/api/users';

const bootstrapUser = window.__BOOTSTRAP__?.user ?? null;
const hasSpaBootstrap = Boolean(document.getElementById('spa-bootstrap'));
/** True when the SPA is served by Laravel with a real session. */
const bootstrapped = Boolean(bootstrapUser);
const shouldRedirectUnauthenticated = hasSpaBootstrap && !bootstrapUser;
type UserFormPayload = Omit<User, 'id' | 'created_at'> & {
  password?: string;
  password_confirmation?: string;
};

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  shouldRedirectUnauthenticated: boolean;
  updateProfile: (profile: ProfilePayload) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  updatePassword: (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  
  users: User[];
  addUser: (user: UserFormPayload) => User | Promise<User>;
  updateUser: (id: string, updates: Partial<UserFormPayload>) => void | Promise<void>;
  toggleUserStatus: (id: string) => void | Promise<void>;
  toggleUserActive: (id: string) => void | Promise<void>;
  deleteUser: (id: string) => void | Promise<void>;

  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => Subject | Promise<Subject>;
  updateSubject: (id: string, updates: Partial<Subject>) => void | Promise<void>;
  deleteSubject: (id: string) => void | Promise<void>;

  categories: Kategori[];
  addCategory: (cat: Omit<Kategori, 'id'>) => Kategori | Promise<Kategori>;
  updateCategory: (id: string, updates: Partial<Kategori>) => void | Promise<void>;
  deleteCategory: (id: string) => void | Promise<void>;

  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => Tag | Promise<Tag>;
  updateTag: (id: string, updates: Partial<Tag>) => void | Promise<void>;
  deleteTag: (id: string) => void | Promise<void>;
  resetTagsToDefault: () => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (id: string | null) => void;

  kkoList: KkoMaster[];

  questions: Question[];
  addQuestion: (question: Omit<Question, 'id' | 'created_at' | 'created_by'>) => Question | Promise<Question>;
  updateQuestion: (id: string, updates: Partial<Question>) => void | Promise<void>;
  deleteQuestion: (id: string) => void | Promise<void>;
  duplicateQuestion: (id: string) => Question | null | Promise<Question | null>;
  importQuestionsData: (importedList: Partial<Question>[], file?: File | null) => number | Promise<number>;

  paketSoalList: PaketSoal[];
  addPaketSoal: (paket: Omit<PaketSoal, 'id' | 'created_at' | 'created_by'>) => PaketSoal | Promise<PaketSoal>;
  updatePaketSoal: (id: string, updates: Partial<PaketSoal>) => void | Promise<void>;
  deletePaketSoal: (id: string) => void | Promise<void>;
  duplicatePaketSoal: (id: string) => PaketSoal | null | Promise<PaketSoal | null>;

  ujianList: Ujian[];
  addUjian: (ujianData: {
    paket_soal_id: string;
    siswa_ids: string[];
    title: string;
    description?: string;
    duration_minutes?: number;
  }) => void | Promise<void>;
  updateUjian: (id: string, updates: Partial<Ujian>) => void | Promise<void>;
  deleteUjian: (id: string) => void | Promise<void>;
  publishUjian: (id: string) => void | Promise<void>;
  startUjianCBT: (id: string) => Ujian | null | Promise<Ujian | null>;
  saveUjianJawaban: (ujianId: string, questionId: string, answerPayload: {
    selected_option?: number | null;
    selected_option_id?: string | null;
    jawaban?: string | Record<string, string>;
  }) => void | Promise<void>;
  submitUjianCBT: (ujianId: string) => { totalScore: number; maxScore: number } | Promise<{ totalScore: number; maxScore: number }>;

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
  shareSoalAction: (questionId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string) => boolean | Promise<boolean>;
  sharePaketAction: (paketId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string) => boolean | Promise<boolean>;
  updateSharePermission: (shareId: string, type: 'question' | 'paket_soal', newPermission: 'view' | 'edit' | 'copy') => void | Promise<void>;
  deleteShareAction: (id: string, type?: 'question' | 'paket_soal') => void | Promise<void>;
  acceptShareSoal: (shareId: string) => void | Promise<void>;
  rejectShareSoal: (shareId: string) => void | Promise<void>;
  acceptSharePaket: (shareId: string) => void | Promise<void>;
  rejectSharePaket: (shareId: string) => void | Promise<void>;
  addCollaborationNote: (shareId: string, type: 'question' | 'paket_soal', text: string) => CollaborationNote | Promise<CollaborationNote | void> | void;
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
  isDataLoading: boolean;
  dataLoadError: string | null;
  refreshServerData: () => Promise<void>;
  dashboardData: DashboardData | null;
  analisisData: AnalisisData | null;
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
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(() => (bootstrapped ? [] : loadFromStorage('users', INITIAL_USERS)));
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    if (bootstrapUser) {
      return {
        id: bootstrapUser.id,
        name: bootstrapUser.name,
        email: bootstrapUser.email,
        role: bootstrapUser.role,
        is_active: bootstrapUser.is_active ?? true,
        created_at: new Date().toISOString(),
      };
    }
    return INITIAL_USERS[1]; // default to Teacher Budi Pratama
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => (bootstrapped ? [] : loadFromStorage('subjects', INITIAL_SUBJECTS)));
  const [categories, setCategories] = useState<Kategori[]>(() => (bootstrapped ? [] : loadFromStorage('categories', INITIAL_KATEGORI)));
  const [tags, setTags] = useState<Tag[]>(() => (bootstrapped ? [] : loadFromStorage('tags', INITIAL_TAGS)));
  const [kkoList, setKkoList] = useState<KkoMaster[]>(() => (bootstrapped ? [] : INITIAL_KKO));

  const [questions, setQuestions] = useState<Question[]>(() => (bootstrapped ? [] : INITIAL_QUESTIONS));
  const [paketSoalList, setPaketSoalList] = useState<PaketSoal[]>(() => (bootstrapped ? [] : INITIAL_PAKET_SOAL));
  const [ujianList, setUjianList] = useState<Ujian[]>(() => (bootstrapped ? [] : INITIAL_UJIAN));

  const [shareSoalList, setShareSoalList] = useState<ShareSoal[]>(() => (bootstrapped ? [] : INITIAL_SHARE_SOAL));
  const [sharePaketList, setSharePaketList] = useState<SharePaket[]>(() => (bootstrapped ? [] : INITIAL_SHARE_PAKET));

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const currentView = router.currentView;
  const initialRouteSelection = routeSelectionFromPath(router.pathname);
  const [selectedQuestionId, setSelectedQuestionIdState] = useState<string | null>(initialRouteSelection.questionId);
  const selectedQuestionIdRef = useRef<string | null>(initialRouteSelection.questionId);
  const [selectedPaketId, setSelectedPaketIdState] = useState<string | null>(initialRouteSelection.paketId);
  const selectedPaketIdRef = useRef<string | null>(initialRouteSelection.paketId);
  const [selectedUjianId, setSelectedUjianIdState] = useState<string | null>(() => {
    if (initialRouteSelection.ujianId) return initialRouteSelection.ujianId;
    try {
      return sessionStorage.getItem('cbt_active_ujian_id');
    } catch {
      return null;
    }
  });
  const selectedUjianIdRef = useRef<string | null>(selectedUjianId);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [searchGlobalQuery, setSearchGlobalQuery] = useState<string>('');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(bootstrapped);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analisisData, setAnalisisData] = useState<AnalisisData | null>(null);

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
    // Keep Bootstrap-based views in sync with the same theme toggle.
    root.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  // Sync state to local storage
  useEffect(() => { if (!bootstrapped) saveToStorage('users', users); }, [users]);
  useEffect(() => { if (!bootstrapped) saveToStorage('subjects', subjects); }, [subjects]);
  useEffect(() => { if (!bootstrapped) saveToStorage('categories', categories); }, [categories]);
  useEffect(() => { if (!bootstrapped) saveToStorage('tags', tags); }, [tags]);
  useEffect(() => { if (!bootstrapped) saveToStorage('questions', questions); }, [questions]);
  useEffect(() => { if (!bootstrapped) saveToStorage('paket_soal', paketSoalList); }, [paketSoalList]);
  useEffect(() => { if (!bootstrapped) saveToStorage('ujian', ujianList); }, [ujianList]);
  useEffect(() => { if (!bootstrapped) saveToStorage('share_soal', shareSoalList); }, [shareSoalList]);
  useEffect(() => { if (!bootstrapped) saveToStorage('share_paket', sharePaketList); }, [sharePaketList]);

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

  const settledValue = <T,>(result: PromiseSettledResult<T>): T | null => (
    result.status === 'fulfilled' ? result.value : null
  );

  const settledErrors = (results: PromiseSettledResult<unknown>[]): string[] => (
    results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => apiErrorMessage(result.reason))
  );

  const refreshServerData = async (): Promise<void> => {
    if (!bootstrapped) {
      return;
    }

    setIsDataLoading(true);
    setDataLoadError(null);

    if (currentUser.role === 'siswa') {
      try {
        const results = await Promise.allSettled([authApi.me(), dashboardApi.show(), ujianApi.mine()]);
        const [serverUser, serverDashboard, serverUjian] = results;
        const loadedUser = settledValue(serverUser);

        if (loadedUser) {
          setCurrentUserState(loadedUser);
          setUsers([loadedUser]);
        }
        const loadedDashboard = settledValue(serverDashboard);
        if (loadedDashboard) setDashboardData(loadedDashboard);

        const loadedUjian = settledValue(serverUjian);
        if (loadedUjian) setUjianList(loadedUjian);

        const errors = settledErrors(results);
        if (errors.length) {
          if (!loadedDashboard) setDataLoadError(errors[0]);
          addToast(errors[0], 'danger');
        }
      } catch (error) {
        const message = apiErrorMessage(error);
        setDataLoadError(message);
        addToast(message, 'danger');
      } finally {
        setIsDataLoading(false);
      }
      return;
    }

    try {
      const results = await Promise.allSettled([
        authApi.me(),
        dashboardApi.show(),
        currentUser.role === 'admin' ? usersApi.list() : usersApi.options(),
        subjectsApi.list(),
        categoriesApi.list(),
        tagsApi.list(),
        kkoApi.list(),
        questionsApi.list(),
        paketSoalApi.list(),
        ujianApi.list(),
        shareApi.list(),
        analisisApi.summary(),
      ]);

      const [
        serverUser,
        serverDashboard,
        serverUsers,
        serverSubjects,
        serverCategories,
        serverTags,
        serverKko,
        serverQuestions,
        serverPaketSoal,
        serverUjian,
        serverShares,
        serverAnalisis,
      ] = results;

      const loadedUser = settledValue(serverUser);
      if (loadedUser) setCurrentUserState(loadedUser);

      const loadedDashboard = settledValue(serverDashboard);
      if (loadedDashboard) setDashboardData(loadedDashboard);

      const loadedAnalisis = settledValue(serverAnalisis);
      if (loadedAnalisis) setAnalisisData(loadedAnalisis);

      const loadedUsers = settledValue(serverUsers);
      if (loadedUsers) setUsers(loadedUsers);

      const loadedSubjects = settledValue(serverSubjects);
      if (loadedSubjects) setSubjects(loadedSubjects);

      const loadedCategories = settledValue(serverCategories);
      if (loadedCategories) setCategories(loadedCategories);

      const loadedTags = settledValue(serverTags);
      if (loadedTags) setTags(loadedTags);

      const loadedKko = settledValue(serverKko);
      if (loadedKko) setKkoList(loadedKko);

      const loadedQuestions = settledValue(serverQuestions);
      if (loadedQuestions) setQuestions(loadedQuestions);

      const loadedPaketSoal = settledValue(serverPaketSoal);
      if (loadedPaketSoal) setPaketSoalList(loadedPaketSoal);

      const loadedUjian = settledValue(serverUjian);
      if (loadedUjian) setUjianList(loadedUjian);

      const loadedShares = settledValue(serverShares);
      if (loadedShares) {
        setShareSoalList(loadedShares.soal);
        setSharePaketList(loadedShares.paket);
      }

      const errors = settledErrors(results);
      if (errors.length) {
        if (!loadedDashboard) setDataLoadError(errors[0]);
        addToast(errors[0], 'danger');
      }
    } catch (error) {
      const message = apiErrorMessage(error);
      setDataLoadError(message);
      addToast(message, 'danger');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Hydrate API-backed resources from Laravel when running inside the SPA shell.
  useEffect(() => {
    if (!bootstrapped) return;
    refreshServerData().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedQuestionId = (id: string | null) => {
    selectedQuestionIdRef.current = id;
    setSelectedQuestionIdState(id);
  };

  const setSelectedPaketId = (id: string | null) => {
    selectedPaketIdRef.current = id;
    setSelectedPaketIdState(id);
  };

  const setSelectedUjianId = (id: string | null) => {
    selectedUjianIdRef.current = id;
    setSelectedUjianIdState(id);
    try {
      if (id) {
        sessionStorage.setItem('cbt_active_ujian_id', id);
      } else {
        sessionStorage.removeItem('cbt_active_ujian_id');
      }
    } catch {
      // Session storage can be unavailable in private browsing modes.
    }
  };

  const setCurrentView = (view: string) => {
    const nextView = canAccessView(view, currentUser.role) ? view : landingViewForRole(currentUser.role);
    if (nextView !== view) {
      addToast('Menu tersebut tidak tersedia untuk role akun Anda.', 'warning');
    }

    router.navigateToView(nextView, {
      questionId: selectedQuestionIdRef.current,
      paketId: selectedPaketIdRef.current,
      ujianId: selectedUjianIdRef.current,
    });
  };

  useEffect(() => {
    const selection = routeSelectionFromPath(router.pathname);
    setSelectedQuestionId(selection.questionId);
    setSelectedPaketId(selection.paketId);
    if (selection.ujianId) {
      setSelectedUjianId(selection.ujianId);
    }
  }, [router.pathname]);

  const updateProfile = async (profile: ProfilePayload): Promise<void> => {
    if (!bootstrapped) {
      setCurrentUserState(prev => ({ ...prev, ...profile }));
      setUsers(prev => prev.map(user => (user.id === currentUser.id ? { ...user, ...profile } : user)));
      addToast('Profil berhasil diperbarui.', 'success');
      return;
    }

    try {
      const updated = await meApi.updateProfile(profile);
      setCurrentUserState(prev => ({ ...prev, ...updated }));
      setUsers(prev => prev.map(user => (user.id === updated.id ? updated : user)));
      addToast('Profil berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updateAvatar = async (file: File): Promise<void> => {
    if (!bootstrapped) {
      const avatar = URL.createObjectURL(file);
      setCurrentUserState(prev => ({ ...prev, avatar }));
      setUsers(prev => prev.map(user => (user.id === currentUser.id ? { ...user, avatar } : user)));
      addToast('Foto profil berhasil diperbarui.', 'success');
      return;
    }

    try {
      const updated = await meApi.updateAvatar(file);
      setCurrentUserState(prev => ({ ...prev, ...updated }));
      setUsers(prev => prev.map(user => (user.id === updated.id ? updated : user)));
      addToast('Foto profil berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updatePassword = async (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    if (!bootstrapped) {
      addToast('Password demo berhasil diperbarui.', 'success');
      return;
    }

    try {
      await meApi.updatePassword(payload);
      addToast('Password berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  // User management
  const addUser = (userData: UserFormPayload): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);
    addToast(`Pengguna ${newUser.name} berhasil didaftarkan!`, 'success');
    return newUser;
  };

  const addUserApi = async (userData: UserFormPayload): Promise<User> => {
    try {
      const newUser = await usersApi.create(userData);
      setUsers(prev => [newUser, ...prev]);
      addToast(`Pengguna ${newUser.name} berhasil didaftarkan!`, 'success');
      return newUser;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUserState(prev => ({ ...prev, ...updates }));
    }
    addToast('Data pengguna berhasil diperbarui.', 'success');
  };

  const updateUserApi = async (id: string, updates: Partial<UserFormPayload>): Promise<void> => {
    const current = users.find(u => u.id === id);
    if (!current) return;
    try {
      const updated = await usersApi.update(id, { ...current, ...updates });
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      if (currentUser.id === id) {
        setCurrentUserState(prev => ({ ...prev, ...updated }));
      }
      addToast('Data pengguna berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const toggleUserStatusApi = async (id: string): Promise<void> => {
    try {
      const updated = await usersApi.toggleStatus(id);
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      addToast(`Status ${updated.name} diubah menjadi ${updated.is_active ? 'Aktif' : 'Nonaktif'}.`, 'info');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      addToast('Tidak dapat menghapus akun yang sedang aktif digunakan.', 'danger');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    addToast('Pengguna berhasil dihapus.', 'success');
  };

  const deleteUserApi = async (id: string): Promise<void> => {
    if (id === currentUser.id) {
      addToast('Tidak dapat menghapus akun yang sedang aktif digunakan.', 'danger');
      return;
    }

    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      addToast('Pengguna berhasil dihapus.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const addSubjectApi = async (subjectData: Omit<Subject, 'id'>): Promise<Subject> => {
    try {
      const newSubject = await subjectsApi.create(subjectData);
      setSubjects(prev => [...prev, newSubject]);
      addToast(`Mata pelajaran ${newSubject.name} berhasil ditambahkan!`, 'success');
      return newSubject;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    addToast('Mata pelajaran berhasil diperbarui.', 'success');
  };

  const updateSubjectApi = async (id: string, updates: Partial<Subject>): Promise<void> => {
    const current = subjects.find(s => s.id === id);
    if (!current) return;
    try {
      const updated = await subjectsApi.update(id, { ...current, ...updates });
      setSubjects(prev => prev.map(s => (s.id === id ? updated : s)));
      addToast('Mata pelajaran berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const deleteSubjectApi = async (id: string): Promise<void> => {
    try {
      await subjectsApi.delete(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      addToast('Mata pelajaran berhasil dihapus.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const addCategoryApi = async (catData: Omit<Kategori, 'id'>): Promise<Kategori> => {
    try {
      const newCat = await categoriesApi.create(catData);
      setCategories(prev => [...prev, newCat]);
      addToast('Kategori baru berhasil dibuat.', 'success');
      return newCat;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updateCategory = (id: string, updates: Partial<Kategori>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    addToast('Kategori berhasil diperbarui.', 'success');
  };

  const updateCategoryApi = async (id: string, updates: Partial<Kategori>): Promise<void> => {
    const current = categories.find(c => c.id === id);
    if (!current) return;
    try {
      const updated = await categoriesApi.update(id, { ...current, ...updates });
      setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
      addToast('Kategori berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addToast('Kategori berhasil dihapus.', 'success');
  };

  const deleteCategoryApi = async (id: string): Promise<void> => {
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      addToast('Kategori berhasil dihapus.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  // API-backed tag CRUD (active when the SPA runs inside Laravel session).
  const updateTagLocal = (id: string, updates: Partial<Tag>) => {
    setTags(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    addToast('Tag berhasil diperbarui.', 'success');
  };

  const deleteTagLocal = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
    addToast('Tag berhasil dihapus.', 'success');
  };

  const addTagApi = async (tagData: Omit<Tag, 'id'>): Promise<Tag> => {
    try {
      const newTag = await tagsApi.create(tagData);
      setTags(prev => [...prev, newTag]);
      addToast('Tag baru berhasil dibuat.', 'success');
      return newTag;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updateTagApi = async (id: string, updates: Partial<Tag>): Promise<void> => {
    const current = tags.find(t => t.id === id);
    if (!current) return;
    try {
      const updated = await tagsApi.update(id, { ...current, ...updates });
      setTags(prev => prev.map(t => (t.id === id ? updated : t)));
      addToast('Tag berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const deleteTagApi = async (id: string): Promise<void> => {
    try {
      await tagsApi.delete(id);
      setTags(prev => prev.filter(t => t.id !== id));
      addToast('Tag berhasil dihapus.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const resetTagsToDefault = () => {
    if (bootstrapped) {
      tagsApi
        .list()
        .then(setTags)
        .catch(error => addToast(apiErrorMessage(error), 'danger'));
    } else {
      setTags(INITIAL_TAGS);
    }
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

  const addQuestionApi = async (questionData: Omit<Question, 'id' | 'created_at' | 'created_by'>): Promise<Question> => {
    try {
      const newQuestion = await questionsApi.create(questionData);
      setQuestions(prev => [newQuestion, ...prev]);
      addToast('Soal berhasil ditambahkan ke Bank Soal!', 'success');
      return newQuestion;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, ...updates, updated_at: new Date().toISOString() } : q)));
    addToast('Soal berhasil diperbarui!', 'success');
  };

  const updateQuestionApi = async (id: string, updates: Partial<Question>): Promise<void> => {
    const current = questions.find(q => q.id === id);
    if (!current) return;
    try {
      const updated = await questionsApi.update(id, { ...current, ...updates });
      setQuestions(prev => prev.map(q => (q.id === id ? updated : q)));
      addToast('Soal berhasil diperbarui!', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const deleteQuestionApi = async (id: string): Promise<void> => {
    try {
      await questionsApi.delete(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setPaketSoalList(prev => prev.map(p => ({
        ...p,
        items: p.items.filter(item => item.question_id !== id),
        total_soal: p.items.filter(item => item.question_id !== id).length,
      })));
      addToast('Soal berhasil dihapus dari Bank Soal.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const duplicateQuestionApi = async (id: string): Promise<Question | null> => {
    try {
      const duplicated = await questionsApi.duplicate(id);
      setQuestions(prev => [duplicated, ...prev]);
      addToast('Soal berhasil diduplikasi!', 'success');
      return duplicated;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const importQuestionsData = async (importedList: Partial<Question>[], file?: File | null): Promise<number> => {
    if (bootstrapped) {
      if (!file) {
        addToast('File import tidak ditemukan.', 'danger');
        return 0;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        await api.post('/questions/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const refreshedQuestions = await questionsApi.list();
        setQuestions(refreshedQuestions);
        addToast(`Import selesai. ${refreshedQuestions.length} soal tersedia di Bank Soal.`, 'success');
        return importedList.length;
      } catch (error) {
        addToast(apiErrorMessage(error), 'danger');
        throw error;
      }
    }

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

  const addPaketSoalApi = async (paketData: Omit<PaketSoal, 'id' | 'created_at' | 'created_by'>): Promise<PaketSoal> => {
    try {
      const newPaket = await paketSoalApi.create(paketData);
      setPaketSoalList(prev => [newPaket, ...prev]);
      addToast('Paket Soal berhasil dibuat!', 'success');
      return newPaket;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updatePaketSoal = (id: string, updates: Partial<PaketSoal>) => {
    setPaketSoalList(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)));
    addToast('Paket Soal berhasil diperbarui.', 'success');
  };

  const updatePaketSoalApi = async (id: string, updates: Partial<PaketSoal>): Promise<void> => {
    const current = paketSoalList.find(p => p.id === id);
    if (!current) return;
    try {
      const updated = await paketSoalApi.update(id, { ...current, ...updates });
      setPaketSoalList(prev => prev.map(p => (p.id === id ? updated : p)));
      addToast('Paket Soal berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const deletePaketSoal = (id: string) => {
    setPaketSoalList(prev => prev.filter(p => p.id !== id));
    addToast('Paket Soal berhasil dihapus.', 'success');
  };

  const deletePaketSoalApi = async (id: string): Promise<void> => {
    try {
      await paketSoalApi.delete(id);
      setPaketSoalList(prev => prev.filter(p => p.id !== id));
      addToast('Paket Soal berhasil dihapus.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const duplicatePaketSoalApi = async (id: string): Promise<PaketSoal | null> => {
    try {
      const duplicated = await paketSoalApi.duplicate(id);
      setPaketSoalList(prev => [duplicated, ...prev]);
      addToast('Paket Soal berhasil diduplikasi!', 'success');
      return duplicated;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const addUjianApi = async ({
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
  }): Promise<void> => {
    try {
      const created = await Promise.all(siswa_ids.map(async (siswaId, idx) => {
        const siswa = users.find(u => u.id === siswaId);
        const studentName = siswa ? siswa.name.split(' ')[0] : `Siswa ${idx + 1}`;
        return ujianApi.create({
          paket_soal_id,
          siswa_id: siswaId,
          title: siswa_ids.length === 1 ? title : `${title} - ${studentName}`,
          description,
          duration_minutes,
        });
      }));
      setUjianList(prev => [...created, ...prev]);
      addToast(`Berhasil membuat ${created.length} jadwal ujian untuk peserta!`, 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const updateUjian = (id: string, updates: Partial<Ujian>) => {
    setUjianList(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    addToast('Data ujian berhasil diperbarui.', 'success');
  };

  const updateUjianApi = async (id: string, updates: Partial<Ujian>): Promise<void> => {
    const current = ujianList.find(u => u.id === id);
    if (!current) return;
    try {
      const updated = await ujianApi.update(id, { ...current, ...updates });
      setUjianList(prev => prev.map(u => (u.id === id ? updated : u)));
      addToast('Data ujian berhasil diperbarui.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const deleteUjian = (id: string) => {
    setUjianList(prev => prev.filter(u => u.id !== id));
    addToast('Ujian berhasil dihapus.', 'success');
  };

  const deleteUjianApi = async (id: string): Promise<void> => {
    try {
      await ujianApi.delete(id);
      setUjianList(prev => prev.filter(u => u.id !== id));
      addToast('Ujian berhasil dihapus.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const publishUjianApi = async (id: string): Promise<void> => {
    try {
      const updated = await ujianApi.publish(id);
      setUjianList(prev => prev.map(u => (u.id === id ? updated : u)));
      addToast('Ujian telah dipublikasikan dan aktif untuk siswa!', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const startUjianCBTApi = async (id: string): Promise<Ujian | null> => {
    try {
      const exam = await ujianApi.show(id);
      setUjianList(prev => prev.map(u => (u.id === id ? exam : u)));
      return exam;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const saveUjianJawaban = (ujianId: string, questionId: string, answerPayload: {
    selected_option?: number | null;
    selected_option_id?: string | null;
    jawaban?: string | Record<string, string>;
  }) => {
    setUjianList(prev => prev.map(exam => {
      if (exam.id !== ujianId) return exam;

      const updatedJawaban = exam.jawaban.map(j => {
        if (j.question_id === questionId) {
          return {
            ...j,
            selected_option: answerPayload.selected_option !== undefined ? answerPayload.selected_option : j.selected_option,
            selected_option_id: answerPayload.selected_option_id !== undefined ? answerPayload.selected_option_id : j.selected_option_id,
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

  const saveUjianJawabanApi = async (ujianId: string, questionId: string, answerPayload: {
    selected_option?: number | null;
    selected_option_id?: string | null;
    jawaban?: string | Record<string, string>;
  }): Promise<void> => {
    const question = questions.find(q => q.id === questionId);
    const exam = ujianList.find(u => u.id === ujianId);
    const examQuestion = exam?.jawaban.find(j => j.question_id === questionId)?.question;
    const sourceQuestion = question ?? examQuestion;
    const selectedOptionId = answerPayload.selected_option_id ?? (sourceQuestion?.type === 'pg' && answerPayload.selected_option != null
      ? sourceQuestion.pg_options?.[answerPayload.selected_option]?.id ?? null
      : null);
    const optimisticPayload = {
      ...answerPayload,
      selected_option_id: selectedOptionId,
    };

    setUjianList(prev => prev.map(exam => {
      if (exam.id !== ujianId) return exam;

      return {
        ...exam,
        jawaban: exam.jawaban.map(item => item.question_id === questionId
          ? {
              ...item,
              selected_option: optimisticPayload.selected_option !== undefined ? optimisticPayload.selected_option : item.selected_option,
              selected_option_id: optimisticPayload.selected_option_id !== undefined ? optimisticPayload.selected_option_id : item.selected_option_id,
              jawaban: optimisticPayload.jawaban !== undefined ? optimisticPayload.jawaban : item.jawaban,
            }
          : item
        ),
      };
    }));

    try {
      const updated = await ujianApi.answer(ujianId, questionId, {
        ...optimisticPayload,
      });
      setUjianList(prev => prev.map(u => (u.id === ujianId ? { ...u, jawaban: updated.jawaban } : u)));
    } catch (error) {
      throw error;
    }
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

  const submitUjianCBTApi = async (ujianId: string): Promise<{ totalScore: number; maxScore: number }> => {
    try {
      const finishedExam = await ujianApi.submit(ujianId);
      const maxScore = finishedExam.jawaban.reduce((sum, item) => sum + item.max_score, 0);
      setUjianList(prev => prev.map(u => (u.id === ujianId ? finishedExam : u)));
      addToast(`Ujian berhasil dikumpulkan! Nilai Anda: ${finishedExam.total_score ?? 0}/${maxScore || 100}`, 'success');

      return { totalScore: finishedExam.total_score ?? 0, maxScore: maxScore || 100 };
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const shareSoalActionApi = async (questionId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string): Promise<boolean> => {
    try {
      const share = await shareApi.create('question', questionId, sharedToId, permission, message);
      if ('question_id' in share) {
        setShareSoalList(prev => [share, ...prev]);
      }
      addToast('Undangan kolaborasi butir soal berhasil dikirim!', 'success');
      return true;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      return false;
    }
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

  const sharePaketActionApi = async (paketId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string): Promise<boolean> => {
    try {
      const share = await shareApi.create('paket_soal', paketId, sharedToId, permission, message);
      if ('paket_soal_id' in share) {
        setSharePaketList(prev => [share, ...prev]);
      }
      addToast('Undangan kolaborasi paket soal berhasil dikirim!', 'success');
      return true;
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      return false;
    }
  };

  const updateSharePermission = (shareId: string, type: 'question' | 'paket_soal', newPermission: 'view' | 'edit' | 'copy') => {
    if (type === 'question') {
      setShareSoalList(prev => prev.map(s => (s.id === shareId ? { ...s, permission: newPermission } : s)));
    } else {
      setSharePaketList(prev => prev.map(s => (s.id === shareId ? { ...s, permission: newPermission } : s)));
    }
    addToast(`Hak akses kolaborasi diperbarui menjadi "${newPermission === 'view' ? 'Lihat Saja' : newPermission === 'edit' ? 'Edit Bersama' : 'Boleh Salin'}".`, 'success');
  };

  const updateSharePermissionApi = async (shareId: string, type: 'question' | 'paket_soal', newPermission: 'view' | 'edit' | 'copy'): Promise<void> => {
    try {
      const updated = await shareApi.update(shareId, type, newPermission);
      if (type === 'question' && 'question_id' in updated) {
        setShareSoalList(prev => prev.map(s => (s.id === shareId ? updated : s)));
      } else if (type === 'paket_soal' && 'paket_soal_id' in updated) {
        setSharePaketList(prev => prev.map(s => (s.id === shareId ? updated : s)));
      }
      addToast(`Hak akses kolaborasi diperbarui menjadi "${newPermission === 'view' ? 'Lihat Saja' : newPermission === 'edit' ? 'Edit Bersama' : 'Boleh Salin'}".`, 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
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

  const deleteShareActionApi = async (id: string, type?: 'question' | 'paket_soal'): Promise<void> => {
    const resolvedType = type ?? (shareSoalList.some(s => s.id === id) ? 'question' : 'paket_soal');
    try {
      await shareApi.delete(id, resolvedType);
      if (resolvedType === 'question') {
        setShareSoalList(prev => prev.filter(s => s.id !== id));
      } else {
        setSharePaketList(prev => prev.filter(s => s.id !== id));
      }
      addToast('Akses kolaborasi berhasil dihapus.', 'info');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const acceptShareSoal = (shareId: string) => {
    setShareSoalList(prev => prev.map(s => (s.id === shareId ? { ...s, is_accepted: true, accepted_at: new Date().toISOString() } : s)));
    addToast('Undangan kolaborasi soal diterima.', 'success');
  };

  const acceptShareSoalApi = async (shareId: string): Promise<void> => {
    try {
      const updated = await shareApi.accept(shareId, 'question');
      if ('question_id' in updated) {
        setShareSoalList(prev => prev.map(s => (s.id === shareId ? updated : s)));
      }
      const refreshedQuestions = await questionsApi.list();
      setQuestions(refreshedQuestions);
      addToast('Undangan kolaborasi soal diterima.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const rejectShareSoal = (shareId: string) => {
    setShareSoalList(prev => prev.filter(s => s.id !== shareId));
    addToast('Undangan kolaborasi soal ditolak.', 'info');
  };

  const rejectShareSoalApi = async (shareId: string): Promise<void> => {
    try {
      await shareApi.reject(shareId, 'question');
      setShareSoalList(prev => prev.filter(s => s.id !== shareId));
      addToast('Undangan kolaborasi soal ditolak.', 'info');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const acceptSharePaket = (shareId: string) => {
    setSharePaketList(prev => prev.map(s => (s.id === shareId ? { ...s, is_accepted: true, accepted_at: new Date().toISOString() } : s)));
    addToast('Undangan kolaborasi paket soal diterima.', 'success');
  };

  const acceptSharePaketApi = async (shareId: string): Promise<void> => {
    try {
      const updated = await shareApi.accept(shareId, 'paket_soal');
      if ('paket_soal_id' in updated) {
        setSharePaketList(prev => prev.map(s => (s.id === shareId ? updated : s)));
      }
      const refreshedPaket = await paketSoalApi.list();
      setPaketSoalList(refreshedPaket);
      addToast('Undangan kolaborasi paket soal diterima.', 'success');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const rejectSharePaket = (shareId: string) => {
    setSharePaketList(prev => prev.filter(s => s.id !== shareId));
    addToast('Undangan kolaborasi paket soal ditolak.', 'info');
  };

  const rejectSharePaketApi = async (shareId: string): Promise<void> => {
    try {
      await shareApi.reject(shareId, 'paket_soal');
      setSharePaketList(prev => prev.filter(s => s.id !== shareId));
      addToast('Undangan kolaborasi paket soal ditolak.', 'info');
    } catch (error) {
      addToast(apiErrorMessage(error), 'danger');
      throw error;
    }
  };

  const addCollaborationNote = async (shareId: string, type: 'question' | 'paket_soal', text: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'guru' ? 'Guru' : 'Siswa',
      text,
      created_at: new Date().toISOString(),
    };

    if (bootstrapped) {
      try {
        const { share, note } = await shareApi.addNote(shareId, type, text);
        if (type === 'question' && 'question_id' in share) {
          setShareSoalList(prev => prev.map(s => (s.id === shareId ? share : s)));
        } else if (type === 'paket_soal' && 'paket_soal_id' in share) {
          setSharePaketList(prev => prev.map(s => (s.id === shareId ? share : s)));
        }
        addToast('Catatan telaah / umpan balik berhasil ditambahkan.', 'success');
        return note;
      } catch (error) {
        addToast(apiErrorMessage(error), 'danger');
        throw error;
      }
    }

    if (type === 'question') {
      setShareSoalList(prev => prev.map(s => (s.id === shareId ? { ...s, notes: [...(s.notes || []), newNote] } : s)));
    } else {
      setSharePaketList(prev => prev.map(s => (s.id === shareId ? { ...s, notes: [...(s.notes || []), newNote] } : s)));
    }
    addToast('Catatan telaah / umpan balik berhasil ditambahkan.', 'success');
    return newNote;
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
    if (bootstrapped) {
      refreshServerData().catch(() => {});
      addToast('Data berhasil dimuat ulang dari server.', 'info');
      return;
    }
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
        isAuthenticated: Boolean(bootstrapUser),
        isDemoMode: !hasSpaBootstrap,
        shouldRedirectUnauthenticated,
        updateProfile,
        updateAvatar,
        updatePassword,
        users,
        addUser: bootstrapped ? addUserApi : addUser,
        updateUser: bootstrapped ? updateUserApi : updateUser,
        toggleUserStatus: bootstrapped ? toggleUserStatusApi : toggleUserStatus,
        toggleUserActive: bootstrapped ? toggleUserStatusApi : toggleUserActive,
        deleteUser: bootstrapped ? deleteUserApi : deleteUser,
        subjects,
        addSubject: bootstrapped ? addSubjectApi : addSubject,
        updateSubject: bootstrapped ? updateSubjectApi : updateSubject,
        deleteSubject: bootstrapped ? deleteSubjectApi : deleteSubject,
        categories,
        addCategory: bootstrapped ? addCategoryApi : addCategory,
        updateCategory: bootstrapped ? updateCategoryApi : updateCategory,
        deleteCategory: bootstrapped ? deleteCategoryApi : deleteCategory,
        tags,
        addTag: bootstrapped ? addTagApi : addTag,
        updateTag: bootstrapped ? updateTagApi : updateTagLocal,
        deleteTag: bootstrapped ? deleteTagApi : deleteTagLocal,
        resetTagsToDefault,
        theme,
        toggleTheme,
        setTheme,
        selectedTagFilter,
        setSelectedTagFilter,
        kkoList,
        questions,
        addQuestion: bootstrapped ? addQuestionApi : addQuestion,
        updateQuestion: bootstrapped ? updateQuestionApi : updateQuestion,
        deleteQuestion: bootstrapped ? deleteQuestionApi : deleteQuestion,
        duplicateQuestion: bootstrapped ? duplicateQuestionApi : duplicateQuestion,
        importQuestionsData,
        paketSoalList,
        addPaketSoal: bootstrapped ? addPaketSoalApi : addPaketSoal,
        updatePaketSoal: bootstrapped ? updatePaketSoalApi : updatePaketSoal,
        deletePaketSoal: bootstrapped ? deletePaketSoalApi : deletePaketSoal,
        duplicatePaketSoal: bootstrapped ? duplicatePaketSoalApi : duplicatePaketSoal,
        ujianList,
        addUjian: bootstrapped ? addUjianApi : addUjian,
        updateUjian: bootstrapped ? updateUjianApi : updateUjian,
        deleteUjian: bootstrapped ? deleteUjianApi : deleteUjian,
        publishUjian: bootstrapped ? publishUjianApi : publishUjian,
        startUjianCBT: bootstrapped ? startUjianCBTApi : startUjianCBT,
        saveUjianJawaban: bootstrapped ? saveUjianJawabanApi : saveUjianJawaban,
        submitUjianCBT: bootstrapped ? submitUjianCBTApi : submitUjianCBT,
        shareSoalList,
        sharePaketList,
        shares,
        shareSoalAction: bootstrapped ? shareSoalActionApi : shareSoalAction,
        sharePaketAction: bootstrapped ? sharePaketActionApi : sharePaketAction,
        updateSharePermission: bootstrapped ? updateSharePermissionApi : updateSharePermission,
        deleteShareAction: bootstrapped ? deleteShareActionApi : deleteShareAction,
        acceptShareSoal: bootstrapped ? acceptShareSoalApi : acceptShareSoal,
        rejectShareSoal: bootstrapped ? rejectShareSoalApi : rejectShareSoal,
        acceptSharePaket: bootstrapped ? acceptSharePaketApi : acceptSharePaket,
        rejectSharePaket: bootstrapped ? rejectSharePaketApi : rejectSharePaket,
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
        isDataLoading,
        dataLoadError,
        refreshServerData,
        dashboardData,
        analisisData,
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
