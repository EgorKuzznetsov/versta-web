/**
 * Cloudflare Worker entry: serves the static site from ./dist and handles the form endpoint.
 * Runs first for every request (run_worker_first), so it can:
 *  - send the extra hostnames (www, *.workers.dev) to the main domain with a 301 redirect;
 *  - add the security headers to every response, whatever served it.
 */
import { onRequestPost, leadStatus } from '../functions/api/lead.js';

const CANONICAL_HOST = 'verstaweb.com';

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; font-src 'self' https://fonts.bunny.net; img-src 'self' data: blob:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), interest-cohort=()',
};

function secure(res, path) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  if (path.startsWith('/assets/') && res.status === 200) out.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return out;
}

async function route(request, env, url) {
  if (url.pathname === '/api/lead/status') return leadStatus(request, env);
  if (url.pathname === '/api/lead') {
    if (request.method === 'POST') return onRequestPost({ request, env });
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  if (url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    // one address for search engines and visitors: www.verstaweb.com and the workers.dev address → verstaweb.com
    if ((host === 'www.' + CANONICAL_HOST || host.endsWith('.workers.dev')) && (request.method === 'GET' || request.method === 'HEAD')) {
      return secure(Response.redirect(`https://${CANONICAL_HOST}${url.pathname}${url.search}`, 301), url.pathname);
    }
    return secure(await route(request, env, url), url.pathname);
  },
};
