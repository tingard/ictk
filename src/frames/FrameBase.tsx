import type { CSSProperties } from 'react';
import { resolveFillStyle } from './fill';
import type { Fill } from './fill';

export interface FrameBaseProps {
  fill?: Fill;
  /** Shape-specific styling (clip-path, border-radius, ...), merged after fill resolution. */
  style?: CSSProperties;
}

/**
 * The shared shell every frame — built-in or custom — should render
 * through. Handles the `ictk-frame` class (required for grid placement and
 * sizing within Icon; see styles.css), so a frame author only has to supply
 * the shape itself via `style` (clip-path, border-radius, ...). `fill` is a
 * convenience this shell offers, not something Icon itself requires — Icon
 * never reads a frame's props (see the `frame` doc comment on IconProps),
 * so a custom frame is free to skip FrameBase's fill entirely and accept
 * whatever coloring prop it wants, as long as it renders through something
 * carrying the `ictk-frame` class. This is the officially supported
 * extension point for publishing additional frame shapes as a separate
 * package, though — using it means zero dependence on Icon internals.
 */
export function FrameBase({ fill, style }: FrameBaseProps) {
  return <div className="ictk-frame" style={{ ...resolveFillStyle(fill), ...style }} />;
}
