// Dependency-free fallback build (uses esbuild directly). The primary build is `npm run build` (Vite).
// Usage: node scripts/build-local.mjs [outDir] [--hash]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(root, process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'dist');
const hash = process.argv.includes('--hash');
const nodePaths = [path.join(root, 'node_modules'), process.env.ESBUILD_NODE_PATH || '/opt/npm-tools/node_modules'];
const req = createRequire(import.meta.url);
let esbuild;
for (const p of nodePaths) { try { esbuild = await import(pathToFileURL(req.resolve('esbuild', { paths: [p] })).href); break; } catch { /* try next */ } }
if (!esbuild) throw new Error('esbuild not found');
esbuild = esbuild.default || esbuild;

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), out, { recursive: true });
const res = await esbuild.build({
  entryPoints: [path.join(root, 'src/main.tsx')], bundle: true, splitting: true, format: 'esm', minify: true, sourcemap: false,
  target: 'es2020', outdir: path.join(out, 'assets'), entryNames: '[name]-[hash]', chunkNames: 'c-[hash]', assetNames: '[name]-[hash]',
  jsx: 'automatic', nodePaths, metafile: true, define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning',
});
const outs = Object.entries(res.metafile.outputs);
const js = outs.find(([, o]) => o.entryPoint?.endsWith('main.tsx'))[0];
const css = outs.find(([f]) => f.endsWith('.css') && f.includes('main-'))?.[0];
const rel = (f) => '/' + path.relative(out, path.join(root, f)).split(path.sep).join('/');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('<script type="module" src="/src/main.tsx"></script>',
  (hash ? '<script>window.__ROUTING="hash"</script>' : '') + `<script type="module" crossorigin src="${rel(js)}"></script>`);
if (css) html = html.replace('</head>', `  <link rel="stylesheet" href="${rel(css)}" />\n  </head>`);
fs.writeFileSync(path.join(out, 'index.html'), html);
const size = outs.filter(([f]) => f.endsWith('.js')).reduce((a, [, o]) => a + o.bytes, 0);
console.log(`esbuild: ${outs.length} files, JS ${(size / 1024).toFixed(0)} KB → ${path.relative(root, out)}`);
