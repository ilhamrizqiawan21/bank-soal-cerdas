import api from './api';
import {
  AnalisisData,
  AnalisisSiswaDetail,
  AnalisisUjianDetail,
  BloomLevel,
  CollaborationNote,
  DashboardData,
  Kategori,
  KkoMaster,
  LevelKognitif,
  MatchingPair,
  PaketSoal,
  PaketSoalItem,
  PgOption,
  Question,
  SharePaket,
  ShareSoal,
  Subject,
  Tag,
  Ujian,
  UjianJawabanItem,
  User,
} from '../types';

type ApiCollection<T> = { data: T[] };
type ApiResource<T> = { data: T };
type ApiPaginated<T> = ApiCollection<T> & { meta: Record<string, unknown>; links: Record<string, unknown> };
export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};
export type PaginatedResult<T> = { data: T[]; meta: PaginationMeta; links: Record<string, unknown> };

type ServerQuestion = Omit<Question, 'id' | 'subject_id' | 'kko_id' | 'created_by' | 'level_c' | 'level_kognitif' | 'kategori_ids' | 'tag_ids'> & {
  id: number | string;
  subject_id: number | string;
  kko_id?: number | string;
  created_by: number | string;
  level_c: LevelKognitif;
  subject?: Subject;
  kko?: KkoMaster;
  kategori?: Kategori[];
  tags?: Tag[];
  kategori_ids?: string[];
  tag_ids?: string[];
  pg_options?: PgOption[];
  matching_pairs?: MatchingPair[];
};

type ServerPaketSoalItem = Omit<PaketSoalItem, 'id' | 'question_id' | 'question'> & {
  id: number | string;
  question_id: number | string;
  question?: ServerQuestion;
};

type ServerPaketSoal = Omit<PaketSoal, 'id' | 'created_by' | 'items'> & {
  id: number | string;
  created_by: number | string;
  items?: ServerPaketSoalItem[];
};

type ServerUjianJawaban = Omit<UjianJawabanItem, 'id' | 'ujian_id' | 'question_id' | 'paket_soal_item_id' | 'selected_option_id' | 'question'> & {
  id: number | string;
  ujian_id: number | string;
  question_id: number | string;
  paket_soal_item_id?: number | string;
  selected_option_id?: number | string | null;
  question?: ServerQuestion;
};

type ServerUjian = Omit<Ujian, 'id' | 'paket_soal_id' | 'siswa_id' | 'created_by' | 'paket_soal' | 'jawaban'> & {
  id: number | string;
  paket_soal_id: number | string;
  siswa_id: number | string;
  created_by: number | string;
  deadline_at?: string;
  paket_soal?: ServerPaketSoal;
  jawaban?: ServerUjianJawaban[];
};

type ServerShare = {
  id: number | string;
  share_key?: string;
  resource_type: 'question' | 'soal' | 'paket' | 'paket_soal';
  resource_id: number | string;
  resource_title?: string;
  shared_by: User;
  shared_to: User;
  permission: 'view' | 'edit' | 'copy';
  is_accepted: boolean;
  accepted_at?: string;
  note?: string;
  notes?: CollaborationNote[];
  created_at: string;
  updated_at?: string;
};

type ServerDashboardData = Omit<DashboardData, 'recent_questions' | 'recent_ujian' | 'active_ujian'> & {
  recent_questions?: ServerQuestion[];
  recent_ujian?: ServerUjian[];
  active_ujian?: Array<ServerUjian & { deadline_at?: string }>;
};

type ServerAnalisisData = Omit<AnalisisData, 'recent_ujian' | 'top_siswa'> & {
  recent_ujian?: ServerUjian[];
  top_siswa?: Array<Omit<AnalisisData['top_siswa'][number], 'siswa_id' | 'siswa'> & {
    siswa_id: number | string;
    siswa?: User;
  }>;
};

type ServerAnalisisUjianDetail = Omit<AnalisisUjianDetail, 'ujian' | 'soal_stats'> & {
  ujian: ServerUjian;
  soal_stats: Array<Omit<AnalisisUjianDetail['soal_stats'][number], 'question'> & {
    question?: ServerQuestion;
  }>;
};

type ServerAnalisisSiswaDetail = Omit<AnalisisSiswaDetail, 'siswa' | 'riwayat_ujian'> & {
  siswa: User;
  riwayat_ujian: ServerUjian[];
};

