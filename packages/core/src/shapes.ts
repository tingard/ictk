import { nGonPoints } from './nGonPoints';
import type { FrameShape } from './shape';

// The built-in frame outlines, shared by every framework binding so a
// SquareFrame is the same geometry in React and Svelte. Each binding's frame
// component is just `<FrameBase shape={BUILT_IN_SHAPES.x} {fill} {stroke} />`.
// Computed once at module load since they're fixed shapes, not per-render.
export const BUILT_IN_SHAPES = {
  // rotation: 45 turns the n-gon's vertices into corners (flat sides face
  // up/down/left/right instead of points); radius: 50 * sqrt(2) is the
  // distance from center to a corner of an axis-aligned square whose sides
  // span the full 0-100 box. Rendered as a polygon, not a { kind: 'rect' }
  // shape, for consistency with the other regular-polygon frames — sharp
  // corners only; a rect's `rx` is the way to get rounded ones instead.
  square: {
    kind: 'polygon',
    points: nGonPoints(4, { rotation: 45, radius: 50 * Math.SQRT2 }),
  },
  circle: { kind: 'circle' },
  // rotation: 0 puts a vertex at the rightmost/leftmost points, giving flat
  // top/bottom edges — a "flat-top" hexagon.
  hexagon: { kind: 'polygon', points: nGonPoints(6) },
  diamond: { kind: 'polygon', points: '50,0 100,50 50,100 0,50' },
  /** Flat top, rounded bottom — the sea-subsurface silhouette from NATO's own guidance for map icons. */
  cup: { kind: 'path', d: 'M0,0 L100,0 L100,50 A50,50 0 0 1 0,50 Z' },
  /** Rounded top, flat bottom — the air silhouette from NATO's own guidance for map icons; the inverse of cup. */
  cap: { kind: 'path', d: 'M0,100 L100,100 L100,50 A50,50 0 0 0 0,50 Z' },
} as const satisfies Record<string, FrameShape>;
