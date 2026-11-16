import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../core/i18n';
import { Link } from '../core/router';
import { Icon } from '../components/Icon';
import { Reveal, SplitLine } from '../components/Reveal';
import { DEMO_IDS, DEMO_THEME, DemoThumb, DemoId } from '../demos/meta';
import { CASES } from './cases';
import { pricing, ItemId } from '../config/pricing';
import { PriceTag } from '../core/price';
import { cx } from '../core/format';
import { useMedia } from '../core/hooks';

export const SERVICE_IDS = ['landing', 'corporate', 'shop', 'booking', 'dashboard', 'webapp', 'redesign', 'integrations', 'support'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export function SectionHead({ n, kicker, title, lead, aside }: { n: string; kicker: string; title: string; lead?: string; aside?: React.ReactNode }) {
  return (
    <Reveal className="shead g12">
      <div className="shead-k"><span className="mono muted">({n})</span><span className="kicker">{kicker}</span></div>
      <div className="shead-t">
        <h2 className="d2"><SplitLine text={title} /></h2>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {aside && <div className="shead-a">{aside}</div>}
    </Reveal>
  );
}

export function PriceFrom({ id, size = 's' }: { id: string; size?: 's' | 'm' | 'l' }) {
  const { t, lang } = useT();
  const p = pricing[lang];
  if (id in p.items) return <PriceTag price={p.items[id as ItemId]} size={size} />;
  if (id === 'integrations') return <PriceTag price={{ regular: p.other.integrations, promo: p.other.integrations }} size={size} />;
  if (id === 'support') return <PriceTag price={{ regular: p.maintenance.basic, promo: p.maintenance.basic }} suffix={t.plans.perMonth} size={size} />;
  return null;
}

export function ServicesIndex() {
  const { t } = useT();
  return (
    <ol className="sidx">
      {SERVICE_IDS.map((id, i) => {
        const s = t.services.items[id];
        return (
          <Reveal as="li" key={id} delay={i * 40}>
            <Link to={'services/' + id} className="sidx-row">
              <span className="sidx-n mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="sidx-t">{s.title}</span>
              <span className="sidx-s">{s.short}</span>
              <span className="sidx-p mono"><PriceFrom id={id} /></span>
              <span className="sidx-a"><Icon n="arrowUR" /></span>
            </Link>
          </Reveal>
        );
      })}
    </ol>
  );
}

export function LabGrid({ big = false }: { big?: boolean }) {
  const { t } = useT();
  return (
    <div className={cx('lgrid', big && 'big')}>
      {DEMO_IDS.map((id, i) => {
        const d = t.lab.demos[id];
        const th = DEMO_THEME[id];
        return (
          <Reveal key={id} className={'lcard lc-' + i} delay={(i % 3) * 70}>
            <Link to={'lab/' + id} className="lcard-in" style={{ ['--c-bg' as any]: th.bg, ['--c-ac' as any]: th.ac }}>
              <div className="lcard-img"><DemoThumb id={id} /></div>
              <div className="lcard-meta">
                <span className="mono">{th.n} / {d.name}</span>
                <span className="badge">{t.common.demoProject}</span>
              </div>
              {big ? <h2 className="d4">{d.sub}</h2> : <h3 className="d4">{d.sub}</h3>}
              <p className="muted">{d.desc}</p>
              <span className="tlink">{t.common.openDemo} <Icon n="arrow" s={16} /></span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

/** Work list with a cursor-following preview on hover devices */
export function WorkList({ limit }: { limit?: number }) {
  const { t, L } = useT();
  const hover = useMedia('(hover: hover) and (pointer: fine)');
  const [act, setAct] = useState<DemoId | null>(null);
  const prev = useRef<HTMLDivElement>(null);
  const list = limit ? CASES.slice(0, limit) : CASES;
  useEffect(() => {
    if (!hover) return;
    let x = 0, y = 0, cx0 = 0, cy0 = 0, raf = 0;
    const mv = (e: PointerEvent) => { x = e.clientX; y = e.clientY; };
    const loop = () => {
      cx0 += (x - cx0) * 0.18; cy0 += (y - cy0) * 0.18;
      if (prev.current) prev.current.style.transform = `translate(${cx0 + 24}px, ${cy0 - 120}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', mv); raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('pointermove', mv); cancelAnimationFrame(raf); };
  }, [hover]);
  return (
    <div className="wlist" onPointerLeave={() => setAct(null)}>
      {list.map((c, i) => (
        <Reveal key={c.id} delay={i * 50}>
          <Link to={'work/' + c.id} className={cx('wrow', act === c.id && 'on')} onPointerEnter={() => setAct(c.id)} onFocus={() => setAct(c.id)}>
            <span className="mono muted">{DEMO_THEME[c.id].n}</span>
            <span className="wrow-t">{L(c.title)}</span>
            <span className="wrow-c muted">{L(c.client)}</span>
            <span className="badge">{t.common.concept}</span>
            <span className="wrow-y mono">{c.year}</span>
            {!hover && <span className="wrow-img" style={{ viewTransitionName: 'case-' + c.id } as any}><DemoThumb id={c.id} /></span>}
          </Link>
        </Reveal>
      ))}
      {hover && (
        <div className={cx('wprev', act && 'on')} ref={prev} aria-hidden="true">
          {DEMO_IDS.map((id) => <div key={id} className={cx('wprev-i', act === id && 'on')} style={act === id ? ({ viewTransitionName: 'case-' + id } as any) : undefined}><DemoThumb id={id} /></div>)}
        </div>
      )}
    </div>
  );
}

/** Process as a measuring ruler: the marker travels to the active step */
export function ProcessRuler() {
  const { t } = useT();
  const steps = t.process.steps;
  const [a, setA] = useState(0);
  const mobile = useMedia('(max-width: 820px)');
  const s = steps[a];
  if (mobile) {
    return (
      <ol className="pr-v">
        {steps.map((st, i) => (
          <Reveal as="li" key={st.n} delay={i * 40}>
            <span className="pr-v-n mono">{st.n}</span>
            <div>
              <h3 className="d4">{st.title}</h3>
              <p className="muted">{st.text}</p>
              <dl className="pr-dl mono"><div><dt>{t.process.duration}</dt><dd>{st.time}</dd></div><div><dt>{t.process.result}</dt><dd>{st.out}</dd></div></dl>
            </div>
          </Reveal>
        ))}
      </ol>
    );
  }
  return (
    <Reveal className="pr">
      <div className="pr-ruler" role="tablist" aria-label={t.home.processTitle}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setA((v) => Math.min(steps.length - 1, v + 1));
          if (e.key === 'ArrowLeft') setA((v) => Math.max(0, v - 1));
        }}>
        <div className="pr-ticks" aria-hidden="true" />
        <div className="pr-marker" style={{ transform: `translateX(${a * 100}%)`, width: `${100 / steps.length}%` }} aria-hidden="true"><span /></div>
        {steps.map((st, i) => (
          <button key={st.n} type="button" role="tab" aria-selected={a === i} tabIndex={a === i ? 0 : -1}
            className={cx('pr-step', a === i && 'on', i < a && 'done')} onClick={() => setA(i)} onPointerEnter={() => setA(i)}>
            <span className="mono">{st.n}</span>
            <span className="pr-step-t">{st.title}</span>
          </button>
        ))}
      </div>
      <div className="pr-body" role="tabpanel" key={a}>
        <div className="pr-big" aria-hidden="true">{s.n}</div>
        <div className="pr-txt">
          <h3 className="d3">{s.title}</h3>
          <p className="lead">{s.text}</p>
        </div>
        <dl className="pr-dl mono">
          <div><dt>{t.process.duration}</dt><dd>{s.time}</dd></div>
          <div><dt>{t.process.result}</dt><dd>{s.out}</dd></div>
          <div className="pr-nav">
            <button type="button" aria-label="prev" disabled={a === 0} onClick={() => setA(a - 1)}><Icon n="arrowL" /></button>
            <button type="button" aria-label="next" disabled={a === steps.length - 1} onClick={() => setA(a + 1)}><Icon n="arrow" /></button>
          </div>
        </dl>
      </div>
    </Reveal>
  );
}

export function ContactCta() {
  const { t } = useT();
  return (
    <section className="cta">
      <div className="wrap">
        <Reveal className="cta-in">
          <span className="kicker">{t.nav.contact}</span>
          <Link to="contact" className="cta-link">
            <span className="d1"><SplitLine text={t.home.contactTitle} /></span>
            <span className="cta-arrow"><Icon n="arrowUR" s={56} /></span>
          </Link>
          <p className="lead">{t.home.contactLead}</p>
        </Reveal>
      </div>
    </section>
  );
}
