import React, { useEffect, useMemo } from 'react';
import { useT } from '../core/i18n';
import { navigate, href } from '../core/router';
import { Icon } from '../components/Icon';
import { Reveal, SplitLine } from '../components/Reveal';
import { Seo } from '../components/Chrome';
import { EmailMenu } from '../components/EmailMenu';
import { pricing, ITEMS, PLANS, DAYS, ItemId, PlanId, Feat, PricingConfig, Price } from '../config/pricing';
import { nowPrice, promoOn, discountPct, fmt } from '../core/price';
import { cx } from '../core/format';
import { useStored, useCopy, useTween } from '../core/hooks';
import site from '../config/site.json';

interface CalcState {
  type: ItemId; pages: number; langs: number;
  feats: Record<Feat, boolean>;
  anim: 'basic' | 'moderate' | 'rich';
  maint: 'none' | PlanId;
  urg: 'standard' | 'fast' | 'rush';
}
const INIT: CalcState = { type: 'corporate', pages: 8, langs: 1, feats: { booking: false, shop: false, analytics: false, admin: false }, anim: 'moderate', maint: 'none', urg: 'standard' };
const FEATS: Feat[] = ['booking', 'shop', 'analytics', 'admin'];

/** One-off development (regular vs launch price) and monthly maintenance are computed separately */
export function compute(s: CalcState, p: PricingConfig) {
  const item = ITEMS.find((i) => i.id === s.type)!;
  const inc = new Set<Feat>(item.includes || []);
  const lines: { k: string; regular: number; now: number }[] = [];
  const add = (k: string, pr: Price, n = 1) => lines.push({ k, regular: pr.regular * n, now: nowPrice(pr, p) * n });
  let days = item.days;
  add('base', p.items[s.type]);
  const xp = Math.max(0, s.pages - item.includedPages);
  if (xp) { add('pages', p.extraPage, xp); days += xp * DAYS.extraPage; }
  const xl = Math.max(0, s.langs - 1);
  if (xl) { add('langs', p.extraLanguage, xl); days += xl * DAYS.extraLanguage; }
  FEATS.forEach((f) => { if (s.feats[f] && !inc.has(f)) { add('f.' + f, p.addons[f]); days += DAYS[f]; } });
  if (p.animations[s.anim].regular) { add('anim', p.animations[s.anim]); days += s.anim === 'rich' ? DAYS.rich : DAYS.moderate; }
  const u = p.urgency[s.urg];
  const subR = lines.reduce((a, l) => a + l.regular, 0), subN = lines.reduce((a, l) => a + l.now, 0);
  if (u.mult !== 1) lines.push({ k: 'urgency', regular: Math.round(subR * (u.mult - 1)), now: Math.round(subN * (u.mult - 1)) });
  const r = (v: number) => Math.round(v / p.roundTo) * p.roundTo;
  const regular = r(subR * u.mult), now = r(subN * u.mult);
  const monthly = s.maint === 'none' ? 0 : p.maintenance[s.maint];
  return { lines, regular, now, savings: Math.max(0, regular - now), days: Math.ceil(days * u.daysMult), monthly, yearly: monthly * 12, included: inc };
}

