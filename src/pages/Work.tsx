import React from 'react';
import { useT } from '../core/i18n';
import { Link, useRoute } from '../core/router';
import { Reveal, SplitLine } from '../components/Reveal';
import { Seo } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { WorkList, ContactCta } from './Sections';
import { CASES } from './cases';
import { DEMO_THEME, DemoThumb } from '../demos/meta';
import NotFound from './NotFound';

export default function Work() {
  const { t } = useT();
  const r = useRoute();
  if (r.segs[1]) return <CasePage slug={r.segs[1]} />;
  return (
    <>
      <Seo />
      <section className="phead">
        <div className="wrap g12">
          <div className="phead-k"><span className="kicker">{t.work.kicker}</span></div>
          <h1 className="d1 phead-t in"><SplitLine text={t.work.title} /></h1>
          <Reveal className="phead-l"><p className="lead">{t.work.lead}</p></Reveal>
        </div>
      </section>
      <section className="sec sec-tight"><div className="wrap"><WorkList /></div></section>
      <ContactCta />
    </>
  );
}

function CasePage({ slug }: { slug: string }) {
  const { t, L } = useT();
  const i = CASES.findIndex((c) => c.id === slug);
  if (i < 0) return <NotFound />;
  const c = CASES[i];
  const next = CASES[(i + 1) % CASES.length];
  const th = DEMO_THEME[c.id];
  const rows: [string, React.ReactNode][] = [
    [t.work.task, <p className="lead">{L(c.task)}</p>],
    [t.work.design, <p className="lead">{L(c.design)}</p>],
    [t.work.features, <ul className="case-ul">{L(c.features).map((f) => <li key={f}><Icon n="check" s={16} />{f}</li>)}</ul>],
    [t.work.mobile, <p className="lead">{L(c.mobile)}</p>],
    [t.work.tech, <ul className="case-tech mono">{c.tech.map((x) => <li key={x}>{x}</li>)}</ul>],
  ];
  return (
    <>
      <Seo title={L(c.title)} description={L(c.task).slice(0, 155)} />
      <article className="case">
        <header className="case-head" style={{ ['--c-bg' as any]: th.bg, ['--c-fg' as any]: th.fg, ['--c-ac' as any]: th.ac }}>
          <div className="wrap">
            <div className="case-meta mono">
              <Link to="work" className="case-back"><Icon n="arrowL" s={14} /> {t.nav.work}</Link>
              <span>{th.n} / {CASES.length.toString().padStart(2, '0')}</span>
              <span className="badge">{t.common.concept}</span>
              <span>{c.year}</span>
            </div>
            <h1 className="d1 in"><SplitLine text={L(c.title)} /></h1>
            <p className="case-client mono">{L(c.client)} — {t.work.label}</p>
            <div className="case-hero" style={{ viewTransitionName: 'case-' + c.id } as any}><DemoThumb id={c.id} /></div>
          </div>
        </header>
        <div className="wrap case-body">
          {rows.map(([h, b], k) => (
            <Reveal key={k} className="case-row g12">
              <h2 className="case-h mono"><span className="muted">{String(k + 1).padStart(2, '0')}</span> {h}</h2>
              <div className="case-c">{b}</div>
            </Reveal>
          ))}
          <Reveal className="case-row g12">
            <h2 className="case-h mono"><span className="muted">06</span> {t.work.demo}</h2>
            <div className="case-c">
              <Link to={'lab/' + c.id} className="case-demo" style={{ ['--c-bg' as any]: th.bg, ['--c-ac' as any]: th.ac }}>
                <DemoThumb id={c.id} />
                <span className="btn btn-p">{t.work.tryIt} <Icon n="arrow" s={18} /></span>
              </Link>
            </div>
          </Reveal>
        </div>
        <Link to={'work/' + next.id} className="case-next">
          <div className="wrap">
            <span className="mono muted">{t.work.next}</span>
            <span className="d2">{L(next.title)} <Icon n="arrow" s={40} /></span>
          </div>
        </Link>
      </article>
    </>
  );
}
