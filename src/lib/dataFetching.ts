export async function readWithRetry<T>(read: () => Promise<T>, retries = 1): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await read();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
    }
  }

  throw lastError;
}
