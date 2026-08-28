import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

const csrfMeta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
if (csrfMeta) {
  client.defaults.headers.common['X-CSRF-TOKEN'] = csrfMeta.content;
}

/** True when the SPA is served by Laravel (has a real authenticated session). */
export const isBootstrapped = (): boolean => Boolean(window.__BOOTSTRAP__?.user);

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstField = data?.errors ? Object.values(data.errors).flat()[0] : undefined;

    if (status === 401) {
      return 'Sesi login Anda sudah berakhir. Silakan masuk kembali.';
    }
    if (status === 403) {
      return 'Anda tidak memiliki akses untuk membuka atau mengubah data ini.';
    }
    if (status === 422) {
      return firstField ?? data?.message ?? 'Periksa kembali isian form.';
    }
    if (status === 429) {
      return data?.message ?? 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
    }
    if (status && status >= 500) {
      return 'Terjadi gangguan pada server. Silakan coba lagi nanti.';
    }

    return firstField ?? data?.message ?? 'Terjadi kesalahan pada server.';
  }
  return 'Tidak dapat terhubung ke server.';
}

client.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && isBootstrapped()) {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('session_expired', '1');
      loginUrl.searchParams.set('intended', window.location.pathname);
      window.location.assign(loginUrl.toString());
    }

    return Promise.reject(error);
  },
);

export default client;
