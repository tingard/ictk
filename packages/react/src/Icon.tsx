import { AMPLIFIER_POSITIONS, DEFAULT_SIZE } from '@tingard/ictk-core';
import type { CSSProperties } from 'react';
import { AmplifierSlot } from './AmplifierSlot';
import { IconCore } from './IconCore';
import type { IconProps } from './types';

type IconRootStyle = CSSProperties & { '--ictk-size': string };

export function Icon({
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
    // Requires importing '@tingard/ictk/style.css'; width/height above don't.
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
}
