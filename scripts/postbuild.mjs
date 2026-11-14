// Runs after the bundle is built (Vite or the local esbuild script).
// Generates a static HTML entry per route and language with correct <title>, meta,
// canonical, hreflang and Open Graph tags; plus 404.html, sitemap.xml and robots.txt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(root, process.argv[2] || 'dist');
const seo = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/seo.json'), 'utf8'));
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site.json'), 'utf8'));
const tpl = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const domain = site.domain.replace(/\/$/, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const services = ['landing', 'corporate', 'shop', 'booking', 'dashboard', 'webapp', 'redesign', 'integrations', 'support'];
const routes = [...Object.keys(seo.pages), ...services.map((s) => 'services/' + s), ...seo.caseSlugs.map((s) => 'work/' + s), 'pricing/maintenance'];
const url = (lang, r) => domain + (lang === 'en' ? '/en' : '') + (r ? '/' + r : '/');
const meta = (r, lang) => seo.pages[r]?.[lang] || seo.pages[r.split('/')[0]]?.[lang] || seo.pages[''][lang];

// Structured data for the home page (only fields that are actually filled in site.json)
function jsonLd(lang) {
  const c = site.contacts;
  const same = [c.telegram && 'https://t.me/' + c.telegram.replace(/^@/, '')].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.studio.name,
    url: url(lang, ''),
    image: domain + '/og-image.png',
    description: seo.pages[''][lang].description,
    areaServed: ['UA', 'EU'],
    availableLanguage: ['uk', 'en'],
    ...(c.email ? { email: c.email } : {}),
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(same.length ? { sameAs: same } : {}),
  };
}

function head(r, lang, { noindex = false } = {}) {
  const m = meta(r, lang);
  const title = r === '' ? m.title : m.title + seo.brandSuffix;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<meta name="robots" content="${noindex ? 'noindex' : 'index,follow'}" />`,
    !noindex && `<link rel="canonical" href="${url(lang, r)}" />`,
    !noindex && `<link rel="alternate" hreflang="uk" href="${url('uk', r)}" />`,
    !noindex && `<link rel="alternate" hreflang="en" href="${url('en', r)}" />`,
    !noindex && `<link rel="alternate" hreflang="x-default" href="${url('uk', r)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(site.studio.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${url(lang, r)}" />`,
    `<meta property="og:image" content="${domain}/og-image.png" />`,
    `<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="${lang === 'uk' ? 'uk_UA' : 'en_US'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    r === '' && !noindex && `<script type="application/ld+json">${JSON.stringify(jsonLd(lang))}</script>`,
  ].filter(Boolean).join('\n    ');
}
const render = (r, lang, o) =>
  tpl.replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, '<!--SEO-->\n    ' + head(r, lang, o) + '\n    <!--/SEO-->').replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);

let n = 0;
for (const lang of ['uk', 'en']) {
  for (const r of routes) {
    const rel = (lang === 'en' ? 'en/' : '') + r;
    const file = path.join(dist, rel, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, render(r, lang));
    n++;
  }
}
fs.writeFileSync(path.join(dist, '404.html'), render('', 'uk', { noindex: true }));

const today = new Date().toISOString().slice(0, 10);
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
for (const r of routes.filter((x) => !x.startsWith('legal/'))) {
  for (const lang of ['uk', 'en']) {
    sm.push(`  <url><loc>${url(lang, r)}</loc><lastmod>${today}</lastmod>` +
      `<xhtml:link rel="alternate" hreflang="uk" href="${url('uk', r)}"/><xhtml:link rel="alternate" hreflang="en" href="${url('en', r)}"/></url>`);
  }
}
sm.push('</urlset>');
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sm.join('\n'));
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${domain}/sitemap.xml\n`);
console.log(`postbuild: ${n} route pages, 404.html, sitemap.xml, robots.txt → ${path.relative(root, dist)}`);
