// Re-publishes core's stylesheet under this package's own name, so consumers
// can `import '@tingard/ictk-svelte/style.css'` without having to know the
// stylesheet lives in @tingard/ictk-core.
import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../../core/src/styles.css', import.meta.url));
const dest = fileURLToPath(new URL('../dist/style.css', import.meta.url));
mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
copyFileSync(src, dest);
