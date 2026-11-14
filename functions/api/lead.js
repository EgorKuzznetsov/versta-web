/**
 * Cloudflare Pages Function: POST /api/lead
 * Пересилає заявку з форми сайту в Telegram і на email. Безкоштовно, без власного сервера.
 *
 * Змінні (Cloudflare → Pages → проєкт → Settings → Variables and Secrets), тип «Secret»:
 *   TELEGRAM_BOT_TOKEN  — токен бота від @BotFather
 *   TELEGRAM_CHAT_ID    — ваш chat id (напр., дізнатися в @userinfobot)
 *   RESEND_API_KEY      — ключ API з resend.com (безкоштовно: 100 листів/день)
 *   LEAD_EMAIL_TO       — пошта, на яку приходять заявки. Поки в Resend не підтверджено
 *                         власний домен, це має бути ТА САМА пошта, з якою ви зареєструвалися в Resend.
 *   LEAD_EMAIL_FROM     — (необовʼязково) відправник після підтвердження домену,
 *                         напр. "Versta <leads@вашдомен.com>". За замовчуванням onboarding@resend.dev.
 *
 * Канали незалежні: налаштований лише один — працює лише він.
 * Успіх повертається, лише якщо заявку прийняв хоча б один канал.
 */
const MAX = 4000;
const clean = (v, n = 300) => String(v ?? '').replace(/[<>]/g, '').slice(0, n).trim();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function onRequestPost({ request, env }) {
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const tgOn = env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID;
  const mailOn = env.RESEND_API_KEY && env.LEAD_EMAIL_TO;
  if (!tgOn && !mailOn) return json({ ok: false, error: 'not_configured' }, 503);

  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  if (d.website) return json({ ok: true }); // honeypot: bots fill the hidden field
  const name = clean(d.name, 120), contact = clean(d.contact, 200), description = clean(d.description, MAX);
  if (!name || !contact || !description) return json({ ok: false, error: 'missing_fields' }, 422);

  const rows = [
    ['Імʼя', name],
    ['Бізнес', clean(d.business) || '—'],
    ['Тип сайту', clean(d.type) || '—'],
    ['Бюджет', clean(d.budget) || '—'],
    ['Тариф обслуговування', clean(d.plan) || '—'],
    ['Звʼязок', `${clean(d.method, 40)} — ${contact}`],
    ['Мова сайту', clean(d.lang, 5)],
  ];
  const text = ['Нова заявка з сайту', ...rows.map(([k, v]) => `${k}: ${v}`), '', description].join('\n');

  const jobs = [];
  if (tgOn) {
    jobs.push(fetch(`https://api.telegram.org/bot${String(env.TELEGRAM_BOT_TOKEN).trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: String(env.TELEGRAM_CHAT_ID).trim(), text, disable_web_page_preview: true }),
    }).then(async (r) => { if (!r.ok) console.log('lead: telegram failed', r.status, (await r.text()).slice(0, 300)); return r.ok; }));
  }
  if (mailOn) {
    const html = `<h2 style="font-family:sans-serif">Нова заявка з сайту</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`)
      .join('')}</table><p style="font-family:sans-serif;white-space:pre-wrap">${esc(description)}</p>`;
    const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : undefined;
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.LEAD_EMAIL_FROM || 'Versta <onboarding@resend.dev>',
        to: [env.LEAD_EMAIL_TO],
        subject: `Нова заявка: ${name}`,
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    }).then(async (r) => { if (!r.ok) console.log('lead: email (Resend) failed', r.status, (await r.text()).slice(0, 300)); return r.ok; }));
  }

  const results = await Promise.all(jobs.map((p) => p.catch((e) => { console.log('lead: request error', String(e)); return false; })));
  return results.some(Boolean) ? json({ ok: true }) : json({ ok: false, error: 'delivery_failed' }, 502);
}

/** GET /api/lead/status — shows which channels are configured (never the values) */
export function leadStatus(env) {
  const mask = (e) => (e ? e.replace(/^(.).*(@.*)$/, '$1***$2') : null);
  return new Response(JSON.stringify({
    telegram: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    telegram_token_present: !!env.TELEGRAM_BOT_TOKEN,
    telegram_token_format_ok: !!env.TELEGRAM_BOT_TOKEN && /^\d+:[\w-]{30,}$/.test(env.TELEGRAM_BOT_TOKEN.trim()),
    telegram_chat_id_present: !!env.TELEGRAM_CHAT_ID,
    telegram_chat_id_format_ok: !!env.TELEGRAM_CHAT_ID && /^-?\d+$/.test(env.TELEGRAM_CHAT_ID.trim()),
    email: !!(env.RESEND_API_KEY && env.LEAD_EMAIL_TO),
    resend_key_present: !!env.RESEND_API_KEY,
    resend_key_format_ok: !!env.RESEND_API_KEY && /^re_/.test(env.RESEND_API_KEY.trim()),
    email_to: mask(env.LEAD_EMAIL_TO),
  }, null, 2), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export const onRequest = () => new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