export default function Calculator() {
  const { t, lang, L } = useT();
  const p = pricing[lang];
  const promo = promoOn();
  const [s, setS] = useStored<CalcState>('calc2', INIT);
  const res = useMemo(() => compute(s, p), [s, p]);
  const up = (patch: Partial<CalcState>) => setS({ ...s, ...patch });
  const { copy, done } = useCopy();
  const nowT = useTween(res.now), regT = useTween(res.regular);
  const C = (v: number) => fmt(Math.round(v), lang);
  const item = ITEMS.find((i) => i.id === s.type)!;
  const planName = s.maint === 'none' ? t.calc.noMaint : PLANS.find((x) => x.id === s.maint)!.name;

  // type pre-selected from the price list / home page
  useEffect(() => {
    try {
      const pre = sessionStorage.getItem('versta.calcType') as ItemId | null;
      if (pre && ITEMS.some((i) => i.id === pre)) { setS((v) => ({ ...v, type: pre, pages: ITEMS.find((i) => i.id === pre)!.includedPages })); }
      sessionStorage.removeItem('versta.calcType');
    } catch { /* noop */ }
  }, []);

  const lineLabel = (k: string) => k.startsWith('f.') ? t.calc.f[k.slice(2) as Feat] : k === 'anim' ? `${t.calc.animations}: ${t.calc.anim[s.anim]}` : (t.calc.lines as any)[k] + (k === 'base' ? ` - ${L(item.name)}` : '');
  const weeks = Math.max(1, Math.round(res.days / 5));
  const from = t.common.from;

  const summary = [
    t.calc.summaryTitle,
    `${t.calc.type}: ${L(item.name)}`,
    `${t.calc.pages}: ${s.pages} · ${t.calc.languages}: ${s.langs}`,
    ...FEATS.filter((f) => s.feats[f] || res.included.has(f)).map((f) => `+ ${t.calc.f[f]}`),
    `${t.calc.animations}: ${t.calc.anim[s.anim]} · ${t.calc.urgency}: ${t.calc.urg[s.urg]}`,
    '',
    `${t.calc.dev}:`,
    promo ? `  ${t.calc.launchPrice}: ${from} ${C(res.now)}` : `  ${t.calc.total}: ${from} ${C(res.regular)}`,
    promo ? `  ${t.calc.regularPrice}: ${from} ${C(res.regular)}` : '',
    promo && res.savings ? `  ${t.calc.savings}: ${C(res.savings)}` : '',
    `  ${t.calc.timeline}: ~${res.days} ${t.common.days}`,
    '',
    `${t.calc.maintTitle}: ${res.monthly ? `${planName} - ${C(res.monthly)} ${t.plans.perMonth} (${C(res.yearly)} ${t.calc.perYear})` : t.calc.maintNo}`,
    '',
    t.promo.note,
  ].filter((x, i, a) => x !== '' || (a[i - 1] !== '' && i > 0)).join('\n');

  const tg = 'https://t.me/share/url?url=' + encodeURIComponent(site.domain) + '&text=' + encodeURIComponent(summary);
  const discuss = () => {
    try {
      sessionStorage.setItem('versta.calcSummary', summary);
      sessionStorage.setItem('versta.plan', s.maint);
      sessionStorage.setItem('versta.calcType', s.type);
    } catch { /* noop */ }
    navigate(href('contact', lang));
  };

  return (
    <>
      <Seo />
      <section className="phead">
        <div className="wrap g12">
          <div className="phead-k"><span className="kicker">{t.calc.kicker}</span></div>
          <h1 className="d1 phead-t in"><SplitLine text={t.calc.title} /></h1>
          <Reveal className="phead-l">
            <p className="lead">{t.calc.lead}</p>
            {promo && <p className="svc-promo"><span className="badge badge-a">−{discountPct()}%</span> <span>{t.promo.title}</span></p>}
          </Reveal>
        </div>
      </section>
      <section className="calc">
        <div className="wrap calc-grid">
          <div className="calc-form">
            <fieldset className="cf">
              <legend className="mono">01 · {t.calc.type}</legend>
              <div className="cf-types">
                {ITEMS.map((k) => (
                  <label key={k.id} className={cx('cf-type', s.type === k.id && 'on')}>
                    <input type="radio" name="type" checked={s.type === k.id} onChange={() => up({ type: k.id, pages: k.includedPages })} />
                    <span className="cf-type-t">{L(k.name)}</span>
                    <span className="small muted">{L(k.note)}</span>
                    <span className="cf-type-p mono">
                      {from} {fmt(nowPrice(p.items[k.id], p), lang)}
                      {promo && <s>{fmt(p.items[k.id].regular, lang)}</s>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="cf">
              <legend className="mono">02 · {t.calc.pages}</legend>
              <div className="cf-range">
                <input type="range" min={1} max={40} value={s.pages} onChange={(e) => up({ pages: +e.target.value })} aria-label={t.calc.pages}
                  style={{ ['--v' as any]: ((s.pages - 1) / 39) * 100 + '%' }} />
                <output className="cf-out">{s.pages}</output>
              </div>
              <p className="small muted">{item.includedPages} {t.calc.pagesIncluded}</p>
            </fieldset>

            <fieldset className="cf">
              <legend className="mono">03 · {t.calc.languages}</legend>
              <div className="stepper">
                <button type="button" aria-label="−" onClick={() => up({ langs: Math.max(1, s.langs - 1) })} disabled={s.langs <= 1}><Icon n="minus" /></button>
                <output>{s.langs}</output>
                <button type="button" aria-label="+" onClick={() => up({ langs: Math.min(6, s.langs + 1) })} disabled={s.langs >= 6}><Icon n="plus" /></button>
              </div>
            </fieldset>

            <fieldset className="cf">
              <legend className="mono">04 · {t.calc.features}</legend>
              <div className="cf-feats">
                {FEATS.map((f) => {
                  const inc = res.included.has(f);
                  return (
                    <label key={f} className={cx('switch', (s.feats[f] || inc) && 'on', inc && 'locked')}>
                      <input type="checkbox" checked={s.feats[f] || inc} disabled={inc} onChange={(e) => up({ feats: { ...s.feats, [f]: e.target.checked } })} />
                      <span className="switch-ui" aria-hidden="true" />
                      <span>{t.calc.f[f]}</span>
                      <span className="mono muted">{inc ? t.calc.included : '+' + fmt(nowPrice(p.addons[f], p), lang)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Seg n="05" label={t.calc.animations} value={s.anim} opts={t.calc.anim} onChange={(v) => up({ anim: v as any })} />
            <Seg n="06" label={t.calc.urgency} value={s.urg} opts={t.calc.urg} onChange={(v) => up({ urg: v as any })} />

            <fieldset className="cf">
              <legend className="mono">07 · {t.calc.maintenance}</legend>
              <div className="cf-plans" role="radiogroup">
                {([{ id: 'none', name: t.calc.noMaint }, ...PLANS.map((x) => ({ id: x.id, name: x.name, best: x.best }))] as { id: CalcState['maint']; name: string; best?: boolean }[]).map((o) => (
                  <label key={o.id} className={cx('cf-plan', s.maint === o.id && 'on')}>
                    <input type="radio" name="maint" checked={s.maint === o.id} onChange={() => up({ maint: o.id })} />
                    <span className={cx('cf-plan-n', o.id !== 'none' && 'mono')}>{o.name}</span>
                    <span className="small muted">{o.id === 'none' ? '-' : `${fmt(p.maintenance[o.id as PlanId], lang)} ${t.plans.perMonth}`}</span>
                    {o.best && <span className="cf-plan-b mono">{t.plans.bestShort}</span>}
                  </label>
                ))}
              </div>
              <p className="small muted">{t.calc.maintNote}</p>
            </fieldset>
          </div>

          <aside className="calc-res" aria-live="polite">
            <div className="cr-in">
              <div className="cr-block">
                <span className="mono muted">{t.calc.dev}</span>
                {promo && <span className="cr-lbl">{t.calc.launchPrice}</span>}
                <div className="cr-sum"><span className="cr-from">{from}</span> <span>{C(nowT)}</span></div>
                {promo && res.savings > 0 && (
                  <div className="cr-old">
                    <span>{t.calc.regularPrice}: <s>{from} {C(regT)}</s></span>
                    <span className="cr-save">{t.calc.savings}: {C(res.savings)} · −{discountPct()}%</span>
                  </div>
                )}
                <div className="cr-kv one">
                  <div><span className="mono muted">{t.calc.timeline}</span><b>~{res.days} {t.common.days}</b><span className="muted small">≈ {weeks} {t.common.weeks}</span></div>
                </div>
              </div>

              <div className={cx('cr-block cr-maint', !res.monthly && 'empty')}>
                <span className="mono muted">{t.calc.maintTitle}</span>
                {res.monthly ? (
                  <div className="cr-m">
                    <span className="mono">{planName}</span>
                    <b>{C(res.monthly)} <span className="muted">{t.plans.perMonth}</span></b>
                    <span className="muted small">{C(res.yearly)} {t.calc.perYear}</span>
                  </div>
                ) : <p className="muted small">{t.calc.maintNo}</p>}
              </div>

              <details className="cr-br" open>
                <summary className="mono">{t.calc.breakdown}</summary>
                <ul>{res.lines.map((l) => (
                  <li key={l.k}><span>{lineLabel(l.k)}</span>
                    <span className="mono cr-line">{promo && l.regular !== l.now && <s>{C(l.regular)}</s>}{C(l.now)}</span>
                  </li>
                ))}</ul>
              </details>
              <div className="cr-act">
                <button type="button" className="btn btn-p" onClick={discuss}>{t.calc.discuss} <Icon n="arrow" s={18} /></button>
                <div className="cr-share">
                  <button type="button" className="btn btn-s" onClick={() => copy(summary)}><Icon n={done ? 'check' : 'copy'} s={16} /> {done ? t.common.copied : t.calc.copy}</button>
                  <a className="btn btn-s" href={tg} target="_blank" rel="noopener"><Icon n="telegram" s={16} /> Telegram</a>
                  <EmailMenu to={site.contacts.email} subject={t.calc.summaryTitle} body={summary} className="btn btn-s" up><Icon n="mail" s={16} /> Email</EmailMenu>
                </div>
              </div>
              <p className="small muted cr-disc">{t.promo.note} {t.calc.disclaimer}</p>
            </div>
          </aside>
        </div>
        <div className="calc-bar" aria-hidden="true">
          <div><span className="mono muted">{promo ? t.calc.launchPrice : t.calc.total}</span><b>{from} {C(res.now)}{promo && res.savings > 0 && <s> {C(res.regular)}</s>}</b></div>
          <div className="calc-bar-r"><span className="mono">~{res.days} {t.common.days}</span>{res.monthly > 0 && <span className="mono">+ {C(res.monthly)} {t.plans.perMonth}</span>}</div>
        </div>
      </section>
    </>
  );
}

function Seg({ n, label, value, opts, onChange, note }: { n: string; label: string; value: string; opts: Record<string, string>; onChange: (v: string) => void; note?: string }) {
  return (
    <fieldset className="cf">
      <legend className="mono">{n} · {label}</legend>
      <div className="seg" role="radiogroup">
        {Object.entries(opts).map(([k, v]) => (
          <label key={k} className={cx(value === k && 'on')}>
            <input type="radio" checked={value === k} onChange={() => onChange(k)} name={'seg' + n} />{v}
          </label>
        ))}
      </div>
      {note && <p className="small muted">{note}</p>}
    </fieldset>
  );
}
