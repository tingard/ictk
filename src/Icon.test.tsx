import { fireEvent, render } from '@testing-library/react';
import { useMemo, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon';
import { SquareFrame } from './frames/SquareFrame';

function RenderCounter({ label, onRender }: { label: string; onRender: () => void }) {
  onRender();
  return <span>{label}</span>;
}

describe('Icon', () => {
  it('renders frame, icon, modifiers and amplifiers', () => {
    const { getByText } = render(
      <Icon
        frame={<SquareFrame fill="#ff0000" />}
        icon={<span>center</span>}
        modifierTop={<span>top</span>}
        modifierBottom={<span>bottom</span>}
        amplifiers={{ T: <span>title-amp</span>, L0: <span>left-amp</span> }}
      />,
    );

    expect(getByText('center')).toBeInTheDocument();
    expect(getByText('top')).toBeInTheDocument();
    expect(getByText('bottom')).toBeInTheDocument();
    expect(getByText('title-amp')).toBeInTheDocument();
    expect(getByText('left-amp')).toBeInTheDocument();
  });

  it('does not re-render unrelated amplifier slots when a sibling amplifier changes', () => {
    const renderCounts = { T: 0, L0: 0 };

    function Harness() {
      const [label, setLabel] = useState('hello');
      // Deliberately stable across renders — mirrors what a real consumer must do
      // (useMemo/useState/module constant) for an unchanged amplifier's element
      // reference to survive Icon's re-render. Creating this inline in JSX on
      // every render would defeat AmplifierSlot's memo bailout, since React.memo
      // compares the element by reference, not by its rendered content.
      const staticL0 = useMemo(
        () => <RenderCounter label="static" onRender={() => renderCounts.L0++} />,
        [],
      );
      return (
        <div>
          <button type="button" onClick={() => setLabel('world')}>
            update
          </button>
          <Icon
            frame={<SquareFrame fill="#ff0000" />}
            amplifiers={{
              T: <RenderCounter label={label} onRender={() => renderCounts.T++} />,
              L0: staticL0,
            }}
          />
        </div>
      );
    }

    const { getByText } = render(<Harness />);
    expect(renderCounts.T).toBe(1);
    expect(renderCounts.L0).toBe(1);

    fireEvent.click(getByText('update'));

    expect(renderCounts.T).toBe(2); // changed amplifier re-rendered
    expect(renderCounts.L0).toBe(1); // sibling amplifier bailed out via memo
  });

  it('sizes the root box from the size prop, defaulting to 32, independent of stylesheet', () => {
    const { container, rerender } = render(<Icon frame={<SquareFrame />} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe('32px');
    expect(root.style.height).toBe('32px');
    expect(root.style.getPropertyValue('--ictk-size')).toBe('32px');

    rerender(<Icon frame={<SquareFrame />} size={64} />);
    expect(root.style.width).toBe('64px');
    expect(root.style.height).toBe('64px');
    expect(root.style.getPropertyValue('--ictk-size')).toBe('64px');
  });
});
