// True while the browser is hydrating prerendered HTML. During that first render, components must
// produce exactly the markup the build produced, so browser-only state (localStorage, media queries,
// drafts) is read right after hydration instead of during it.
let hydrating = false;
export const isHydrating = () => hydrating;
export const setHydrating = (v: boolean) => { hydrating = v; };

/** Meta of the page being prerendered (filled by <Seo> during the build-time render). */
export const ssrMeta: { title?: string; description?: string; noindex?: boolean } = {};

/** Search snippets show ~155 characters: cut longer descriptions at a word boundary. */
export function clipDescription(s: string, max = 155): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  if (end > max * 0.6) return cut.slice(0, end + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\-–—]+$/, '') + '…';
}
