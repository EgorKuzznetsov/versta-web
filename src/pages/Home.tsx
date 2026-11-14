import React, { useState } from 'react';
import { useT } from '../core/i18n';
import { Link } from '../core/router';
import { Icon } from '../components/Icon';
import { Reveal, SplitLine } from '../components/Reveal';
import { Seo } from '../components/Chrome';
import { LiveMock } from './LiveMock';
import { SectionHead, ServicesIndex, LabGrid, WorkList, ProcessRuler, ContactCta } from './Sections';
import { pricing, ITEMS, ItemId } from '../config/pricing';
import { PriceTag, promoOn } from '../core/price';
import { LaunchHead, LaunchList, handOff } from './PricingParts';
import { cx } from '../core/format';

export default function Home() {
  const { t } = useT();
  return (
    <>
      <Seo />
      <section className="hero">
        <div className="wrap">
          <div className="hero-top">
            <span className="kicker">{t.hero.kicker}</span>
          </div>
          <h1 className="hero-h d1 in">
            {t.hero.title.map((line, i) => (
              <span key={i} className={cx('hl', 'hl-' + i, i === t.hero.accentLine && 'hl-a')}>
                <SplitLine text={line} base={i * 3} />
              </span>
            ))}
          </h1>
          <div className="hero-grid">
            <div className="hero-side">
              <Reveal><p className="lead">{t.hero.lead}</p></Reveal>
              <Reveal className="hero-act" delay={120}>
                <Link to="work" className="btn btn-p">{t.hero.work} <Icon n="arrow" s={18} /></Link>
                <Link to="contact" className="btn">{t.hero.talk}</Link>
                <Link to="lab" className="tlink">{t.hero.demo} <Icon n="arrow" s={16} /></Link>
              </Reveal>
            </div>
            <Reveal className="hero-mock" delay={200}><LiveMock /></Reveal>
          </div>
        </div>
      </section>

      <section className="facts">
        <div className="wrap facts-in">
          {t.hero.facts.map(([n, l], i) => (
            <Reveal key={i} className="fact" delay={i * 60}><span className="fact-n">{n}</span><span className="fact-l">{l}</span></Reveal>
          ))}
        </div>
      </section>

      <section className="sec" id="services">
        <div className="wrap">
          <SectionHead n="01" kicker={t.home.servicesKicker} title={t.home.servicesTitle}
            aside={<Link to="services" className="tlink">{t.home.servicesAll} <Icon n="arrow" s={16} /></Link>} />
          <ServicesIndex />
        </div>
      </section>

      <section className="sec sec-ink" id="lab">
        <div className="wrap">
          <SectionHead n="02" kicker={t.home.labKicker} title={t.home.labTitle} lead={t.home.labLead}
            aside={<Link to="lab" className="tlink">{t.home.labAll} <Icon n="arrow" s={16} /></Link>} />
          <LabGrid />
        </div>
      </section>

      <section className="sec" id="work">
        <div className="wrap">
          <SectionHead n="03" kicker={t.home.workKicker} title={t.home.workTitle} lead={t.home.workLead}
            aside={<Link to="work" className="tlink">{t.nav.work} <Icon n="arrow" s={16} /></Link>} />
          <WorkList />
        </div>
      </section>

      <section className="sec" id="process">
        <div className="wrap">
          <SectionHead n="04" kicker={t.home.processKicker} title={t.home.processTitle} />
          <ProcessRuler />
        </div>
      </section>

      <section className="sec" id="pricing">
        <div className="wrap">
          <LaunchHead n="05" aside={<Link to="pricing" className="tlink">{t.promo.all} <Icon n="arrow" s={16} /></Link>} />
          <LaunchList />
        </div>
      </section>

      <section className="sec sec-bone" id="calc">
        <div className="wrap">
          <SectionHead n="06" kicker={t.home.calcKicker} title={t.home.calcTitle} lead={t.home.calcLead} />
          <CalcTeaser />
        </div>
      </section>

      <ContactCta />
    </>
  );
}

function CalcTeaser() {
  const { t, lang, L } = useT();
  const cfg = pricing[lang];
  const [type, setType] = useState<ItemId>('landing');
  const it = ITEMS.find((x) => x.id === type)!;
  return (
    <Reveal className="ct">
      <div className="ct-types" role="radiogroup" aria-label={t.calc.type}>
        {ITEMS.map((k) => (
          <button key={k.id} type="button" role="radio" aria-checked={type === k.id} className={cx('ct-t', type === k.id && 'on')} onClick={() => setType(k.id)}>
            <span>{L(k.name)}</span><span className="muted small">{L(k.note)}</span>
          </button>
        ))}
      </div>
      <div className="ct-out">
        <span className="mono muted">{promoOn() ? t.promo.launch : t.calc.total}</span>
        <span className="ct-sum" key={type}><PriceTag price={cfg.items[type]} size="l" /></span>
        <span className="mono">{t.calc.timeline}: ~{it.days} {t.common.days}</span>
        <button type="button" className="btn btn-p" onClick={() => handOff('calcType', type, 'calculator', lang)}>{t.home.calcCta} <Icon n="arrow" s={18} /></button>
      </div>
    </Reveal>
  );
}
