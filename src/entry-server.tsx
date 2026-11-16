// Build-time prerender entry (see scripts/prerender.mjs). Renders a route to static HTML so that
// search engines and link previews see the real page content; the browser then hydrates it.
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import App from './App';
import { __setSsrRoute } from './core/router';
import { ssrMeta } from './core/ssr';
import { pricing } from './config/pricing';
import type { Price } from './config/pricing';
import { nowPrice } from './core/price';

export async function render(url: string): Promise<{ html: string; meta: typeof ssrMeta }> {
  __setSsrRoute(url);
  for (const k of Object.keys(ssrMeta)) delete (ssrMeta as any)[k];
  const { prelude } = await prerenderToNodeStream(<App />);
  let html = '';
  for await (const chunk of prelude) html += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
  return { html, meta: { ...ssrMeta } };
}

/** "from" price of a service for Schema.org Offer (null when the service has no fixed starting price). */
export function offerFor(serviceId: string, lang: 'uk' | 'en'): { price: number; currency: string } | null {
  const cfg = pricing[lang];
  const p = (cfg.items as Record<string, Price | undefined>)[serviceId];
  if (!p) return null;
  return { price: nowPrice(p, cfg), currency: lang === 'uk' ? 'UAH' : 'EUR' };
}
