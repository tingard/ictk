// Guards against the bindings drifting apart: the same Spec must produce the
// same DOM in every binding, once framework-specific noise (attribute order,
// style serialization, generated gradient ids, hydration comments) is
// normalized away. Layout tests above prove each binding *works*; this
// proves they stay the *same*.
import { AMPLIFIER_POSITIONS } from '@tingard/ictk-core';
import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { adapters } from './adapters';
import { pageHtml } from './page';
import { FRAME_NAMES } from './spec';
import type { Spec } from './spec';

const gradient = {
  type: 'gradient' as const,
  angle: 45,
  stops: [
    { offset: 0, color: 'red' },
    { offset: 1, color: 'blue' },
  ],
};

const scenarios: [string, Spec][] = [
  ['bare default', {}],
  [
    'full content',
    {
      size: 48,
      fill: '#ff0000',
      stroke: { color: '#000', width: 2 },
      icon: 'ICON',
      modifierTop: 'A',
      modifierBottom: '2',
      className: 'consumer-class',
      amplifiers: Object.fromEntries(AMPLIFIER_POSITIONS.map((p) => [p, p])),
    },
  ],
  ['gradient fill', { fill: gradient, stroke: { color: '#222', width: 1 } }],
  ...FRAME_NAMES.map((frame): [string, Spec] => [`${frame} frame`, { frame, fill: '#0a0' }]),
];

// Walks the DOM into a plain, order-independent structure.
function normalizeInPage(root: Element) {
  const ids = new Map<string, string>();
  const canon = (id: string) => {
    if (!ids.has(id)) ids.set(id, `id${ids.size}`);
    return ids.get(id);
  };
  const walk = (el: Element): unknown => {
    const attrs: Record<string, string> = {};
    for (const a of Array.from(el.attributes)) {
      if (a.name === 'class' || a.name === 'style') continue;
      attrs[a.name] = a.value
        .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${canon(id)})`)
        .replace(/^ictk-fill-\w+$/, (m) => canon(m) ?? m);
    }
    const style: Record<string, string> = {};
    const htmlEl = el as HTMLElement;
    for (let i = 0; i < htmlEl.style?.length; i++) {
      const prop = htmlEl.style[i] as string;
      style[prop] = htmlEl.style.getPropertyValue(prop);
    }
    return {
      tag: el.tagName.toLowerCase(),
      classes: Array.from(el.classList).sort(),
      attrs,
      style,
      children: Array.from(el.childNodes)
        .map((n) =>
          n.nodeType === Node.ELEMENT_NODE
            ? walk(n as Element)
            : n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
              ? { text: n.textContent.trim() }
              : null,
        )
        .filter(Boolean),
    };
  };
  return walk(root);
}

describe('binding markup parity', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  it.each(scenarios)('%s renders the same DOM in every binding', async (_name, spec) => {
    const [reference, ...others] = adapters;
    if (!reference) throw new Error('no adapters registered');

    async function normalized(adapter: (typeof adapters)[number]) {
      const page = await browser.newPage();
      await page.setContent(pageHtml(adapter, spec));
      const tree = await page.evaluate(
        `(${normalizeInPage.toString()})(document.body.firstElementChild)`,
      );
      await page.close();
      return tree;
    }

    const expected = await normalized(reference);
    for (const other of others) {
      expect(await normalized(other), `${other.name} vs ${reference.name}`).toEqual(expected);
    }
  });
});
