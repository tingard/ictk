import { readFileSync } from 'node:fs';
import type { Adapter, Spec } from './spec';

// Each binding's own published stylesheet, read straight from disk rather
// than via `import css from '...?raw'`: Vitest stubs CSS imports to an empty
// module by default (even with ?raw) unless test.css is explicitly enabled,
// which would silently make these tests measure unstyled block layout
// instead of the real grid CSS.
export function pageHtml(adapter: Adapter, spec: Spec): string {
  const css = readFileSync(adapter.cssPath, 'utf8');
  return `<!doctype html><html><head><style>${css}</style></head><body>${adapter.render(spec)}</body></html>`;
}
