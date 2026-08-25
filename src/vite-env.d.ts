/// <reference types="vite/client" />

interface SpaBootstrap {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'guru' | 'siswa';
    is_active?: boolean;
  } | null;
}

interface Window {
  __BOOTSTRAP__?: SpaBootstrap;
}