const toId = (value: number | string | undefined | null): string => String(value ?? '');

const cognitiveToBloomFallback = (level: LevelKognitif): BloomLevel => {
  if (level === 'L3') return 'C4';
  if (level === 'L2') return 'C3';
  return 'C1';
};

const bloomToCognitive = (level: BloomLevel, fallback?: LevelKognitif): LevelKognitif => {
  if (fallback) return fallback;
  if (['C4', 'C5', 'C6'].includes(level)) return 'L3';
  if (level === 'C3') return 'L2';
  return 'L1';
};

const normalizeKko = (item: KkoMaster): KkoMaster => ({
  ...item,
  id: toId(item.id),
});

export const normalizeSubject = (item: Subject): Subject => ({
  ...item,
  id: toId(item.id),
});

export const normalizeKategori = (item: Kategori): Kategori => ({
  ...item,
  id: toId(item.id),
});

export const normalizeTag = (item: Tag): Tag => ({
  ...item,
  id: toId(item.id),
});

export const normalizeUser = (item: User & { id: number | string; nip?: string }): User => ({
  ...item,
  id: toId(item.id),
  nip_nisn: item.nip_nisn ?? item.nip,
});

export const normalizeQuestion = (item: ServerQuestion): Question => {
  const cognitiveLevel = item.level_c;

  return {
    ...item,
    id: toId(item.id),
    subject_id: toId(item.subject_id),
    kko_id: toId(item.kko_id),
    created_by: toId(item.created_by),
    level_c: item.kko?.bloom_level ?? cognitiveToBloomFallback(cognitiveLevel),
    level_kognitif: cognitiveLevel,
    kategori_ids: item.kategori?.map(category => toId(category.id)) ?? item.kategori_ids ?? [],
    tag_ids: item.tags?.map(tag => toId(tag.id)) ?? item.tag_ids ?? [],
    subject: item.subject ? normalizeSubject(item.subject) : undefined,
    kko: item.kko ? normalizeKko(item.kko) : undefined,
  };
};

const normalizePaketItem = (item: ServerPaketSoalItem): PaketSoalItem => ({
  ...item,
  id: toId(item.id),
  question_id: toId(item.question_id),
  question: item.question ? normalizeQuestion(item.question) : undefined,
});

export const normalizePaketSoal = (item: ServerPaketSoal): PaketSoal => ({
  ...item,
  id: toId(item.id),
  created_by: toId(item.created_by),
  items: (item.items ?? []).map(normalizePaketItem),
});

const normalizeUjianJawaban = (item: ServerUjianJawaban): UjianJawabanItem => ({
  ...item,
  id: toId(item.id),
  ujian_id: toId(item.ujian_id),
  question_id: toId(item.question_id),
  paket_soal_item_id: toId(item.paket_soal_item_id),
  selected_option_id: item.selected_option_id == null ? null : toId(item.selected_option_id),
  jawaban: parseAnswer(item.jawaban),
  question: item.question ? normalizeQuestion(item.question) : undefined,
});

const parseAnswer = (value: UjianJawabanItem['jawaban']): UjianJawabanItem['jawaban'] => {
  if (typeof value !== 'string' || !value.trim().startsWith('{')) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : value;
  } catch {
    return value;
  }
};

export const normalizeUjian = (item: ServerUjian): Ujian => ({
  ...item,
  id: toId(item.id),
  paket_soal_id: toId(item.paket_soal_id),
  siswa_id: toId(item.siswa_id),
  created_by: toId(item.created_by),
  paket_soal: item.paket_soal ? normalizePaketSoal(item.paket_soal) : undefined,
  jawaban: (item.jawaban ?? []).map(normalizeUjianJawaban),
});

export const normalizeShare = (item: ServerShare): ShareSoal | SharePaket => {
  const isQuestion = item.resource_type === 'question' || item.resource_type === 'soal';
  const base = {
    id: toId(item.id),
    share_key: item.share_key,
    resource_title: item.resource_title,
    shared_by: toId(item.shared_by?.id),
    sharedBy: item.shared_by ? normalizeUser(item.shared_by) : undefined,
    shared_to: toId(item.shared_to?.id),
    sharedTo: item.shared_to ? normalizeUser(item.shared_to) : undefined,
    permission: item.permission,
    message: item.note,
    note: item.note,
    notes: item.notes ?? [],
    is_accepted: item.is_accepted,
    accepted_at: item.accepted_at,
    created_at: item.created_at,
  };

  if (isQuestion) {
    return {
      ...base,
      question_id: toId(item.resource_id),
    };
  }

  return {
    ...base,
    paket_soal_id: toId(item.resource_id),
  };
};

