export type HttpErrorKind = 'network' | 'timeout' | 'http' | 'invalid-response';

export class HttpError extends Error {
  constructor(readonly kind: HttpErrorKind, message: string, readonly status?: number) {
    super(message);
    this.name = 'HttpError';
  }
}

export const REQUEST_TIMEOUT_MS = 20_000;
export const DEFAULT_API_BASE_URL = 'https://itx-frontend-test.onrender.com';

export class HttpClient {
  private readonly baseUrl: string;

  constructor(
    baseUrl = DEFAULT_API_BASE_URL,
    private readonly fetcher: typeof fetch | undefined = undefined,
    private readonly timeoutMs = REQUEST_TIMEOUT_MS,
  ) {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      throw new Error('API base URL must use HTTPS.');
    }
    this.baseUrl = parsed.href.replace(/\/$/, '');
  }

  pathSegment(identity: string): string {
    return encodeURIComponent(identity);
  }

  get(path: string): Promise<unknown> {
    return this.request(path, { method: 'GET', cache: 'no-store' });
  }

  post(path: string, body: unknown): Promise<unknown> {
    return this.request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const controller = new AbortController();
    let didTimeout = false;
    let rejectTimeout: (reason?: unknown) => void = () => undefined;
    const timeout = new Promise<never>((_, reject) => { rejectTimeout = reject; });
    const timer = setTimeout(() => {
      didTimeout = true;
      controller.abort();
      rejectTimeout(new HttpError('timeout', 'The service took too long to respond.'));
    }, this.timeoutMs);
    try {
      let response: Response;
      try {
        response = await Promise.race([
          (this.fetcher ?? globalThis.fetch)(`${this.baseUrl}${path}`, { ...init, signal: controller.signal }),
          timeout,
        ]);
      } catch (error) {
        if (didTimeout || (error instanceof DOMException && error.name === 'AbortError')) {
          throw new HttpError('timeout', 'The service took too long to respond.');
        }
        if (error instanceof HttpError) throw error;
        throw new HttpError('network', 'The service could not be reached.');
      }
      if (!response.ok) throw new HttpError('http', 'The service returned an error.', response.status);
      try {
        return await response.json() as unknown;
      } catch {
        if (didTimeout) throw new HttpError('timeout', 'The service took too long to respond.');
        throw new HttpError('invalid-response', 'The service returned an invalid response.');
      }
    } finally {
      clearTimeout(timer);
    }
  }
}

export function configuredApiBaseUrl(): string {
  const candidate = import.meta.env.VITE_API_BASE_URL?.trim();
  return candidate || DEFAULT_API_BASE_URL;
}
