import React, { Suspense } from 'react';
import { lazyRetry } from './core/lazy';
import { useRoute } from './core/router';
import { LangProvider } from './core/i18n';
import { Header, Footer } from './components/Chrome';
import { Boundary } from './components/Boundary';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { setHydrating } from './core/ssr';

// rendered after the page inside the same Suspense boundary: its effect runs once the page has hydrated
function HydrationDone() { React.useEffect(() => { setHydrating(false); }, []); return null; }

const Services = lazyRetry(() => import('./pages/Services'));
const Lab = lazyRetry(() => import('./pages/Lab'));
const Work = lazyRetry(() => import('./pages/Work'));
const Calculator = lazyRetry(() => import('./pages/Calculator'));
const Contact = lazyRetry(() => import('./pages/Contact'));
const Pricing = lazyRetry(() => import('./pages/Pricing'));
const Legal = lazyRetry(() => import('./pages/Legal'));
const DemoPage = lazyRetry(() => import('./pages/DemoPage'));

function Page() {
  const r = useRoute();
  const [a, b] = r.segs;
  switch (a) {
    case undefined: return <Home />;
    case 'services': return <Services />;
    case 'lab': return <Lab />;
    case 'work': return <Work />;
    case 'calculator': return <Calculator />;
    case 'pricing': return <Pricing />;
    case 'contact': return <Contact />;
    case 'legal': return <Legal />;
    default: return <NotFound />;
  }
  void b;
}

export default function App() {
  const r = useRoute();
  const isDemo = r.segs[0] === 'lab' && !!r.segs[1];
  return (
    <LangProvider lang={r.lang}>
      {isDemo ? (
        <Boundary resetKey={r.path}><Suspense fallback={null}><DemoPage id={r.segs[1]} /></Suspense></Boundary>
      ) : (
        <>
          <Header />
          <main id="main" className="main">
            <Boundary resetKey={r.path}><Suspense fallback={<div className="pload" />}><Page /><HydrationDone /></Suspense></Boundary>
          </main>
          <Footer />
        </>
      )}
    </LangProvider>
  );
}