const questionPayload = (question: Omit<Question, 'id' | 'created_at' | 'created_by'> | Partial<Question>) => {
  const pgOptions = question.pg_options ?? [];
  const matchingPairs = question.matching_pairs ?? [];

  return {
    subject_id: question.subject_id,
    jenjang: question.jenjang,
    curriculum: question.curriculum,
    type: question.type,
    level_c: bloomToCognitive(question.level_c as BloomLevel, question.level_kognitif),
    kko_id: question.kko_id,
    question_text: question.question_text,
    indicator_text: question.indicator_text,
    options: pgOptions.map(option => option.option_text),
    correct_option: Math.max(pgOptions.findIndex(option => option.is_correct), 0),
    rubric_text: question.essay_rubric?.rubric_text,
    left_texts: matchingPairs.map(pair => pair.left_text),
    right_texts: matchingPairs.map(pair => pair.right_text),
    correct_boolean: question.correct_boolean,
  };
};

export const subjectsApi = {
  async list(): Promise<Subject[]> {
    const { data } = await api.get<ApiCollection<Subject>>('/subjects');
    return data.data.map(normalizeSubject);
  },
  async create(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const { data } = await api.post<ApiResource<Subject>>('/subjects', {
      name: subject.name,
      code: subject.code,
    });
    return normalizeSubject(data.data);
  },
  async update(id: string, subject: Partial<Subject>): Promise<Subject> {
    const { data } = await api.put<ApiResource<Subject>>(`/subjects/${id}`, {
      name: subject.name,
      code: subject.code,
    });
    return normalizeSubject(data.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`/subjects/${id}`).then(() => undefined);
  },
};

export const categoriesApi = {
  async list(): Promise<Kategori[]> {
    const { data } = await api.get<ApiCollection<Kategori>>('/kategori');
    return data.data.map(normalizeKategori);
  },
  async create(category: Omit<Kategori, 'id'>): Promise<Kategori> {
    const { data } = await api.post<ApiResource<Kategori>>('/kategori', {
      name: category.name,
      code: category.slug,
      type: 'topik',
      description: category.description,
    });
    return normalizeKategori({ ...data.data, slug: data.data.code ?? category.slug, color: category.color, type: category.type });
  },
  async update(id: string, category: Partial<Kategori>): Promise<Kategori> {
    const { data } = await api.put<ApiResource<Kategori>>(`/kategori/${id}`, {
      name: category.name,
      code: category.slug,
      type: 'topik',
      description: category.description,
    });
    return normalizeKategori({ ...data.data, slug: data.data.code ?? category.slug, color: category.color, type: category.type });
  },
  delete(id: string): Promise<void> {
    return api.delete(`/kategori/${id}`).then(() => undefined);
  },
};

export const tagsApi = {
  async list(): Promise<Tag[]> {
    const { data } = await api.get<ApiCollection<Tag>>('/tags');
    return data.data.map(normalizeTag);
  },
  async create(tag: Omit<Tag, 'id'>): Promise<Tag> {
    const { data } = await api.post<ApiResource<Tag>>('/tags', {
      name: tag.name,
      color: tag.color ?? '#6366f1',
    });
    return normalizeTag(data.data);
  },
  async update(id: string, tag: Partial<Tag>): Promise<Tag> {
    const { data } = await api.put<ApiResource<Tag>>(`/tags/${id}`, {
      name: tag.name,
      color: tag.color ?? '#6366f1',
    });
    return normalizeTag(data.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`/tags/${id}`).then(() => undefined);
  },
};

export const kkoApi = {
  async list(): Promise<KkoMaster[]> {
    const { data } = await api.get<ApiCollection<KkoMaster>>('/kko');
    return data.data.map(normalizeKko);
  },
};

export type UserWritePayload = Omit<User, 'id' | 'created_at'> & {
  password?: string;
  password_confirmation?: string;
};

export type ProfilePayload = Pick<User, 'name' | 'email'> & Partial<Pick<User, 'phone' | 'address' | 'gender' | 'birth_date'>>;

