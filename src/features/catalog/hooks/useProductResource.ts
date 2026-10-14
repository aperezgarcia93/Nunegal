import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '../../../shared/api/http';

export type ResourceState<T> =
  | { key: string; status: 'loading' }
  | { key: string; status: 'ready'; data: T }
  | { key: string; status: 'unavailable'; message: string }
  | { key: string; status: 'error'; message: string };

function safeMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 404) return 'This product is no longer available.';
  if (error instanceof HttpError && error.message) return error.message;
  return 'We could not load this information. Please try again.';
}

export function useProductResource<T>(key: string, load: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ResourceState<T>>({ key, status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ key, status: 'loading' });
    load().then((data) => {
      if (active) setState({ key, status: 'ready', data });
    }).catch((error: unknown) => {
      if (active) {
        const message = safeMessage(error);
        setState({ key, status: error instanceof HttpError && error.status === 404 ? 'unavailable' : 'error', message });
      }
    });
    return () => { active = false; };
  }, [key, load, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { state: state.key === key ? state : { key, status: 'loading' as const }, retry };
}
