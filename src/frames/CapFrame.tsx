import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

/** Rounded top, flat bottom — the air silhouette from NATO's own guidance for map icons; the inverse of CupFrame. */
export function CapFrame({ fill, stroke }: Pick<FrameBaseProps, 'fill' | 'stroke'>) {
  return (
    <FrameBase
      fill={fill}
      stroke={stroke}
      shape={{ kind: 'path', d: 'M0,100 L100,100 L100,50 A50,50 0 0 0 0,50 Z' }}
    />
  );
}
