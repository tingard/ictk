import type { Fill, Stroke } from './fill';

/**
 * A frame's outline, in a normalized 0-100 viewBox coordinate space (so it
 * scales correctly regardless of the icon's actual `size`). `polygon`/`path`
 * take the same coordinate strings the underlying SVG elements do.
 */
export type FrameShape =
  | { kind: 'rect'; rx?: number }
  | { kind: 'circle' }
  | { kind: 'polygon'; points: string }
  | { kind: 'path'; d: string };

export interface FrameBaseProps {
  fill?: Fill;
  stroke?: Stroke;
  shape: FrameShape;
}
