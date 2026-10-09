import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import Icon from '../lib/Icon.svelte';
import SquareFrame from '../lib/frames/SquareFrame.svelte';

const text = (label: string) => createRawSnippet(() => ({ render: () => `<span>${label}</span>` }));

// A minimal stand-in frame; the built-in frames are covered separately below.
const frame = createRawSnippet(() => ({
  render: () => '<svg class="ictk-frame" data-testid="frame"></svg>',
}));

describe('Icon', () => {
  it('renders frame, icon, modifiers and amplifiers (snippets and plain strings)', () => {
    const { getByText, getByTestId } = render(Icon, {
      frame,
      icon: text('center'),
      modifierTop: 'top',
      modifierBottom: text('bottom'),
      amplifiers: { T: 'title-amp', L0: text('left-amp') },
    });

    expect(getByTestId('frame')).toBeInTheDocument();
    expect(getByText('center')).toBeInTheDocument();
    expect(getByText('top')).toBeInTheDocument();
    expect(getByText('bottom')).toBeInTheDocument();
    expect(getByText('title-amp')).toBeInTheDocument();
    expect(getByText('left-amp')).toBeInTheDocument();
  });

  it('only renders amplifier slots that are present', () => {
    const { container } = render(Icon, { frame, amplifiers: { T: 'x' } });
    expect(container.querySelectorAll('.ictk-amplifier')).toHaveLength(1);
    expect(container.querySelector('.ictk-amplifier--T')).toBeInTheDocument();
  });

  it('sizes the root box from the size prop, defaulting to 32, independent of stylesheet', async () => {
    const { container, rerender } = render(Icon, { frame });
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe('32px');
    expect(root.style.height).toBe('32px');
    expect(root.style.getPropertyValue('--ictk-size')).toBe('32px');

    await rerender({ size: 64 });
    expect(root.style.width).toBe('64px');
    expect(root.style.height).toBe('64px');
    expect(root.style.getPropertyValue('--ictk-size')).toBe('64px');
  });

  it('merges consumer class and style onto the root', () => {
    const { container } = render(Icon, { frame, class: 'mine', style: 'opacity: 0.5' });
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('ictk-icon', 'mine');
    expect(root.style.opacity).toBe('0.5');
  });

  it('updates one amplifier in place when its content changes', async () => {
    const { container, rerender } = render(Icon, { frame, amplifiers: { T: 'a', L0: 'b' } });
    const l0Before = container.querySelector('.ictk-amplifier--L0');
    await rerender({ amplifiers: { T: 'changed', L0: 'b' } });
    expect(container.querySelector('.ictk-amplifier--T')).toHaveTextContent('changed');
    // Same DOM node: the sibling slot was patched, not recreated.
    expect(container.querySelector('.ictk-amplifier--L0')).toBe(l0Before);
  });
});

describe('frames', () => {
  it('SquareFrame renders an ictk-frame svg with the given fill and stroke', () => {
    const { container } = render(SquareFrame, {
      fill: '#f00',
      stroke: { color: '#000', width: 2 },
    });
    const svg = container.querySelector('svg.ictk-frame');
    expect(svg).toBeInTheDocument();
    const polygon = svg?.querySelector('polygon');
    expect(polygon).toHaveAttribute('fill', '#f00');
    expect(polygon).toHaveAttribute('stroke', '#000');
    expect(polygon).toHaveAttribute('stroke-width', '2');
  });

  it('gradient fills get unique, resolvable ids per instance', () => {
    const gradient = { type: 'gradient' as const, stops: [{ offset: 0, color: 'red' }] };
    const a = render(SquareFrame, { fill: gradient });
    const b = render(SquareFrame, { fill: gradient });
    const idOf = (c: HTMLElement) => c.querySelector('linearGradient')?.getAttribute('id');
    const idA = idOf(a.container);
    const idB = idOf(b.container);
    expect(idA).toMatch(/^ictk-fill-/);
    expect(idA).not.toBe(idB);
    expect(a.container.querySelector('polygon')).toHaveAttribute('fill', `url(#${idA})`);
  });
});
