type QueryValue = string | number | boolean | null | undefined;

export function getUrlQuery(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function queryValue(params: URLSearchParams, key: string, fallback = 'all'): string {
  return params.get(key) || fallback;
}

export function queryPage(params: URLSearchParams, fallback = 1): number {
  const page = Number(params.get('page') ?? fallback);
  return Number.isFinite(page) && page > 0 ? page : fallback;
}

export function updateUrlQuery(values: Record<string, QueryValue>, options: { replace?: boolean } = {}): void {
  const params = getUrlQuery();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
      params.delete(key);
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl === currentUrl) return;

  if (options.replace ?? true) {
    window.history.replaceState({}, '', nextUrl);
  } else {
    window.history.pushState({}, '', nextUrl);
  }
}
