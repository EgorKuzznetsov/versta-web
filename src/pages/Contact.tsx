import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../core/i18n';
import { Link } from '../core/router';
import { Icon } from '../components/Icon';
import { Reveal, SplitLine } from '../components/Reveal';
import { Seo, ContactLinks } from '../components/Chrome';
import { useCopy } from '../core/hooks';
import { cx } from '../core/format';
import site from '../config/site.json';
import { pricing, ITEMS, PLANS } from '../config/pricing';
import { fmt } from '../core/price';

type Status = 'idle' | 'sending' | 'ok' | 'error' | 'offline';

export default function Contact() {
  const { t, lang, L } = useT();
  const c = t.contact;
  // select values are language-independent ids, so switching UA/EN keeps the choices
  const [f, setF] = useState({ name: '', business: '', type: '', budget: '', plan: 'none', description: '', method: '0', contact: '', consent: false, website: '' });
  const [fromPlan, setFromPlan] = useState(false);
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [fromCalc, setFromCalc] = useState(false);
  const { copy, done } = useCopy();
  const [errCode, setErrCode] = useState('');
  const openedAt = useRef(Date.now()); // bots submit instantly; the server ignores submissions faster than ~2.5 s
  const tsBox = useRef<HTMLDivElement>(null);
  const tsId = useRef<string | null>(null);
  const [tsToken, setTsToken] = useState('');
  const siteKey = (site.form as any).turnstileSiteKey as string;

  // Optional Cloudflare Turnstile (bot check) — only when a site key is configured
  useEffect(() => {
    if (!siteKey || !tsBox.current) return;
    const w = window as any;
    const render = () => {
      if (!tsBox.current || tsId.current) return;
      tsId.current = w.turnstile.render(tsBox.current, {
        sitekey: siteKey, appearance: 'interaction-only', language: lang === 'uk' ? 'uk' : 'en',
        callback: (tok: string) => setTsToken(tok), 'expired-callback': () => setTsToken(''), 'error-callback': () => setTsToken(''),
      });
    };
    if (w.turnstile) { render(); return; }
    let s = document.querySelector('script[data-ts]') as HTMLScriptElement | null;
    if (!s) { s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true; s.dataset.ts = '1'; document.head.appendChild(s); }
    s.addEventListener('load', render);
    return () => { s?.removeEventListener('load', render); try { if (tsId.current) w.turnstile?.remove(tsId.current); } catch { /* noop */ } tsId.current = null; };
  }, [siteKey, lang, status === 'ok']);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('versta.calcSummary');
      if (s) { setF((v) => ({ ...v, description: s + '\n\n' })); setFromCalc(true); sessionStorage.removeItem('versta.calcSummary'); }
      const plan = sessionStorage.getItem('versta.plan');
      if (plan && (plan === 'none' || PLANS.some((x) => x.id === plan))) { setF((v) => ({ ...v, plan })); if (plan !== 'none') setFromPlan(true); }
      sessionStorage.removeItem('versta.plan');
      const ty = sessionStorage.getItem('versta.calcType');
      if (ty && s && ITEMS.some((x) => x.id === ty)) setF((v) => ({ ...v, type: ty }));
      sessionStorage.removeItem('versta.calcType');
    } catch { /* noop */ }
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setF({ ...f, [k]: v as any }); if (errs[k]) setErrs({ ...errs, [k]: false });
    if (status === 'error' || status === 'offline') setStatus('idle');
  };

  const typeLabel = f.type === 'unsure' ? c.unsure : f.type ? L(ITEMS.find((x) => x.id === f.type)!.name) : '';
  const budgetLabel = f.budget ? c.budgetOptions[+f.budget] : '';
  const planObj = PLANS.find((x) => x.id === f.plan);
  const planLabel = planObj ? `${planObj.name} — ${fmt(pricing[lang].maintenance[planObj.id], lang)} ${t.plans.perMonth}` : c.planNone;
  const methodLabel = c.methods[+f.method] || '';
  const text = [
    `${c.name}: ${f.name}`, `${c.business}: ${f.business || '—'}`, `${c.type}: ${typeLabel || '—'}`, `${c.budget}: ${budgetLabel || '—'}`, `${c.plan}: ${planLabel}`,
    `${c.method}: ${methodLabel} — ${f.contact}`, '', f.description,
  ].join('\n');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const req = { name: !f.name.trim(), description: !f.description.trim(), contact: !f.contact.trim(), consent: !f.consent };
    setErrs(req);
    if (Object.values(req).some(Boolean)) { setStatus('idle'); return; }
    if (f.website) return; // honeypot
    if (!site.form.endpoint) { setStatus('offline'); return; }
    setStatus('sending');
    try {
      const res = await fetch(site.form.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...site.form.extraFields, t: Date.now() - openedAt.current, turnstile: tsToken || undefined, website: f.website || undefined, name: f.name, business: f.business, type: typeLabel, budget: budgetLabel, plan: planLabel, description: f.description, method: methodLabel, contact: f.contact, lang, page: location.href }),
      });
      if (res.ok) { setStatus('ok'); return; }
      setErrCode(res.status === 429 ? 'rate' : res.status === 403 ? 'bot' : '');
      setStatus('error');
      try { if (tsId.current) { (window as any).turnstile?.reset(tsId.current); setTsToken(''); } } catch { /* noop */ }
    } catch { setStatus('error'); }
  };

  return (
    <>
      <Seo />
      <section className="phead">
        <div className="wrap g12">
          <div className="phead-k"><span className="kicker">{c.kicker}</span></div>
          <h1 className="d1 phead-t in"><SplitLine text={c.title} /></h1>
          <Reveal className="phead-l"><p className="lead">{c.lead}</p></Reveal>
        </div>
      </section>
      <section className="contact">
        <div className="wrap g12">
          <aside className="contact-side">
            <ContactLinks className="contact-links" />
            <p className="mono muted">{site.location[lang]}</p>
          </aside>
          {status === 'ok' ? (
            <div className="form-ok" role="status">
              <Icon n="check" s={40} />
              <h2 className="d3">{c.success}</h2>
            </div>
          ) : (
            <form className="cform" onSubmit={submit} noValidate>
              {fromCalc && <p className="cform-note mono"><Icon n="info" s={14} /> {c.fromCalc}</p>}
              {fromPlan && !fromCalc && <p className="cform-note mono"><Icon n="info" s={14} /> {c.fromPlan}</p>}
              <div className="cform-2">
                <label className={cx('field', errs.name && 'err')}><span>{c.name} *</span><input value={f.name} onChange={set('name')} autoComplete="name" maxLength={120} required /></label>
                <label className="field"><span>{c.business}</span><input value={f.business} onChange={set('business')} autoComplete="organization" maxLength={200} /></label>
              </div>
              <div className="cform-2">
                <label className="field"><span>{c.type}</span>
                  <select value={f.type} onChange={set('type')}><option value="">—</option>{ITEMS.map((o) => <option key={o.id} value={o.id}>{L(o.name)}</option>)}<option value="unsure">{c.unsure}</option></select>
                </label>
                <label className="field"><span>{c.budget}</span>
                  <select value={f.budget} onChange={set('budget')}><option value="">—</option>{c.budgetOptions.map((o, i) => <option key={o} value={String(i)}>{o}</option>)}</select>
                </label>
              </div>
              <label className={cx('field', fromPlan && 'hl')}><span>{c.plan}</span>
                <select value={f.plan} onChange={set('plan')}>
                  <option value="none">{c.planNone}</option>
                  {PLANS.map((x) => <option key={x.id} value={x.id}>{x.name} — {fmt(pricing[lang].maintenance[x.id], lang)} {t.plans.perMonth}</option>)}
                </select>
              </label>
              <label className={cx('field', errs.description && 'err')}><span>{c.description} *</span>
                <textarea rows={6} value={f.description} onChange={set('description')} placeholder={c.descriptionHint} maxLength={4000} required />
              </label>
              <div className="field">
                <span>{c.method}</span>
                <div className="seg seg-wrap" role="radiogroup">
                  {c.methods.map((m, i) => (
                    <label key={m} className={cx(f.method === String(i) && 'on')}><input type="radio" name="method" checked={f.method === String(i)} onChange={() => setF({ ...f, method: String(i) })} />{m}</label>
                  ))}
                </div>
              </div>
              <label className={cx('field', errs.contact && 'err')}><span>{c.contactValue} *</span><input value={f.contact} onChange={set('contact')} maxLength={200} required /></label>
              <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" name="website" />
              <label className={cx('check', errs.consent && 'err')}>
                <input type="checkbox" checked={f.consent} onChange={set('consent')} />
                <span className="check-ui" aria-hidden="true"><Icon n="check" s={14} /></span>
                <span>{c.consent} <Link to="legal/privacy" className="tlink">{c.consentLink}</Link></span>
              </label>
              {Object.values(errs).some(Boolean) && <p className="form-err" role="alert">{c.required}</p>}
              {siteKey && <div ref={tsBox} className="ts-box" />}
              {status === 'error' && <p className="form-err" role="alert">{errCode === 'rate' ? c.rateLimited : errCode === 'bot' ? c.botCheck : c.error}</p>}
              {status === 'offline' && (
                <div className="form-off" role="alert">
                  <p>{c.notConnected}</p>
                  <button type="button" className="btn btn-s" onClick={() => copy(text)}><Icon n={done ? 'check' : 'copy'} s={16} /> {done ? t.common.copied : c.copyText}</button>
                  <ContactLinks className="form-off-links" />
                </div>
              )}
              <button type="submit" className="btn btn-p cform-submit" disabled={status === 'sending'}>
                {status === 'sending' ? c.sending : c.submit} <Icon n="send" s={18} />
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
