import { describe, expect, it, vi } from 'vitest';
import { HttpClient, HttpError } from './http';

describe('HTTP boundary', () => {
  it('encodes an opaque identity as one URL path segment', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{"id":"a/b"}', { status: 200 }));
    const client = new HttpClient('https://example.test', fetcher);
    await client.get(`/api/product/${client.pathSegment('a/b ?')}`);
    expect(fetcher.mock.calls[0]?.[0]).toBe('https://example.test/api/product/a%2Fb%20%3F');
  });

  it('rejects non-success and non-JSON responses with typed errors', async () => {
    const client = new HttpClient('https://example.test', vi.fn().mockResolvedValue(new Response('no', { status: 503 })));
    await expect(client.get('/api/product')).rejects.toMatchObject({ kind: 'http', status: 503 });
    const invalid = new HttpClient('https://example.test', vi.fn().mockResolvedValue(new Response('not json', { status: 200 })));
    await expect(invalid.get('/api/product')).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('settles a request that does not respond within the configured timeout', async () => {
    const fetcher = vi.fn(() => new Promise<Response>(() => undefined));
    const client = new HttpClient('https://example.test', fetcher, 5);
    await expect(client.get('/api/product')).rejects.toMatchObject({ kind: 'timeout' } satisfies Partial<HttpError>);
  });

  it('reports an unreachable service as a network error and posts JSON without credentials', async () => {
    const offline = new HttpClient('https://example.test', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(offline.get('/api/product')).rejects.toMatchObject({ kind: 'network' });
    const fetcher = vi.fn().mockResolvedValue(new Response('{"count":1}', { status: 200 }));
    await new HttpClient('https://example.test', fetcher).post('/api/cart', { id: 'a', colorCode: 0, storageCode: '1' });
    const init = fetcher.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"id":"a","colorCode":0,"storageCode":"1"}');
    expect(init.credentials).toBeUndefined();
  });

  it('refuses a non-HTTPS remote API base', () => {
    expect(() => new HttpClient('http://example.test')).toThrow('HTTPS');
    expect(() => new HttpClient('http://localhost:8080')).not.toThrow();
  });
});
