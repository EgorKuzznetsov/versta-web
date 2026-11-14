import React, { Suspense, lazy, useState } from 'react';
import { useT } from '../core/i18n';
import { Link } from '../core/router';
import { Icon } from '../components/Icon';
import { Seo, LangSwitch, Header, Footer } from '../components/Chrome';
import { DEMO_IDS, DEMO_THEME, DemoId } from '../demos/meta';
import { clearStore } from '../core/hooks';
import NotFound from './NotFound';

const MAP: Record<DemoId, React.LazyExoticComponent<React.ComponentType>> = {
  analytics: lazy(() => import('../demos/Analytics')),
  booking: lazy(() => import('../demos/Booking')),
  menu: lazy(() => import('../demos/Menu')),
  crm: lazy(() => import('../demos/Crm')),
  store: lazy(() => import('../demos/Store')),
  estate: lazy(() => import('../demos/Estate')),
};

export default function DemoPage({ id }: { id: string }) {
  const { t, lang } = useT();
  const [k, setK] = useState(0);
  if (!(DEMO_IDS as readonly string[]).includes(id)) return <><Header /><main id="main" className="main"><NotFound /></main><Footer /></>;
  const did = id as DemoId;
  const D = MAP[did];
  const d = t.lab.demos[did];
  const idx = DEMO_IDS.indexOf(did);
  const next = DEMO_IDS[(idx + 1) % DEMO_IDS.length];
  const reset = () => { clearStore('demo.' + did); setK(k + 1); };
  return (
    <div className="dshell" style={{ ['--c-ac' as any]: DEMO_THEME[did].ac }}>
      <Seo />
      <header className="dbar">
        <Link to="lab" className="dbar-back" aria-label={t.common.back}><Icon n="arrowL" s={18} /><span>Demo Lab</span></Link>
        <div className="dbar-t"><span className="mono muted">{DEMO_THEME[did].n}</span> <b>{d.name}</b> <span className="dbar-sub muted">— {d.sub}</span></div>
        <span className="badge badge-a dbar-badge" title={t.common.demoNote}>{t.common.demoData}</span>
        <button type="button" className="dbar-btn" onClick={reset} title={t.common.reset}><Icon n="refresh" s={16} /><span>{t.common.reset}</span></button>
        <Link to={'lab/' + next} className="dbar-btn" title={t.lab.demos[next].name}><span>{t.lab.demos[next].name}</span><Icon n="arrow" s={16} /></Link>
        <LangSwitch className="dbar-lang" />
      </header>
      <main id="main" className="dmain">
        <Suspense fallback={<div className="dload mono">Loading…</div>}>
          <D key={k + lang} />
        </Suspense>
      </main>
    </div>
  );
}
