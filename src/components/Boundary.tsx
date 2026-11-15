import React from 'react';
import { reloadOnce } from '../core/lazy';

// Shows a calm fallback instead of a blank page if a page fails to render or load.
export class Boundary extends React.Component<{ children: React.ReactNode; resetKey?: string }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e: unknown) {
    const msg = String((e as Error)?.message || e);
    if (/dynamically imported module|Importing a module script|Loading chunk|Failed to fetch/i.test(msg)) reloadOnce();
  }
  componentDidUpdate(prev: { resetKey?: string }) { if (prev.resetKey !== this.props.resetKey && this.state.err) this.setState({ err: false }); }
  render() {
    if (!this.state.err) return this.props.children;
    const uk = document.documentElement.lang !== 'en';
    return (
      <div className="wrap pfail">
        <p className="d4">{uk ? 'Сторінка не завантажилась.' : 'The page didn’t load.'}</p>
        <button type="button" className="btn" onClick={() => window.location.reload()}>{uk ? 'Оновити сторінку' : 'Reload page'}</button>
      </div>
    );
  }
}
