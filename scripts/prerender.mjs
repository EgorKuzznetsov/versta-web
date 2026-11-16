// Bundles src/entry-server.tsx for Node and renders every route to HTML.
// Used by postbuild.mjs; if anything here fails, postbuild keeps the plain (client-rendered) pages.
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

export async function createRenderer(root) {
  const req = createRequire(path.join(root, 'package.json'));
  let esbuild;
  try { esbuild = req('esbuild'); } catch { esbuild = createRequire('/opt/npm-tools/node_modules/')('esbuild'); }
  const outdir = path.join(root, 'node_modules', '.versta-ssr');
  fs.mkdirSync(outdir, { recursive: true });
  const outfile = path.join(outdir, 'entry-server.mjs');
  await esbuild.build({
    entryPoints: [path.join(root, 'src/entry-server.tsx')],
    bundle: true, platform: 'node', format: 'esm', target: 'node20', outfile, write: true,
    jsx: 'automatic', loader: { '.css': 'empty', '.svg': 'dataurl', '.png': 'dataurl' },
    define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true' },
    nodePaths: [path.join(root, 'node_modules'), '/opt/npm-tools/node_modules'],
    banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
    logLevel: 'error',
  });
  const mod = await import(pathToFileURL(outfile).href + '?t=' + Date.now());
  return Object.assign(mod.render, { offerFor: mod.offerFor });
}
