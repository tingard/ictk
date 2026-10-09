// Sets one version on every publishable package (fixed versioning — core,
// react and svelte always release together). Plain JSON edit rather than
// `npm version`, which has no business reading pnpm's `workspace:*` specifiers.
// Usage: node scripts/set-version.mjs 1.2.3
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? '')) {
  console.error(`Expected a semver version, got: ${version}`);
  process.exit(1);
}

for (const name of ['core', 'react', 'svelte']) {
  const path = new URL(`../packages/${name}/package.json`, import.meta.url);
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  pkg.version = version;
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`${pkg.name} -> ${version}`);
}
