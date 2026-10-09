// Declaration files emitted by vite-plugin-dts keep the extensionless
// relative specifiers from the TypeScript sources (`from './Icon'`). That's
// fine under moduleResolution=Bundler, but TypeScript consumers on
// `NodeNext`/`Node16` (any native-ESM project) reject them with TS2834 —
// ES module specifiers must carry an explicit extension there. This
// rewrites them in a built dist/ to point at the real emitted file
// (`./Icon.js`, or `./frames/index.js` for a directory), which every
// resolution mode accepts. Usage: node fix-dts-extensions.mjs <distDir>
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const distDir = resolve(process.argv[2] ?? 'dist');

function* dtsFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* dtsFiles(full);
    else if (entry.endsWith('.d.ts')) yield full;
  }
}

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]*)\2/g;

for (const file of dtsFiles(distDir)) {
  const source = readFileSync(file, 'utf8');
  const fixed = source.replace(SPECIFIER, (match, lead, quote, spec) => {
    if (/\.(js|mjs|cjs|json|css|svelte)$/.test(spec)) return match;
    const target = resolve(dirname(file), spec);
    if (existsSync(`${target}.d.ts`)) return `${lead}${quote}${spec}.js${quote}`;
    if (existsSync(join(target, 'index.d.ts'))) return `${lead}${quote}${spec}/index.js${quote}`;
    throw new Error(`${file}: cannot resolve relative import '${spec}' to a .d.ts file`);
  });
  if (fixed !== source) writeFileSync(file, fixed);
}
