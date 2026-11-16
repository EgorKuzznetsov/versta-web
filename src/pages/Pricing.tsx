import React, { useEffect } from 'react';
import { useT } from '../core/i18n';
import { Link, useRoute } from '../core/router';
import { Icon } from '../components/Icon';
import { Reveal, SplitLine } from '../components/Reveal';
import { Seo } from '../components/Chrome';
import { SectionHead, ContactCta } from './Sections';
import { LaunchHead, LaunchList, Plans, Terms } from './PricingParts';

export default function Pricing() {
  const { t } = useT();
  const r = useRoute();
  const focus = r.segs[1];
  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById(focus === 'maintenance' ? 'maintenance' : focus);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: document.documentElement.classList.contains('rm') ? 'auto' : 'smooth', block: 'start' }), 60);
  }, [focus]);
  return (
    <>
      <Seo />
      <section className="phead">
        <div className="wrap g12">
          <div className="phead-k"><span className="kicker">{t.pricing.kicker}</span></div>
          <h1 className="d1 phead-t in"><SplitLine text={t.pricing.title} /></h1>
          <Reveal className="phead-l rv-t">
            <p className="lead">{t.pricing.lead}</p>
            <div className="hero-act" style={{ marginTop: 24 }}>
              <Link to="pricing/maintenance" keepScroll className="tlink">{t.pricing.toPlans} <Icon n="arrow" s={16} /></Link>
              <Link to="calculator" className="tlink">{t.home.calcCta} <Icon n="arrow" s={16} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="sec" id="development">
        <div className="wrap">
          <LaunchHead n="01" />
          <LaunchList />
        </div>
      </section>
      <section className="sec sec-paper" id="maintenance">
        <div className="wrap">
          <SectionHead n="02" kicker={t.plans.kicker} title={t.plans.title} lead={t.plans.lead} />
          <Plans />
          <Terms />
        </div>
      </section>
      <ContactCta />
    </>
  );
}
