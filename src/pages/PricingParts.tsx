import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../core/i18n';
import { navigate, href } from '../core/router';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import { pricing, ITEMS, PLANS, COMPARE, TERMS, PlanId, ItemId } from '../config/pricing';
import { promoOn, discountPct, fmt, nowPrice } from '../core/price';
import { useTween } from '../core/hooks';
import { cx } from '../core/format';

/** Store a choice for another page (calculator / contact form) and go there */
export function handOff(key: 'plan' | 'calcType', value: string, to: string, lang: 'uk' | 'en') {
  try { sessionStorage.setItem('versta.' + key, value); } catch { /* storage unavailable */ }
  navigate(href(to, lang));
}

/** Header for the price list: launch offer wording while the promo is on, neutral otherwise */
export function LaunchHead({ n, aside }: { n: string; aside?: React.ReactNode }) {
  const { t } = useT();
  const on = promoOn();
  return (
    <Reveal className="shead g12 lo-head">
      <div className="shead-k"><span className="mono muted">({n})</span><span className="kicker">{on ? t.promo.kicker : t.pricing.kicker}</span></div>
      <div className="shead-t">
        <h2 className="d2">{on ? t.promo.title : t.pricing.devTitle}</h2>
        {on && <p className="lead">{t.promo.lead.replace('{pct}', String(discountPct()))}</p>}
      </div>
      {(on || aside) && (
        <div className="shead-a lo-aside">
          {on && <span className="lo-pct" aria-hidden="true">−{discountPct()}%</span>}
          {aside}
        </div>
      )}
    </Reveal>
  );
}

/** Editorial price ledger: item · standard price (struck) · launch price */
export function LaunchList() {
  const { t, lang, L } = useT();
  const cfg = pricing[lang];
  const on = promoOn();
  return (
    <div className={cx('lo', !on && 'off')}>
      <div className="lo-row lo-th mono" aria-hidden="true">
        <span>№</span><span>{t.promo.item}</span>
        {on && <span className="r">{t.promo.regular}</span>}
        <span className="r">{on ? t.promo.launch : t.promo.regular}</span><span />
      </div>
      <ol>
        {ITEMS.map((it, i) => {
          const pr = cfg.items[it.id];
          return (
            <Reveal as="li" key={it.id} delay={i * 35}>
              <a href={href('calculator', lang)} className="lo-row" onClick={(e) => { e.preventDefault(); handOff('calcType', it.id, 'calculator', lang); }}>
                <span className="lo-n mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="lo-name"><b>{L(it.name)}</b><span className="muted">{L(it.note)}</span></span>
                {on && <span className="lo-old r"><s><span className="sr">{t.promo.regular}: </span>{t.common.from} {fmt(pr.regular, lang)}</s></span>}
                <span className="lo-now r"><span className="pt-from">{t.common.from}</span> <b>{fmt(nowPrice(pr, cfg), lang)}</b></span>
                <span className="lo-go" aria-hidden="true"><Icon n="arrowUR" s={18} /></span>
              </a>
            </Reveal>
          );
        })}
      </ol>
      <p className="lo-note small muted"><Icon n="info" s={14} /> {t.promo.note}</p>
    </div>
  );
}

/** Number that counts up when it scrolls into view */
function CountUp({ value, render }: { value: number; render: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const v = useTween(seen ? value : 0, 1100);
  return <span ref={ref} aria-label={render(value)}><span aria-hidden="true">{render(Math.round(v))}</span></span>;
}

export function Plans() {
  const { t, lang, L } = useT();
  const cfg = pricing[lang];
  const choose = (id: PlanId) => handOff('plan', id, 'contact', lang);
  return (
    <div className="pl">
      <div className="pl-grid">
        {PLANS.map((p, i) => {
          const m = cfg.maintenance[p.id];
          return (
            <Reveal key={p.id} className={cx('pl-col', p.best && 'best')} delay={i * 90}>
              {p.best && <span className="pl-best mono"><Icon n="check" s={12} /> {t.plans.best}</span>}
              <div className="pl-top">
                <span className="pl-name mono">{String(i + 1).padStart(2, '0')} / {p.name}</span>
                <p className="pl-lead">{L(p.lead)}</p>
              </div>
              <div className="pl-price">
                <b><CountUp value={m} render={(v) => fmt(v, lang)} /></b>
                <span className="pl-per">{t.plans.perMonth}</span>
                <span className="pl-year mono">{fmt(m * 12, lang)} {t.plans.perYear}</span>
              </div>
              <div className="pl-feat">
                <span className="mono muted">{t.plans.included}</span>
                <ul>
                  {L(p.features).map((f) => <li key={f}><Icon n="check" s={16} />{f}</li>)}
                  {p.excluded && L(p.excluded).map((f) => <li key={f} className="no"><Icon n="minus" s={16} />{f}</li>)}
                </ul>
              </div>
              <button type="button" className={cx('btn', p.best && 'btn-p', 'pl-btn')} onClick={() => choose(p.id)} aria-label={`${t.plans.choose}: ${p.name}`}>
                {t.plans.choose} <Icon n="arrow" s={18} />
              </button>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="pl-cmp">
        <h3 className="mono">{t.plans.compare}</h3>
        <div className="pl-table" role="region" aria-label={t.plans.compare} tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th scope="col">{t.plans.feature}</th>
                {PLANS.map((p) => <th key={p.id} scope="col" className={cx(p.best && 'best')}>{p.name}<span>{fmt(cfg.maintenance[p.id], lang)} {t.plans.perMonth}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label.uk}>
                  <th scope="row">{L(row.label)}</th>
                  {row.v.map((v, k) => (
                    <td key={k} className={cx(PLANS[k].best && 'best')}>
                      {v === true ? <><Icon n="check" s={18} /><span className="sr">{t.plans.yes}</span></>
                        : v === false ? <><span className="pl-dash" aria-hidden="true">-</span><span className="sr">{t.plans.no}</span></>
                        : L(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="pl-tr-act">
                <th scope="row" />
                {PLANS.map((p) => (
                  <td key={p.id} className={cx(p.best && 'best')}>
                    <button type="button" className="tlink" onClick={() => choose(p.id)}>{t.plans.choose} <Icon n="arrow" s={14} /></button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}

export function Terms() {
  const { t, L } = useT();
  return (
    <Reveal className="tm" id="terms">
      <h3 className="d3">{t.terms.title}</h3>
      <div className="tm-grid">
        <div>
          <span className="mono muted">{t.terms.small}</span>
          <ol className="tm-small">{L(TERMS.smallChange).map((x, i) => <li key={x}><span className="mono">{String(i + 1).padStart(2, '0')}</span>{x}</li>)}</ol>
        </div>
        <div>
          <span className="mono muted">{t.terms.other}</span>
          <ul className="tm-notes">{L(TERMS.notes).map((x) => <li key={x}><Icon n="info" s={16} />{x}</li>)}</ul>
        </div>
      </div>
    </Reveal>
  );
}

export const typeName = (id: ItemId, lang: 'uk' | 'en') => ITEMS.find((i) => i.id === id)!.name[lang];