const userPayload = (user: Partial<UserWritePayload>, includePassword = false) => ({
  name: user.name,
  email: user.email,
  role: user.role,
  nip: user.nip_nisn,
  is_active: user.is_active ?? true,
  phone: user.phone,
  address: user.address,
  gender: user.gender,
  birth_date: user.birth_date,
  ...(includePassword || user.password ? {
    password: user.password ?? 'password123',
    password_confirmation: user.password_confirmation ?? user.password ?? 'password123',
  } : {}),
});

export const meApi = {
  async updateProfile(profile: ProfilePayload): Promise<User> {
    const { data } = await api.put<ApiResource<User & { id: number | string; nip?: string }>>('/profile', profile);
    return normalizeUser(data.data);
  },
  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post<ApiResource<User & { id: number | string; nip?: string }>>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeUser(data.data);
  },
  updatePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    return api.put('/settings/password', payload).then(() => undefined);
  },
};

export const usersApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get<ApiPaginated<User & { id: number | string; nip?: string }>>('/users', {
      params: { per_page: 100, sort: 'latest' },
    });
    return data.data.map(normalizeUser);
  },
  async options(): Promise<User[]> {
    const { data } = await api.get<ApiCollection<User & { id: number | string; nip?: string }>>('/users/options', {
      params: { roles: 'admin,guru,siswa' },
    });
    return data.data.map(normalizeUser);
  },
  async create(user: UserWritePayload): Promise<User> {
    const { data } = await api.post<ApiResource<User & { id: number | string; nip?: string }>>('/users', userPayload(user, true));
    return normalizeUser(data.data);
  },
  async update(id: string, user: Partial<UserWritePayload>): Promise<User> {
    const { data } = await api.put<ApiResource<User & { id: number | string; nip?: string }>>(`/users/${id}`, userPayload(user));
    return normalizeUser(data.data);
  },
  async toggleStatus(id: string): Promise<User> {
    const { data } = await api.post<ApiResource<User & { id: number | string; nip?: string }>>(`/users/${id}/toggle-status`);
    return normalizeUser(data.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`/users/${id}`).then(() => undefined);
  },
};

export const questionsApi = {
  async list(): Promise<Question[]> {
    const { data } = await api.get<ApiPaginated<ServerQuestion>>('/questions', {
      params: { per_page: 100, sort: 'latest' },
    });
    return data.data.map(normalizeQuestion);
  },
  async paginate(params: Record<string, string | number | undefined>): Promise<PaginatedResult<Question>> {
    const { data } = await api.get<ApiPaginated<ServerQuestion>>('/questions', { params });
    return {
      data: data.data.map(normalizeQuestion),
      meta: data.meta as PaginationMeta,
      links: data.links,
    };
  },
  async create(question: Omit<Question, 'id' | 'created_at' | 'created_by'>): Promise<Question> {
    const { data } = await api.post<ApiResource<ServerQuestion>>('/questions', questionPayload(question));
    return normalizeQuestion(data.data);
  },
  async update(id: string, question: Partial<Question>): Promise<Question> {
    const { data } = await api.put<ApiResource<ServerQuestion>>(`/questions/${id}`, questionPayload(question));
    return normalizeQuestion(data.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`/questions/${id}`).then(() => undefined);
  },
  async duplicate(id: string): Promise<Question> {
    const { data } = await api.post<ApiResource<ServerQuestion>>(`/questions/${id}/duplicate`);
    return normalizeQuestion(data.data);
  },
};

const paketPayload = (paket: Omit<PaketSoal, 'id' | 'created_at' | 'created_by'> | Partial<PaketSoal>) => ({
  name: paket.name,
  description: paket.description,
  jenjang: paket.jenjang,
  curriculum: paket.curriculum,
  duration_minutes: paket.duration_minutes,
  acak_soal: paket.acak_soal ?? false,
  acak_pilihan: paket.acak_pilihan ?? false,
  status: paket.status,
  questions: (paket.items ?? []).map(item => item.question_id),
  scores: (paket.items ?? []).map(item => item.score),
});

