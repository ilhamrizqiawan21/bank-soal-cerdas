const APP_BASE_PATH = '/app';

const VIEW_TO_PATH: Record<string, string> = {
  dashboard: '/app/dashboard',
  questions: '/app/questions',
  'question-form': '/app/questions/create',
  'questions-create': '/app/questions/create',
  'questions-edit': '/app/questions/edit',
  subjects: '/app/subjects',
  kategori: '/app/kategori',
  tag: '/app/tags',
  tags: '/app/tags',
  'paket-soal': '/app/paket-soal',
  'paket-soal-create': '/app/paket-soal/create',
  'paket-soal-edit': '/app/paket-soal/edit',
  ujian: '/app/ujian',
  'ujian-siswa': '/app/ujian-saya',
  'ujian-cbt': '/app/ujian/kerjakan',
  'ujian-hasil': '/app/ujian/hasil',
  analisis: '/app/analisis',
  'kko-master': '/app/kko',
  share: '/app/share',
  shares: '/app/share',
  users: '/app/users',
  profile: '/app/profile',
};

export function viewToPath(view: string): string {
  return VIEW_TO_PATH[view] ?? VIEW_TO_PATH.dashboard;
}

export function pathToView(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || APP_BASE_PATH;

  if (normalized === APP_BASE_PATH || normalized === `${APP_BASE_PATH}/dashboard`) {
    return 'dashboard';
  }

  if (normalized === `${APP_BASE_PATH}/questions/create`) return 'questions-create';
  if (normalized === `${APP_BASE_PATH}/questions/edit`) return 'questions-edit';
  if (/^\/app\/questions\/[^/]+\/edit$/.test(normalized)) return 'questions-edit';
  if (normalized.startsWith(`${APP_BASE_PATH}/questions/`)) return 'questions';
  if (normalized === `${APP_BASE_PATH}/questions`) return 'questions';

  if (normalized === `${APP_BASE_PATH}/subjects`) return 'subjects';
  if (normalized === `${APP_BASE_PATH}/kategori`) return 'kategori';
  if (normalized === `${APP_BASE_PATH}/tags` || normalized === `${APP_BASE_PATH}/tag`) return 'tag';

  if (normalized === `${APP_BASE_PATH}/paket-soal/create`) return 'paket-soal-create';
  if (normalized === `${APP_BASE_PATH}/paket-soal/edit`) return 'paket-soal-edit';
  if (/^\/app\/paket-soal\/[^/]+\/edit$/.test(normalized)) return 'paket-soal-edit';
  if (normalized.startsWith(`${APP_BASE_PATH}/paket-soal/`)) return 'paket-soal';
  if (normalized === `${APP_BASE_PATH}/paket-soal`) return 'paket-soal';

  if (normalized === `${APP_BASE_PATH}/ujian-saya`) return 'ujian-siswa';
  if (normalized.endsWith('/kerjakan') && normalized.startsWith(`${APP_BASE_PATH}/ujian/`)) return 'ujian-cbt';
  if (normalized.endsWith('/hasil') && normalized.startsWith(`${APP_BASE_PATH}/ujian/`)) return 'ujian-hasil';
  if (normalized.startsWith(`${APP_BASE_PATH}/ujian/`)) return 'ujian';
  if (normalized === `${APP_BASE_PATH}/ujian`) return 'ujian';

  if (normalized === `${APP_BASE_PATH}/analisis`) return 'analisis';
  if (normalized === `${APP_BASE_PATH}/share` || normalized === `${APP_BASE_PATH}/shares`) return 'share';
  if (normalized === `${APP_BASE_PATH}/users`) return 'users';
  if (normalized === `${APP_BASE_PATH}/profile`) return 'profile';
  if (normalized === `${APP_BASE_PATH}/kko`) return 'kko-master';

  return 'dashboard';
}

export function routeSelectionFromPath(pathname: string): {
  questionId: string | null;
  paketId: string | null;
  ujianId: string | null;
} {
  const normalized = pathname.replace(/\/+$/, '') || APP_BASE_PATH;

  const questionMatch = normalized.match(/^\/app\/questions\/([^/]+)(?:\/edit)?$/);
  const paketMatch = normalized.match(/^\/app\/paket-soal\/([^/]+)(?:\/edit)?$/);
  const ujianMatch = normalized.match(/^\/app\/ujian\/([^/]+)(?:\/(?:kerjakan|hasil))?$/);

  return {
    questionId: questionMatch ? decodeURIComponent(questionMatch[1]) : null,
    paketId: paketMatch ? decodeURIComponent(paketMatch[1]) : null,
    ujianId: ujianMatch ? decodeURIComponent(ujianMatch[1]) : null,
  };
}
