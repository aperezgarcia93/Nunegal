import { act, renderHook, waitFor } from '@testing-library/react';
import { useCallback } from 'react';
import { describe, expect, it } from 'vitest';
import { useProductResource } from './useProductResource';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve: (value: T) => resolve(value) };
}

describe('product resource lifecycle', () => {
  it('ignores a late response for a previous route identity', async () => {
    const a = deferred<string>();
    const b = deferred<string>();
    const { result, rerender } = renderHook(({ id }) => {
      const load = useCallback(() => id === 'a' ? a.promise : b.promise, [id]);
      return useProductResource(id, load);
    }, {
      initialProps: { id: 'a' },
    });
    rerender({ id: 'b' });
    await act(async () => { b.resolve('product B'); });
    await waitFor(() => expect(result.current.state).toMatchObject({ key: 'b', status: 'ready', data: 'product B' }));
    await act(async () => { a.resolve('product A'); });
    expect(result.current.state).toMatchObject({ key: 'b', status: 'ready', data: 'product B' });
  });
});
