/**
 * Lead handler: POST /api/lead → Telegram + email (Resend).
 * Used by the Worker (worker/index.js) and, for compatibility, as a Cloudflare Pages Function.
 *
 * Runtime secrets (Cloudflare → versta-web → Settings → Runtime variables and secrets → Production):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID   — Telegram delivery
 *   RESEND_API_KEY, LEAD_EMAIL_TO          — email delivery (LEAD_EMAIL_FROM optional, after verifying a domain)
 *   TURNSTILE_SECRET                       — optional: Cloudflare Turnstile bot check (with form.turnstileSiteKey in site.json)
 *   STATUS_KEY                             — optional: enables /api/lead/status?key=… diagnostics
 *   ALLOWED_ORIGINS                        — optional: extra allowed origins, comma-separated (e.g. a custom domain)
 *
 * Protection layers: same-origin check, JSON-only, body size limit, per-IP rate limit (LEAD_LIMITER binding),
 * honeypot field, minimum fill time, optional Turnstile, input sanitising, no-store/nosniff response headers.
 */
const MAX_BODY = 16_000;
const MAX_TEXT = 4000;
const SEC_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: SEC_HEADERS });

// single-line field: no control characters or line breaks (prevents header/line injection), no angle brackets
const line = (v, n = 300) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
// multi-line field: keep \n and \t, drop other control characters
const text = (v, n = MAX_TEXT) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').replace(/[<>]/g, '').trim().slice(0, n);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function originAllowed(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  const allowed = [new URL(request.url).origin, ...String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)];
  return allowed.includes(origin);
}

async function verifyTurnstile(token, request, env) {
  if (!token || typeof token !== 'string' || token.length > 2048) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: String(env.TURNSTILE_SECRET).trim(), response: token, remoteip: request.headers.get('CF-Connecting-IP') || undefined }),
    });
    const out = await r.json();
    if (!out.success) console.log('lead: turnstile rejected', JSON.stringify(out['error-codes'] || []));
    return !!out.success;
  } catch (e) {
    console.log('lead: turnstile error', String(e));
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  if (!originAllowed(request, env)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ ok: false, error: 'unsupported_type' }, 415);
  if (+(request.headers.get('Content-Length') || 0) > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413);

  if (env.LEAD_LIMITER) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const { success } = await env.LEAD_LIMITER.limit({ key: 'lead:' + ip });
    if (!success) return json({ ok: false, error: 'rate_limited' }, 429);
  }

  const tgOn = env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID;
  const mailOn = env.RESEND_API_KEY && env.LEAD_EMAIL_TO;
  if (!tgOn && !mailOn) return json({ ok: false, error: 'not_configured' }, 503);

  let raw, d;
  try { raw = await request.text(); } catch { return json({ ok: false, error: 'bad_request' }, 400); }
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413);
  try { d = JSON.parse(raw); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return json({ ok: false, error: 'bad_json' }, 400);

  // bots: hidden honeypot field filled, or the form was "filled in" faster than a human can type → pretend success
  if (d.website || (typeof d.t === 'number' && d.t < 2500)) return json({ ok: true });

  if (env.TURNSTILE_SECRET && !(await verifyTurnstile(d.turnstile, request, env))) return json({ ok: false, error: 'bot_check_failed' }, 403);

  const name = line(d.name, 120), contact = line(d.contact, 200), description = text(d.description);
  if (!name || !contact || !description) return json({ ok: false, error: 'missing_fields' }, 422);

  const rows = [
    ['Імʼя', name],
    ['Бізнес', line(d.business) || '—'],
    ['Тип сайту', line(d.type) || '—'],
    ['Бюджет', line(d.budget) || '—'],
    ['Тариф обслуговування', line(d.plan) || '—'],
    ['Звʼязок', `${line(d.method, 40)} — ${contact}`],
    ['Мова сайту', line(d.lang, 5)],
  ];
  const plain = ['Нова заявка з сайту', ...rows.map(([k, v]) => `${k}: ${v}`), '', description].join('\n');

  const jobs = [];
  if (tgOn) {
    jobs.push(fetch(`https://api.telegram.org/bot${String(env.TELEGRAM_BOT_TOKEN).trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // plain text, no parse_mode: user input can't inject formatting or links
      body: JSON.stringify({ chat_id: String(env.TELEGRAM_CHAT_ID).trim(), text: plain.slice(0, 4000), disable_web_page_preview: true }),
    }).then(async (r) => { if (!r.ok) console.log('lead: telegram failed', r.status, (await r.text()).slice(0, 300)); return r.ok; }));
  }
  if (mailOn) {
    const html = `<h2 style="font-family:sans-serif">Нова заявка з сайту</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`)
      .join('')}</table><p style="font-family:sans-serif;white-space:pre-wrap">${esc(description)}</p>`;
    const replyTo = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(contact) ? contact : undefined;
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${String(env.RESEND_API_KEY).trim()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.LEAD_EMAIL_FROM || 'Versta <onboarding@resend.dev>',
        to: [String(env.LEAD_EMAIL_TO).trim()],
        subject: `Нова заявка: ${name}`.slice(0, 150),
        text: plain,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    }).then(async (r) => { if (!r.ok) console.log('lead: email (Resend) failed', r.status, (await r.text()).slice(0, 300)); return r.ok; }));
  }

  const results = await Promise.all(jobs.map((p) => p.catch((e) => { console.log('lead: request error', String(e)); return false; })));
  return results.some(Boolean) ? json({ ok: true }) : json({ ok: false, error: 'delivery_failed' }, 502);
}

/** GET /api/lead/status?key=STATUS_KEY — which channels are configured (never the values). Hidden (404) without the key. */
export function leadStatus(request, env) {
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!env.STATUS_KEY || key.length < 8 || key !== String(env.STATUS_KEY)) return new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
  return json({
    telegram: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    email: !!(env.RESEND_API_KEY && env.LEAD_EMAIL_TO),
    turnstile: !!env.TURNSTILE_SECRET,
    rate_limit: !!env.LEAD_LIMITER,
  });
}

export const onRequest = () => new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