export const paketSoalApi = {
  async list(): Promise<PaketSoal[]> {
    const { data } = await api.get<ApiPaginated<ServerPaketSoal>>('/paket-soal', {
      params: { per_page: 100, sort: 'latest' },
    });
    return data.data.map(normalizePaketSoal);
  },
  async paginate(params: Record<string, string | number | undefined>): Promise<PaginatedResult<PaketSoal>> {
    const { data } = await api.get<ApiPaginated<ServerPaketSoal>>('/paket-soal', { params });
    return {
      data: data.data.map(normalizePaketSoal),
      meta: data.meta as PaginationMeta,
      links: data.links,
    };
  },
  async create(paket: Omit<PaketSoal, 'id' | 'created_at' | 'created_by'>): Promise<PaketSoal> {
    const { data } = await api.post<ApiResource<ServerPaketSoal>>('/paket-soal', paketPayload(paket));
    return normalizePaketSoal(data.data);
  },
  async update(id: string, paket: Partial<PaketSoal>): Promise<PaketSoal> {
    const { data } = await api.put<ApiResource<ServerPaketSoal>>(`/paket-soal/${id}`, paketPayload(paket));
    return normalizePaketSoal(data.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`/paket-soal/${id}`).then(() => undefined);
  },
  async duplicate(id: string): Promise<PaketSoal> {
    const { data } = await api.post<ApiResource<ServerPaketSoal>>(`/paket-soal/${id}/duplicate`);
    return normalizePaketSoal(data.data);
  },
};

export const ujianApi = {
  async list(): Promise<Ujian[]> {
    const { data } = await api.get<ApiPaginated<ServerUjian>>('/ujian', {
      params: { per_page: 100, sort: 'latest' },
    });
    return data.data.map(normalizeUjian);
  },
  async paginate(params: Record<string, string | number | undefined>): Promise<PaginatedResult<Ujian>> {
    const { data } = await api.get<ApiPaginated<ServerUjian>>('/ujian', { params });
    return {
      data: data.data.map(normalizeUjian),
      meta: data.meta as PaginationMeta,
      links: data.links,
    };
  },
  async mine(): Promise<Ujian[]> {
    const { data } = await api.get<ApiPaginated<ServerUjian>>('/ujian-saya', {
      params: { per_page: 100 },
    });
    return data.data.map(normalizeUjian);
  },
  async show(id: string): Promise<Ujian> {
    const { data } = await api.get<ApiResource<ServerUjian>>(`/ujian/${id}`);
    return normalizeUjian(data.data);
  },
  async create(ujian: {
    paket_soal_id: string;
    siswa_id: string;
    title: string;
    description?: string;
    duration_minutes?: number;
  }): Promise<Ujian> {
    const { data } = await api.post<ApiResource<ServerUjian>>('/ujian', ujian);
    return normalizeUjian(data.data);
  },
  async update(id: string, ujian: Partial<Ujian>): Promise<Ujian> {
    const { data } = await api.put<ApiResource<ServerUjian>>(`/ujian/${id}`, {
      title: ujian.title,
      description: ujian.description,
      duration_minutes: ujian.duration_minutes,
      status: ujian.status,
    });
    return normalizeUjian(data.data);
  },
  delete(id: string): Promise<void> {
    return api.delete(`/ujian/${id}`).then(() => undefined);
  },
  async publish(id: string): Promise<Ujian> {
    const { data } = await api.post<ApiResource<ServerUjian>>(`/ujian/${id}/publish`);
    return normalizeUjian(data.data);
  },
  async answer(ujianId: string, questionId: string, answerPayload: {
    selected_option?: number | null;
    selected_option_id?: string | null;
    jawaban?: string | Record<string, string>;
  }): Promise<Ujian> {
    const jawaban = typeof answerPayload.jawaban === 'object'
      ? JSON.stringify(answerPayload.jawaban)
      : answerPayload.jawaban;
    const { data } = await api.post<ApiResource<ServerUjian>>(`/ujian/${ujianId}/jawaban`, {
      jawaban: {
        [questionId]: {
          jawaban,
          selected_option: answerPayload.selected_option,
          selected_option_id: answerPayload.selected_option_id,
        },
      },
    });
    return normalizeUjian(data.data);
  },
  async submit(id: string): Promise<Ujian> {
    const { data } = await api.post<ApiResource<ServerUjian>>(`/ujian/${id}/submit`);
    return normalizeUjian(data.data);
  },
};

const splitShares = (items: Array<ShareSoal | SharePaket>) => ({
  soal: items.filter((item): item is ShareSoal => 'question_id' in item),
  paket: items.filter((item): item is SharePaket => 'paket_soal_id' in item),
});

