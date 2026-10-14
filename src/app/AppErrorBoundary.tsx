import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface State { failed: boolean }

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) console.error('Unexpected UI error', error, info.componentStack);
  }

  render() {
    if (this.state.failed) return <main className="page-shell page-main">
      <h1>Something went wrong.</h1>
      <p>Return to the catalog and try again.</p>
      <Link className="button button--primary" to="/">Go to catalog</Link>
    </main>;
    return this.props.children;
  }
}
