import React from 'react';
import { createRoot } from 'react-dom/client';
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

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
