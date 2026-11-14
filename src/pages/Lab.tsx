import React from 'react';
import { useT } from '../core/i18n';
import { Reveal, SplitLine } from '../components/Reveal';
import { Seo } from '../components/Chrome';
import { Icon } from '../components/Icon';
import { LabGrid } from './Sections';

export default function Lab() {
  const { t } = useT();
  return (
    <>
      <Seo />
      <section className="phead phead-ink">
        <div className="wrap g12">
          <div className="phead-k"><span className="kicker">{t.lab.kicker}</span></div>
          <h1 className="d1 phead-t in"><SplitLine text={t.lab.title} /></h1>
          <Reveal className="phead-l">
            <p className="lead">{t.lab.lead}</p>
            <p className="honest"><Icon n="info" s={16} /> {t.lab.honest}</p>
          </Reveal>
        </div>
      </section>
      <section className="sec sec-ink sec-tight">
        <div className="wrap"><LabGrid big /></div>
      </section>
    </>
  );
}
