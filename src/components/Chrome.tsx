import React, { useEffect, useState } from 'react';
import { Link, navigate, href, useRoute, Lang } from '../core/router';
import { useT, LANG_KEY } from '../core/i18n';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { useLockBody, useDialog } from '../core/hooks';
import site from '../config/site.json';
import seo from '../i18n/seo.json';

export function LangSwitch({ className = '' }: { className?: string }) {
  const r = useRoute();
  const { t } = useT();
  const set = (l: Lang) => {
    if (l === r.lang) return;
    try { localStorage.setItem(LANG_KEY, l); } catch { /* noop */ }
    navigate(href(r.path, l), { keepScroll: true });
  };
  return (
    <div className={'lang ' + className} role="group" aria-label={t.nav.langLabel}>
      {(['uk', 'en'] as Lang[]).map((l) => (
        <button key={l} type="button" aria-pressed={r.lang === l} className={r.lang === l ? 'on' : ''} onClick={() => set(l)} lang={l}>
          {l === 'uk' ? 'UA' : 'EN'}
        </button>
      ))}
    </div>
  );
}

const NAV: [string, keyof ReturnType<typeof useT>['t']['nav']][] = [
  ['services', 'services'], ['lab', 'lab'], ['work', 'work'], ['pricing', 'pricing'], ['calculator', 'calculator'], ['contact', 'contact'],
];

export function Header() {
  const { t } = useT();
  const r = useRoute();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useLockBody(open);
  const navRef = useDialog(open, () => setOpen(false), { trap: false });
  useEffect(() => setOpen(false), [r.path, r.lang]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const active = (p: string) => r.segs[0] === p;
  return (
    <>
      <a className="skip" href="#main">{t.nav.skip}</a>
      <header className={'hdr' + (scrolled ? ' scrolled' : '') + (open ? ' open' : '')}>
        <div className="hdr-in">
          <Link to="" className="hdr-logo" aria-label={site.studio.name}><Logo /></Link>
          <nav className="hdr-nav" aria-label="Main">
            {NAV.map(([p, k], i) => (
              <Link key={p} to={p} className={active(p) ? 'on' : ''} aria-current={active(p) ? 'page' : undefined}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>{t.nav[k]}
              </Link>
            ))}
          </nav>
          <div className="hdr-right">
            <LangSwitch />
            <button className="hdr-burger" type="button" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>
              <span className="mono">{open ? t.nav.close : t.nav.menu}</span>
              <Icon n={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>
      <div id="mnav" ref={navRef} className={'mnav' + (open ? ' open' : '')} aria-hidden={!open}>
        <nav>
          {NAV.map(([p, k], i) => (
            <Link key={p} to={p} tabIndex={open ? 0 : -1} style={{ ['--i' as any]: i }}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>{t.nav[k]}
            </Link>
          ))}
        </nav>
        <div className="mnav-foot mono">{site.location[r.lang]}</div>
      </div>
    </>
  );
}

export function Footer() {
  const { t, lang } = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="ftr">
      <div className="ftr-grid">
        <div className="ftr-brand">
          <Logo />
          <p>{t.footer.note}</p>
          <p className="mono muted">{site.location[lang]}</p>
        </div>
        <nav className="ftr-col" aria-label="Footer">
          {NAV.map(([p, k]) => <Link key={p} to={p}>{t.nav[k]}</Link>)}
        </nav>
        <div className="ftr-col">
          <span className="mono muted">{t.footer.legal}</span>
          <Link to="legal/privacy">{t.footer.privacy}</Link>
          <Link to="legal/terms">{t.footer.terms}</Link>
          <Link to="legal/imprint">{t.footer.imprint}</Link>
        </div>
        <ContactLinks className="ftr-col" />
      </div>
      <div className="ftr-base mono">
        <span>© {year} {site.studio.name}</span>
        <span>{t.footer.rights}</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t.footer.top} ↑</button>
      </div>
    </footer>
  );
}

export function contactHrefs() {
  const c = site.contacts;
  const out: { k: 'telegram' | 'whatsapp' | 'email' | 'phone'; href: string; label: string }[] = [];
  if (c.telegram) out.push({ k: 'telegram', href: 'https://t.me/' + c.telegram.replace(/^@/, ''), label: '@' + c.telegram.replace(/^@/, '') });
  if (c.whatsapp) out.push({ k: 'whatsapp', href: 'https://wa.me/' + c.whatsapp.replace(/\D/g, ''), label: c.whatsapp });
  if (c.email) out.push({ k: 'email', href: 'mailto:' + c.email, label: c.email });
  if (c.phone) out.push({ k: 'phone', href: 'tel:' + c.phone.replace(/[^\d+]/g, ''), label: c.phone });
  return out;
}

export function ContactLinks({ className = '' }: { className?: string }) {
  const { t } = useT();
  const list = contactHrefs();
  return (
    <div className={className}>
      <span className="mono muted">{t.contact.direct}</span>
      {list.length === 0 && <span className="muted small">{t.contact.noChannels}</span>}
      {list.map((c) => (
        <a key={c.k} href={c.href} target={c.k === 'telegram' || c.k === 'whatsapp' ? '_blank' : undefined} rel="noopener" className="clink">
          <Icon n={c.k} s={16} /> <span>{t.contact.channels[c.k]}</span>
        </a>
      ))}
    </div>
  );
}

function setMeta(sel: string, attr: string, val: string) {
  let el = document.head.querySelector(sel) as HTMLElement | null;
  if (!el) {
    el = document.createElement(sel.startsWith('link') ? 'link' : 'meta');
    const m = sel.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/);
    if (m) el.setAttribute(m[1], m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, val);
}

export function Seo({ title, description, noindex }: { title?: string; description?: string; noindex?: boolean }) {
  const r = useRoute();
  useEffect(() => {
    const entry = (seo.pages as any)[r.path]?.[r.lang] || (r.segs[0] === 'work' ? null : null);
    const ti = title || entry?.title || seo.pages[''][r.lang].title;
    const de = description || entry?.description || seo.pages[''][r.lang].description;
    const full = r.path === '' ? ti : ti + seo.brandSuffix;
    document.title = full;
    document.documentElement.lang = r.lang;
    setMeta('meta[name="description"]', 'content', de);
    setMeta('meta[property="og:title"]', 'content', full);
    setMeta('meta[property="og:description"]', 'content', de);
    setMeta('meta[property="og:locale"]', 'content', r.lang === 'uk' ? 'uk_UA' : 'en_US');
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex' : 'index,follow');
    const base = site.domain.replace(/\/$/, '');
    const pathFor = (l: Lang) => base + (l === 'en' ? '/en' : '') + (r.path ? '/' + r.path : '/');
    setMeta('link[rel="canonical"]', 'href', pathFor(r.lang));
    setMeta('link[hreflang="uk"]', 'href', pathFor('uk'));
    setMeta('link[hreflang="en"]', 'href', pathFor('en'));
    setMeta('link[hreflang="x-default"]', 'href', pathFor('uk'));
    document.head.querySelectorAll('link[hreflang]').forEach((l) => l.setAttribute('rel', 'alternate'));
  }, [r.path, r.lang, title, description, noindex]);
  return null;
}

export function DemoNote({ className = '' }: { className?: string }) {
  const { t } = useT();
  return <p className={'demo-note ' + className}><Icon n="info" s={14} /> {t.common.demoNote}</p>;
}
