import type { Lang } from './router';

export const locale = (l: Lang) => (l === 'uk' ? 'uk-UA' : 'en-IE');

export function num(n: number, l: Lang, d = 0) {
  return new Intl.NumberFormat(locale(l), { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
}

/** UAH amount in UA; EUR in EN (demo prices are authored in UAH and converted at a fixed demo rate) */
export const DEMO_RATE = 45;
/** Demo price in display currency: UAH as is; EUR rounded to a "shelf" price
 *  (whole euros from €20 or when `whole`, otherwise 10 cents). Sum these, not raw UAH,
 *  so totals always match the line items the visitor sees. */
export function dp(uah: number, l: Lang, whole = false) {
  if (l === 'uk') return Math.round(uah);
  const raw = uah / DEMO_RATE;
  return whole || raw >= 20 ? Math.round(raw) : Math.round(raw * 10) / 10;
}
/** Format an amount that is already in display currency */
export function fmtD(v: number, l: Lang, whole = false) {
  if (l === 'uk') return num(Math.round(v), 'uk') + '\u00a0грн';
  const r = Math.round(v * 100) / 100;
  return '€' + num(r, 'en', whole || (Number.isInteger(r) && r >= 20) ? 0 : 2);
}
export function money(uah: number, l: Lang, opts: { decimals?: boolean } = {}) {
  const v = dp(uah, l, opts.decimals === false);
  if (l === 'uk') return fmtD(v, l);
  return '€' + num(v, 'en', (opts.decimals ?? v < 20) ? 2 : 0);
}
export function cur(amount: number, currency: 'UAH' | 'EUR', l: Lang) {
  return currency === 'UAH' ? num(amount, l) + ' грн' : '€' + num(amount, l);
}

export function dateFmt(d: Date | string, l: Lang, o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat(locale(l), o).format(typeof d === 'string' ? new Date(d) : d);
}
export const iso = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

/** deterministic PRNG */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
export const uid = () => Math.random().toString(36).slice(2, 9);
export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');
