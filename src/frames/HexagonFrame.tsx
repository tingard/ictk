import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';
import { nGonPoints } from './nGonPoints';

// rotation: 0 (the default) puts a vertex at the rightmost/leftmost points,
// giving flat top/bottom edges — a "flat-top" hexagon. Computed once at
// module load since it's a fixed shape, not per-render.
const HEXAGON_POINTS = nGonPoints(6);

export function HexagonFrame({ fill, stroke }: Pick<FrameBaseProps, 'fill' | 'stroke'>) {
  return (
    <FrameBase fill={fill} stroke={stroke} shape={{ kind: 'polygon', points: HEXAGON_POINTS }} />
  );
}
