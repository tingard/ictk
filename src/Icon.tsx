import { memo } from 'react';
import type { CSSProperties } from 'react';
import { AmplifierSlot } from './AmplifierSlot';
import { IconCore } from './IconCore';
import { AMPLIFIER_POSITIONS } from './types';
import type { IconProps } from './types';

// 32px, not 64: closer to conventional map-marker sizing (Leaflet/Mapbox/
// Google default pins run ~25-41px) and to what actually reads well at
// typical viewing distance on a standard-DPI display. Safe to keep compact
// because styles.css floors text at a legible minimum regardless of size —
// see the .ictk-icon/.ictk-amplifier font-size comments.
const DEFAULT_SIZE = 32;

type IconRootStyle = CSSProperties & { '--ictk-size': string };

export const Icon = memo(function Icon({
  frame,
  icon,
  modifierTop,
  modifierBottom,
  amplifiers,
  size = DEFAULT_SIZE,
  className,
  style,
}: IconProps) {
  const rootStyle: IconRootStyle = {
    ...style,
    width: size,
    height: size,
    // Also set as a CSS var so styles.css can scale amplifier font-size/
    // offsets (in em) with icon size, independent of the ambient page font.
    // Requires importing 'ictk/style.css'; width/height above don't.
    '--ictk-size': `${size}px`,
  };

  return (
    <div className={['ictk-icon', className].filter(Boolean).join(' ')} style={rootStyle}>
      {frame}
      <IconCore icon={icon} modifierTop={modifierTop} modifierBottom={modifierBottom} />
      {amplifiers &&
        AMPLIFIER_POSITIONS.map((position) => {
          const content = amplifiers[position];
          return content != null ? (
            <AmplifierSlot key={position} position={position} content={content} />
          ) : null;
        })}
    </div>
  );
});
