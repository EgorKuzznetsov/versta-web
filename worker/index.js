/**
 * Cloudflare Worker entry: serves the static site from ./dist and handles the form endpoint.
 * Static responses get their security headers from public/_headers; responses created here set their own.
 */
import { onRequestPost, leadStatus } from '../functions/api/lead.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/lead/status') return leadStatus(request, env);
    if (url.pathname === '/api/lead') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST', 'X-Content-Type-Options': 'nosniff' } });
    }
    if (url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
    return env.ASSETS.fetch(request);
  },
};
