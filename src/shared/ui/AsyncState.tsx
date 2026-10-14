import type { ReactNode } from 'react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <p role="status" aria-live="polite" className="state-message">{label}</p>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <section className="state-message" role="alert">
    <p>{message}</p>
    {onRetry && <button className="button button--secondary" type="button" onClick={onRetry}>Try again</button>}
  </section>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="state-message" role="status">{children}</p>;
}
