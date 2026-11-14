import React, { useEffect } from 'react';
import { useT } from '../core/i18n';
import { Link, useRoute } from '../core/router';
import { Icon } from '../components/Icon';
import { Reveal, SplitLine } from '../components/Reveal';
import { Seo } from '../components/Chrome';
import { SERVICE_IDS, PriceFrom, ContactCta } from './Sections';
import { DemoId } from '../demos/meta';
import { promoOn, discountPct } from '../core/price';

const RELATED: Partial<Record<string, DemoId>> = {
  shop: 'store', booking: 'booking', dashboard: 'analytics', webapp: 'crm', corporate: 'estate', integrations: 'menu',
};

export default function Services() {
  const { t } = useT();
  const r = useRoute();
  const focus = r.segs[1];
  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById('svc-' + focus);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: document.documentElement.classList.contains('rm') ? 'auto' : 'smooth', block: 'start' }), 60);
  }, [focus]);
  const s0 = focus && (t.services.items as any)[focus];
  return (
    <>
      <Seo title={s0 ? s0.title : undefined} description={s0 ? s0.benefit : undefined} />
      <section className="phead">
        <div className="wrap g12">
          <div className="phead-k"><span className="kicker">{t.services.kicker}</span></div>
          <h1 className="d1 phead-t in"><SplitLine text={t.services.title} /></h1>
          <Reveal className="phead-l"><p className="lead">{t.services.lead}</p>
            {promoOn() && <p className="svc-promo"><span className="badge badge-a">−{discountPct()}%</span> <Link to="pricing" className="tlink">{t.promo.title} <Icon n="arrow" s={14} /></Link></p>}
          </Reveal>
        </div>
        <nav className="wrap svc-toc" aria-label={t.services.kicker}>
          {SERVICE_IDS.map((id, i) => (
            <Link key={id} to={'services/' + id} keepScroll className={focus === id ? 'on' : ''}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>{t.services.items[id].title}
            </Link>
          ))}
        </nav>
      </section>
      {SERVICE_IDS.map((id, i) => {
        const s = t.services.items[id];
        const rel = RELATED[id];
        return (
          <section key={id} id={'svc-' + id} className="svc">
            <div className="wrap g12">
              <div className="svc-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
              <Reveal className="svc-main">
                <h2 className="d2">{s.title}</h2>
                <p className="svc-b">{s.benefit}</p>
              </Reveal>
              <Reveal className="svc-side" delay={100}>
                <div className="svc-blk"><span className="mono muted">{t.services.forWhom}</span><p>{s.forWhom}</p></div>
                <div className="svc-blk"><span className="mono muted">{t.services.includes}</span>
                  <ul className="svc-ul">{s.includes.map((x) => <li key={x}><Icon n="check" s={16} />{x}</li>)}</ul>
                </div>
                <div className="svc-blk svc-price"><PriceFrom id={id} size="m" /></div>
                <div className="svc-act">
                  <Link to="contact" className="btn btn-s btn-p">{t.services.discuss} <Icon n="arrow" s={16} /></Link>
                  {rel && <Link to={'lab/' + rel} className="tlink">{t.services.related} <Icon n="arrow" s={14} /></Link>}
                  {id === 'support' && <Link to="pricing/maintenance" className="tlink">{t.pricing.toPlans} <Icon n="arrow" s={14} /></Link>}
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}
      <ContactCta />
    </>
  );
}
