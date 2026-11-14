import React from 'react';
import { useT } from '../core/i18n';
import { Link } from '../core/router';
import { Seo } from '../components/Chrome';
import { Icon } from '../components/Icon';

export default function NotFound() {
  const { t } = useT();
  return (
    <section className="nf">
      <Seo title={t.notFound.title} noindex />
      <div className="wrap g12">
        <div className="nf-code" aria-hidden="true"><span>4</span><span className="accent">0</span><span>4</span></div>
        <div className="nf-txt">
          <h1 className="d2">{t.notFound.title}</h1>
          <p className="lead">{t.notFound.text}</p>
          <div className="hero-act">
            <Link to="" className="btn btn-p">{t.notFound.home} <Icon n="arrow" s={18} /></Link>
            <Link to="lab" className="btn">{t.notFound.lab}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
