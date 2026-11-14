import React, { useSyncExternalStore } from 'react';
import site from '../config/site.json';

export type Lang = 'uk' | 'en';
const MODE: 'path' | 'hash' = ((window as any).__ROUTING || site.routing) === 'hash' ? 'hash' : 'path';
const EVT = 'versta:nav';

function raw(): string {
  if (MODE === 'hash') return location.hash.replace(/^#/, '') || '/';
  return location.pathname;
}

export interface Route { lang: Lang; path: string; segs: string[] }

export function parse(p: string): Route {
  let clean = p.split('?')[0].replace(/index\.html$/, '').replace(/\/+$/, '');
  let segs = clean.split('/').filter(Boolean);
  let lang: Lang = 'uk';
  if (segs[0] === 'en') { lang = 'en'; segs = segs.slice(1); }
  if (segs[0] === 'uk') segs = segs.slice(1);
  return { lang, path: segs.join('/'), segs };
}

export function href(path: string, lang: Lang): string {
  const p = path.replace(/^\/+/, '');
  const pre = lang === 'en' ? 'en/' : '';
  if (MODE === 'hash') return '#/' + pre + p;
  const s = '/' + pre + p;
  return s.length > 1 && !s.endsWith('/') ? s : s;
}

let snapshot = parse(raw());
function subscribe(cb: () => void) {
  const on = () => { snapshot = parse(raw()); cb(); };
  window.addEventListener('popstate', on);
  window.addEventListener('hashchange', on);
  window.addEventListener(EVT, on);
  return () => {
    window.removeEventListener('popstate', on);
    window.removeEventListener('hashchange', on);
    window.removeEventListener(EVT, on);
  };
}
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => snapshot);
}

const reduce = () => document.documentElement.classList.contains('rm') || matchMedia('(prefers-reduced-motion: reduce)').matches;

export function navigate(to: string, opts: { replace?: boolean; keepScroll?: boolean } = {}) {
  const go = () => {
    if (MODE === 'hash') {
      const h = to.startsWith('#') ? to : '#' + to;
      if (opts.replace) history.replaceState(null, '', h); else history.pushState(null, '', h);
    } else {
      if (opts.replace) history.replaceState(null, '', to); else history.pushState(null, '', to);
    }
    snapshot = parse(raw());
    window.dispatchEvent(new Event(EVT));
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };
  const d: any = document;
  if (d.startViewTransition && !reduce() && !opts.replace && document.visibilityState === 'visible') {
    const vt = d.startViewTransition(() => { go(); return new Promise((r) => { requestAnimationFrame(() => r(null)); setTimeout(r, 60); }); });
    [vt.ready, vt.finished, vt.updateCallbackDone].forEach((p: Promise<unknown>) => p?.catch(() => {}));
  } else go();
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; lang?: Lang; keepScroll?: boolean };
export function Link({ to, lang, keepScroll, onClick, children, ...rest }: LinkProps) {
  const r = useRoute();
  const target = href(to, lang || r.lang);
  return (
    <a
      href={target}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(target, { keepScroll });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export const routingMode = MODE;
