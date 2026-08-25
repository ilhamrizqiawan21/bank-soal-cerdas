import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
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
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstField = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
    return firstField ?? data?.message ?? 'Terjadi kesalahan pada server.';
  }
  return 'Tidak dapat terhubung ke server.';
}

export default client;
