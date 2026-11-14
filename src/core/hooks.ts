import { useEffect, useRef, useState, useCallback } from 'react';

const NS = 'versta.';
export function readStore<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(NS + key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch { return fallback; }
}
export function writeStore(key: string, v: unknown) {
  try { localStorage.setItem(NS + key, JSON.stringify(v)); } catch { /* storage unavailable */ }
}
export function clearStore(prefix: string) {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(NS + prefix)).forEach((k) => localStorage.removeItem(k));
  } catch { /* noop */ }
}

/** useState, synced to localStorage */
export function useStored<T>(key: string, init: T | (() => T)) {
  const [v, setV] = useState<T>(() => readStore<T>(key, typeof init === 'function' ? (init as () => T)() : init));
  useEffect(() => { writeStore(key, v); }, [key, v]);
  return [v, setV] as const;
}

/** Adds .in class when the element enters the viewport */
export function useReveal<T extends HTMLElement>(opts: { threshold?: number } = {}) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: opts.threshold ?? 0.15, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function useMedia(q: string) {
  const [m, setM] = useState(() => matchMedia(q).matches);
  useEffect(() => {
    const mq = matchMedia(q);
    const f = () => setM(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [q]);
  return m;
}

export function useCopy() {
  const [done, setDone] = useState(false);
  const copy = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* noop */ }
      ta.remove();
    }
    setDone(true); setTimeout(() => setDone(false), 1800);
  }, []);
  return { copy, done };
}

/** Tween a number toward target (for KPI counters) */
export function useTween(target: number, ms = 700) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const rm = document.documentElement.classList.contains('rm');
    if (rm) { setV(target); from.current = target; return; }
    const start = performance.now(); const a = from.current; let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms); const e = 1 - Math.pow(1 - k, 3);
      const val = a + (target - a) * e; setV(val);
      if (k < 1) raf = requestAnimationFrame(step); else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = target; };
  }, [target, ms]);
  return v;
}

export function useLockBody(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = o; };
  }, [lock]);
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog behaviour: Escape closes, focus moves inside on open,
 * Tab is kept inside (trap), and focus returns to the opener on close.
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>(open: boolean, onClose: () => void, opts: { trap?: boolean } = {}) {
  const ref = useRef<T>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const trap = opts.trap ?? true;
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el || !trap || el.contains(document.activeElement)) return;
      const first = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).find((x) => !x.closest('[aria-hidden="true"]') && !x.matches('[class*="scrim"]'));
      (first || el).focus({ preventScroll: true });
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); close.current(); return; }
      if (e.key !== 'Tab' || !trap || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null || x === document.activeElement);
      if (!items.length) return;
      const a = items[0], b = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      if (trap && opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open, trap]);
  return ref;
}
