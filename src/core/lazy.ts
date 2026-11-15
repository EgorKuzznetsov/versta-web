import { lazy, ComponentType } from 'react';

// After a new deploy, a tab opened earlier still references the old JS chunk names, which no longer exist.
// The import then fails and the page stays blank until a manual reload. Here we retry once, and if the chunk
// is really gone we reload the page once (guarded so it can never loop).
const KEY = 'versta.chunkReload';

export function reloadOnce() {
  try {
    const last = +(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 15000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { /* storage blocked: still reload once */ }
  window.location.reload();
  return true;
}

export function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().catch(() =>
      new Promise<{ default: T }>((res, rej) => setTimeout(() => load().then(res, (e) => { if (!reloadOnce()) rej(e); }), 600)),
    ),
  );
}