export const shareApi = {
  async list(): Promise<{ soal: ShareSoal[]; paket: SharePaket[] }> {
    const { data } = await api.get<ApiPaginated<ServerShare>>('/share', {
      params: { per_page: 100 },
    });
    return splitShares(data.data.map(normalizeShare));
  },
  async create(resourceType: 'question' | 'paket_soal', resourceId: string, sharedToId: string, permission: 'view' | 'edit' | 'copy', message?: string): Promise<ShareSoal | SharePaket> {
    const { data } = await api.post<ApiResource<ServerShare>>('/share', {
      resource_type: resourceType === 'question' ? 'question' : 'paket',
      resource_id: resourceId,
      shared_to: sharedToId,
      permission,
      note: message,
    });
    return normalizeShare(data.data);
  },
  async update(shareId: string, type: 'question' | 'paket_soal', permission: 'view' | 'edit' | 'copy'): Promise<ShareSoal | SharePaket> {
    const { data } = await api.put<ApiResource<ServerShare>>(`/share/${shareId}`, {
      resource_type: type === 'question' ? 'question' : 'paket',
      permission,
    });
    return normalizeShare(data.data);
  },
  delete(shareId: string, type: 'question' | 'paket_soal'): Promise<void> {
    return api.delete(`/share/${shareId}`, {
      params: { resource_type: type === 'question' ? 'question' : 'paket' },
    }).then(() => undefined);
  },
  async accept(shareId: string, type: 'question' | 'paket_soal'): Promise<ShareSoal | SharePaket> {
    const { data } = await api.post<ApiResource<ServerShare>>(`/share/${shareId}/accept`, undefined, {
      params: { resource_type: type === 'question' ? 'question' : 'paket' },
    });
    return normalizeShare(data.data);
  },
  reject(shareId: string, type: 'question' | 'paket_soal'): Promise<void> {
    return api.post(`/share/${shareId}/reject`, undefined, {
      params: { resource_type: type === 'question' ? 'question' : 'paket' },
    }).then(() => undefined);
  },
  async addNote(shareId: string, type: 'question' | 'paket_soal', text: string): Promise<{ share: ShareSoal | SharePaket; note: CollaborationNote }> {
    const { data } = await api.post<ApiResource<{ share: ServerShare; note: CollaborationNote }>>(`/share/${shareId}/notes`, {
      resource_type: type === 'question' ? 'question' : 'paket',
      text,
    });

    return {
      share: normalizeShare(data.data.share),
      note: data.data.note,
    };
  },
};

export const analisisApi = {
  exportUrl: '/api/analisis/export',
  async summary(): Promise<AnalisisData> {
    const { data } = await api.get<ApiResource<ServerAnalisisData>>('/analisis');
    return {
      ...data.data,
      top_siswa: (data.data.top_siswa ?? []).map(item => ({
        ...item,
        siswa_id: toId(item.siswa_id),
        siswa: item.siswa ? normalizeUser(item.siswa) : undefined,
        avg_score: Number(item.avg_score),
      })),
      recent_ujian: (data.data.recent_ujian ?? []).map(normalizeUjian),
    };
  },
  async ujian(id: string): Promise<AnalisisUjianDetail> {
    const { data } = await api.get<ApiResource<ServerAnalisisUjianDetail>>(`/analisis/ujian/${id}`);
    return {
      ujian: normalizeUjian(data.data.ujian),
      soal_stats: data.data.soal_stats.map(item => ({
        ...item,
        question: item.question ? normalizeQuestion(item.question) : undefined,
      })),
    };
  },
  async siswa(id: string): Promise<AnalisisSiswaDetail> {
    const { data } = await api.get<ApiResource<ServerAnalisisSiswaDetail>>(`/analisis/siswa/${id}`);
    return {
      siswa: normalizeUser(data.data.siswa),
      stats: data.data.stats,
      riwayat_ujian: data.data.riwayat_ujian.map(normalizeUjian),
    };
  },
};

export const dashboardApi = {
  async show(): Promise<DashboardData> {
    const { data } = await api.get<ApiResource<ServerDashboardData>>('/dashboard');

    return {
      ...data.data,
      recent_questions: data.data.recent_questions?.map(normalizeQuestion) ?? [],
      recent_ujian: data.data.recent_ujian?.map(normalizeUjian) ?? [],
      active_ujian: data.data.active_ujian?.map(item => ({
        ...normalizeUjian(item),
        deadline_at: item.deadline_at,
      })) ?? [],
    };
  },
};
