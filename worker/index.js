/**
 * Cloudflare Worker entry: serves the static site from ./dist and handles POST /api/lead
 * (the same lead handler as functions/api/lead.js, which is kept for Cloudflare Pages).
 */
import { onRequestPost } from '../functions/api/lead.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/lead') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
    }
    return env.ASSETS.fetch(request);
  },
};
