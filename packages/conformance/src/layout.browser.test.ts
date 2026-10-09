// Real-browser check for the CSS Grid amplifier layout in the core
// stylesheet, run against every binding's *built* output and *published*
// stylesheet. jsdom (used by each binding's unit tests) doesn't do real
// layout, so it can't catch grid blowout — a 0-sized track that ends up
// growing to fit its content instead of staying 0. That would silently
// break the map-marker anchor invariant documented on the `size` prop (the
// root box must always stay exactly size x size).
import { AMPLIFIER_POSITIONS } from '@tingard/ictk-core';
import { chromium } from 'playwright';
import type { Browser, Locator } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { adapters } from './adapters';
import { pageHtml } from './page';

// Deliberately oversized: if any amplifier track were auto/fr-sized instead
// of a fixed 0px, content this large would grow the .ictk-icon box.
const HUGE = 'X'.repeat(80);

type Box = { x: number; y: number; width: number; height: number };

async function requiredBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error('unreachable — asserted non-null above');
  return box;
}

function rectsOverlap(a: Box, b: Box) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

describe.each(adapters)('Icon grid layout in real browser — $name binding', (adapter) => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  async function openPage(spec: Parameters<typeof pageHtml>[1]) {
    const page = await browser.newPage();
    await page.setContent(pageHtml(adapter, spec));
    return page;
  }

  it.each([64, 32, 128])(
    'keeps the root box at exactly %dpx square despite oversized content in every slot',
    async (size) => {
      const page = await openPage({
        size,
        fill: '#ff0000',
        icon: HUGE,
        modifierTop: HUGE,
        modifierBottom: HUGE,
        amplifiers: { T: HUGE, L0: HUGE, L4: HUGE, R0: HUGE, R4: HUGE, B0: HUGE, B1: HUGE },
      });

      const iconBox = await requiredBox(page.locator('.ictk-icon'));
      expect(iconBox.width).toBeCloseTo(size, 1);
      expect(iconBox.height).toBeCloseTo(size, 1);

      // The frame fills the box exactly — it must span all 5 middle rows
      // and the 1fr column for this to hold.
      const frameBox = await requiredBox(page.locator('.ictk-frame'));
      expect(frameBox.width).toBeCloseTo(size, 1);
      expect(frameBox.height).toBeCloseTo(size, 1);

      // Oversized modifier content stays visible, overflowing past the
      // frame, rather than being clipped. Frame uses min-width/min-height:
      // 0 (not overflow: hidden) specifically so a misconfigured marker
      // fails loud instead of silently losing content.
      const modTopBox = await requiredBox(page.locator('.ictk-modifier--top'));
      expect(modTopBox.width).toBeGreaterThan(frameBox.width);

      // And the oversized content actually overflows outside the box —
      // ruling out the other failure mode (overflow silently clipped to
      // invisible instead of the box growing) that box-size checks alone
      // wouldn't catch.
      const tBox = await requiredBox(page.locator('.ictk-amplifier--T'));
      const l0Box = await requiredBox(page.locator('.ictk-amplifier--L0'));
      const r4Box = await requiredBox(page.locator('.ictk-amplifier--R4'));
      const b1Box = await requiredBox(page.locator('.ictk-amplifier--B1'));
      expect(tBox.y).toBeLessThan(iconBox.y); // grows up, above the box
      expect(l0Box.x).toBeLessThan(iconBox.x); // grows left, left of the box
      expect(r4Box.x + r4Box.width).toBeGreaterThan(iconBox.x + iconBox.width); // grows right
      expect(b1Box.y + b1Box.height).toBeGreaterThan(iconBox.y + iconBox.height); // grows down

      await page.close();
    },
  );

  it('keeps every amplifier slot visually distinct from its siblings, not overlapping', async () => {
    // B0 and B1 are both 0-height grid rows at the same line, so without an
    // explicit offset on B1 they'd render fully overlapping — same-content
    // boxes would pass every other check here since each slot is
    // individually still "outside the icon box".
    const page = await openPage({
      fill: '#ff0000',
      amplifiers: Object.fromEntries(AMPLIFIER_POSITIONS.map((p) => [p, p])),
    });

    const boxes = await Promise.all(
      AMPLIFIER_POSITIONS.map((p) => requiredBox(page.locator(`.ictk-amplifier--${p}`))),
    );

    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i];
      if (!a) throw new Error('unreachable — within bounds');
      for (let j = i + 1; j < boxes.length; j++) {
        const b = boxes[j];
        if (!b) throw new Error('unreachable — within bounds');
        expect(
          rectsOverlap(a, b),
          `${AMPLIFIER_POSITIONS[i]} overlaps ${AMPLIFIER_POSITIONS[j]}`,
        ).toBe(false);
      }
    }

    await page.close();
  });

  it('scales font-size proportionally with no floor/clamp', async () => {
    // Deliberately no legibility floor here (e.g. max(15px, ...)): a floor
    // would render amplifier labels bigger than small icons, visually
    // broken at size=24-48. Text size is a proportional *default*, not a
    // guaranteed minimum: consumers who need a specific legible size for
    // their own content can just style that content directly.
    for (const size of [8, 32, 64, 128]) {
      const page = await openPage({ size, fill: '#ff0000', amplifiers: { T: 'T' } });
      const fontSizes = await page.evaluate(() => ({
        icon: Number.parseFloat(
          getComputedStyle(document.querySelector('.ictk-icon') as Element).fontSize,
        ),
        amplifier: Number.parseFloat(
          getComputedStyle(document.querySelector('.ictk-amplifier--T') as Element).fontSize,
        ),
      }));
      expect(fontSizes.icon).toBeCloseTo(size / 5, 1);
      expect(fontSizes.amplifier).toBeCloseTo((size / 5) * 0.7, 1);
      await page.close();
    }
  });

  it('keeps icon-content centered in the frame regardless of which modifiers are present', async () => {
    // flex-direction: column + justify-content: center would center
    // whichever children happen to be present as a group — with only
    // modifierTop, the [modifierTop, icon] pair would center together and
    // the icon would sit below true center. Independent absolute
    // positioning (see .ictk-icon-content in the stylesheet) avoids that.
    // Reference: static/app6d-icons-and-modifiers-location.png — MAIN
    // never moves whether 1, 2, both, or neither of the modifiers are
    // shown.
    async function centerOffset(modifiers: { top?: boolean; bottom?: boolean }) {
      const page = await openPage({
        fill: '#ff0000',
        icon: 'ICON',
        modifierTop: modifiers.top ? 'A' : undefined,
        modifierBottom: modifiers.bottom ? '2' : undefined,
      });
      const offset = await page.evaluate(() => {
        const frame = document.querySelector('.ictk-frame')?.getBoundingClientRect();
        const icon = document.querySelector('.ictk-icon-content')?.getBoundingClientRect();
        if (!frame || !icon) throw new Error('unreachable — both always render');
        return icon.top + icon.height / 2 - (frame.top + frame.height / 2);
      });
      await page.close();
      return offset;
    }

    expect(await centerOffset({})).toBeCloseTo(0, 1);
    expect(await centerOffset({ top: true })).toBeCloseTo(0, 1);
    expect(await centerOffset({ bottom: true })).toBeCloseTo(0, 1);
    expect(await centerOffset({ top: true, bottom: true })).toBeCloseTo(0, 1);
  });
});
