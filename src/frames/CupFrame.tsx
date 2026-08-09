import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

/** Flat top, rounded bottom — the sea-subsurface silhouette from NATO's own guidance for map icons. */
export function CupFrame({ fill, stroke }: Pick<FrameBaseProps, 'fill' | 'stroke'>) {
  return (
    <FrameBase
      fill={fill}
      stroke={stroke}
      shape={{ kind: 'path', d: 'M0,0 L100,0 L100,50 A50,50 0 0 1 0,50 Z' }}
    />
  );
}
