import React, { Suspense, lazy } from 'react';
import { useRoute } from './core/router';
import { LangProvider } from './core/i18n';
import { Header, Footer } from './components/Chrome';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Services = lazy(() => import('./pages/Services'));
const Lab = lazy(() => import('./pages/Lab'));
const Work = lazy(() => import('./pages/Work'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Legal = lazy(() => import('./pages/Legal'));
const DemoPage = lazy(() => import('./pages/DemoPage'));

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
        <Suspense fallback={null}><DemoPage id={r.segs[1]} /></Suspense>
      ) : (
        <>
          <Header />
          <main id="main" className="main">
            <Suspense fallback={<div className="pload" />}><Page /></Suspense>
          </main>
          <Footer />
        </>
      )}
    </LangProvider>
  );
}
