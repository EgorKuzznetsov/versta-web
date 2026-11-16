import { reloadOnce } from './core/lazy';
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { setHydrating } from './core/ssr';
import App from './App';
import { parse, href, navigate, routingMode } from './core/router';
import { LANG_KEY } from './core/i18n';
import './styles/base.css';
import './styles/site.css';
import './styles/demos.css';

// Restore saved language on first load (only when the URL has no explicit /en prefix)
try {
  const saved = localStorage.getItem(LANG_KEY);
  const raw = routingMode === 'hash' ? location.hash.replace(/^#/, '') || '/' : location.pathname;
  const r = parse(raw);
  if (saved === 'en' && r.lang === 'uk' && !sessionStorage.getItem('versta.langChecked')) navigate(href(r.path, 'en'), { replace: true, keepScroll: true });
  sessionStorage.setItem('versta.langChecked', '1');
} catch { /* storage unavailable */ }

// a module preload failed (stale chunk after a deploy) → reload once instead of a blank page
window.addEventListener('vite:preloadError', (e) => { if (reloadOnce()) e.preventDefault(); });

const rootEl = document.getElementById('root')!;
const app = <React.StrictMode><App /></React.StrictMode>;
// Pages are prerendered at build time (scripts/prerender.mjs): hydrate them; demos ship an empty root.
if (rootEl.hasChildNodes()) {
  setHydrating(true);
  // mismatches (e.g. the language was switched from a saved preference) are re-rendered by React on its own
  hydrateRoot(rootEl, app, { onRecoverableError: () => {} });
} else {
  createRoot(rootEl).render(app);
}
