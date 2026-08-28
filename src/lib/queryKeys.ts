export const queryKeys = {
  dashboard: ['dashboard'] as const,
  me: ['me'] as const,
  users: {
    all: ['users'] as const,
    list: (params?: Record<string, unknown>) => ['users', 'list', params ?? {}] as const,
    options: (params?: Record<string, unknown>) => ['users', 'options', params ?? {}] as const,
  },
  subjects: {
    all: ['subjects'] as const,
    list: (params?: Record<string, unknown>) => ['subjects', 'list', params ?? {}] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params?: Record<string, unknown>) => ['categories', 'list', params ?? {}] as const,
  },
  tags: {
    all: ['tags'] as const,
    list: (params?: Record<string, unknown>) => ['tags', 'list', params ?? {}] as const,
  },
  kko: {
    all: ['kko'] as const,
    list: (params?: Record<string, unknown>) => ['kko', 'list', params ?? {}] as const,
  },
  questions: {
    all: ['questions'] as const,
    list: (params?: Record<string, unknown>) => ['questions', 'list', params ?? {}] as const,
    detail: (id: string) => ['questions', 'detail', id] as const,
  },
  paketSoal: {
    all: ['paket-soal'] as const,
    list: (params?: Record<string, unknown>) => ['paket-soal', 'list', params ?? {}] as const,
    detail: (id: string) => ['paket-soal', 'detail', id] as const,
  },
  ujian: {
    all: ['ujian'] as const,
    list: (params?: Record<string, unknown>) => ['ujian', 'list', params ?? {}] as const,
    mine: (params?: Record<string, unknown>) => ['ujian', 'mine', params ?? {}] as const,
    detail: (id: string) => ['ujian', 'detail', id] as const,
  },
  share: {
    all: ['share'] as const,
    list: (params?: Record<string, unknown>) => ['share', 'list', params ?? {}] as const,
  },
  analisis: {
    summary: ['analisis', 'summary'] as const,
    ujian: (id: string) => ['analisis', 'ujian', id] as const,
    siswa: (id: string) => ['analisis', 'siswa', id] as const,
  },
};
