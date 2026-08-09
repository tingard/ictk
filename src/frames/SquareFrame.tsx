import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';
import { nGonPoints } from './nGonPoints';

// rotation: 45 turns the n-gon's vertices into corners (flat sides face
// up/down/left/right instead of points); radius: 50 * sqrt(2) is the
// distance from center to a corner of an axis-aligned square whose sides
// span the full 0-100 box. Trades away the old rx=4 rounded corners (a
// plain polygon can't round corners the way <rect> could) for consistency
// with every other polygon-based frame — sharp corners, not rounded.
const SQUARE_POINTS = nGonPoints(4, { rotation: 45, radius: 50 * Math.SQRT2 });

export function SquareFrame({ fill, stroke }: Pick<FrameBaseProps, 'fill' | 'stroke'>) {
  return (
    <FrameBase fill={fill} stroke={stroke} shape={{ kind: 'polygon', points: SQUARE_POINTS }} />
  );
}
