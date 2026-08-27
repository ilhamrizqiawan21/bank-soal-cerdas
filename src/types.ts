export type Role = 'admin' | 'guru' | 'siswa';
export type UserRole = Role;

export interface ShareItem {
  id: string;
  shareable_type: 'question' | 'paket_soal';
  shareable_id: string;
  shared_by: string;
  shared_with: string;
  permission: 'view' | 'edit' | 'copy';
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  is_active: boolean;
  nip_nisn?: string;
  phone?: string;
  address?: string;
  gender?: 'L' | 'P' | null;
  birth_date?: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  created_at?: string;
}

export type KategoriType = 'formatif' | 'sumatif' | 'diagnostik' | 'try_out' | 'osn' | 'lainnya';

export interface Kategori {
  id: string;
  name: string;
  code?: string;
  slug?: string;
  type?: KategoriType;
  color?: string;
  description?: string;
  created_at?: string;
}

export type CharacteristicType = 
  | 'kognitif' 
  | 'literasi_numerasi' 
  | 'profil_pancasila' 
  | 'kesulitan' 
  | 'stimulus' 
  | 'umum';

export interface Tag {
  id: string;
  name: string;
  slug?: string;
  category?: CharacteristicType;
  color?: string;
  description?: string;
  criteria?: string;
  created_at?: string;
}

export type LevelKognitif = 'L1' | 'L2' | 'L3';
export type BloomLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';
export type QuestionType = 'pg' | 'uraian' | 'menjodohkan' | 'benar_salah';
export type Jenjang = 'SD' | 'SMP' | 'SMA' | 'SMK';
export type Curriculum = 'merdeka' | 'kbc';

export interface KkoMaster {
  id: string;
  verb: string;
  level: LevelKognitif;
  bloom_level: BloomLevel;
  description: string;
}

export interface PgOption {
  id?: string;
  label: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  option_text: string;
  is_correct: boolean;
}

export interface MatchingPair {
  id: string;
  pair_order: number;
  left_text: string;
  right_text: string;
}

export interface EssayRubric {
  id?: string;
  rubric_text: string;
  max_score?: number;
}

export interface Question {
  id: string;
  subject_id: string;
  subject?: Subject;
  kko_id?: string;
  kko?: KkoMaster;
  created_by: string;
  creator?: User;
  jenjang: Jenjang;
  curriculum: Curriculum;
  type: QuestionType;
  level_c: BloomLevel;
  level_kognitif: LevelKognitif;
  question_text: string;
  indicator_text?: string;
  explanation?: string;
  correct_boolean?: boolean | null;
  pg_options?: PgOption[];
  matching_pairs?: MatchingPair[];
  essay_rubric?: EssayRubric;
  kategori_ids?: string[];
  tag_ids?: string[];
  created_at: string;
  updated_at?: string;
}

export interface PaketSoalItem {
  id: string;
  question_id: string;
  question?: Question;
  order: number;
  score: number;
}

export interface PaketSoal {
  id: string;
  name: string;
  description?: string;
  jenjang: Jenjang;
  curriculum: 'merdeka' | 'kbc' | 'both';
  kategori_id?: string;
  kategori?: Kategori;
  duration_minutes?: number;
  created_by: string;
  creator?: User;
  status: 'draft' | 'published' | 'archived';
  total_soal: number;
  acak_soal?: boolean;
  acak_pilihan?: boolean;
  items: PaketSoalItem[];
  created_at: string;
  updated_at?: string;
}

export type UjianStatus = 'draft' | 'active' | 'finished' | 'expired';

export interface UjianJawabanItem {
  id: string;
  ujian_id: string;
  question_id: string;
  question?: Question;
  paket_soal_item_id?: string;
  selected_option?: number | null; // index for PG or 1/0 for benar_salah
  selected_option_id?: string | null;
  jawaban?: string | Record<string, string>; // text for essay, or map of pairId -> text
  is_correct?: boolean;
  score: number;
  score_earned?: number;
  max_score: number;
  feedback?: string;
}

export interface Ujian {
  id: string;
  paket_soal_id: string;
  paket_soal?: PaketSoal;
  siswa_id: string;
  siswa?: User;
  created_by: string;
  creator?: User;
  title: string;
  description?: string;
  duration_minutes: number;
  total_soal: number;
  total_score?: number;
  max_score?: number;
  status: UjianStatus;
  started_at?: string;
  deadline_at?: string;
  submitted_at?: string;
  created_at: string;
  token_ujian?: string;
  jawaban: UjianJawabanItem[];
}

export interface CollaborationNote {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  text: string;
  created_at: string;
}

export interface ShareSoal {
  id: string;
  share_key?: string;
  question_id: string;
  resource_title?: string;
  question?: Question;
  shared_by: string;
  sharedBy?: User;
  shared_to: string;
  sharedTo?: User;
  permission: 'view' | 'edit' | 'copy';
  message?: string;
  note?: string;
  notes?: CollaborationNote[];
  is_accepted: boolean;
  accepted_at?: string;
  created_at: string;
}

export interface SharePaket {
  id: string;
  share_key?: string;
  paket_soal_id: string;
  resource_title?: string;
  paketSoal?: PaketSoal;
  shared_by: string;
  sharedBy?: User;
  shared_to: string;
  sharedTo?: User;
  permission: 'view' | 'edit' | 'copy';
  message?: string;
  note?: string;
  notes?: CollaborationNote[];
  is_accepted: boolean;
  accepted_at?: string;
  created_at: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}

export interface NotificationItem {
  id: string;
  type: 'share_soal' | 'share_paket';
  share_id: string;
  message: string;
  sender_name: string;
  item_title: string;
  created_at: string;
}

export interface DashboardData {
  role: Role;
  summary: {
    total_soal?: number;
    total_paket?: number;
    total_ujian?: number;
    total_siswa?: number;
    merdeka_count?: number;
    kbc_count?: number;
    hots_count?: number;
    active_ujian?: number;
    finished_ujian?: number;
    expired_ujian?: number;
    average_score?: number;
  };
  level_distribution?: Partial<Record<LevelKognitif | BloomLevel, number>>;
  status_distribution?: Partial<Record<UjianStatus, number>>;
  recent_questions?: Question[];
  recent_ujian?: Ujian[];
  active_ujian?: Array<Ujian & { deadline_at?: string }>;
}

export interface AnalisisData {
  summary: {
    total_ujian: number;
    total_siswa: number;
    total_soal: number;
    total_paket: number;
    avg_score: number;
  };
  status_distribution: Partial<Record<UjianStatus, number>>;
  level_distribution: Partial<Record<LevelKognitif | BloomLevel, number>>;
  top_siswa: Array<{
    siswa_id: string | number;
    avg_score: number | string;
    total_ujian: number;
    siswa?: User;
  }>;
  recent_ujian: Ujian[];
}

export interface AnalisisUjianDetail {
  ujian: Ujian;
  soal_stats: Array<{
    question?: Question;
    total: number;
    correct: number;
    wrong: number;
  }>;
}

export interface AnalisisSiswaDetail {
  siswa: User;
  stats: {
    total_ujian: number;
    total_ujian_selesai: number;
    rata_rata_nilai: number;
    nilai_tertinggi: number;
    nilai_terendah: number;
  };
  riwayat_ujian: Ujian[];
}
