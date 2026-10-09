import type { FrameBaseProps } from '@tingard/ictk-core';
import { useFillPaint } from './fill';

export type { FrameBaseProps, FrameShape } from '@tingard/ictk-core';

/**
 * The shared shell every frame — built-in or custom — should render
 * through. Handles the `ictk-frame` class (required for grid placement and
 * sizing within Icon; see styles.css) and renders `shape` as real SVG
 * (rect/circle/polygon/path), so `stroke` follows the actual outline
 * correctly for every shape — a CSS `border` can't do this on an angular
 * shape, since it's drawn on the element's rectangular border-box
 * regardless of any `clip-path` applied to it. `fill` is a convenience
 * this shell offers, not something Icon itself requires — Icon never
 * reads a frame's props (see the `frame` doc comment on IconProps), so a
 * custom frame is free to skip FrameBase entirely and render its own
 * SVG/DOM, as long as it carries the `ictk-frame` class. This is the
 * officially supported extension point for publishing additional frame
 * shapes as a separate package — using it means zero dependence on Icon
 * internals.
 */
export function FrameBase({ fill, stroke, shape }: FrameBaseProps) {
  const { paint, defs } = useFillPaint(fill);
  const paintProps = {
    fill: paint,
    stroke: stroke?.color,
    strokeWidth: stroke?.width,
    // Keeps stroke.width a fixed pixel width regardless of icon size —
    // without this, stroke width scales with the viewBox like everything
    // else in it (a `width={2}` stroke would render sub-pixel on a small
    // icon), which doesn't match how a CSS border width behaves.
    vectorEffect: 'non-scaling-stroke' as const,
  };

  return (
    // aria-hidden, not a <title>: this is a purely decorative backdrop —
    // the meaningful content (icon/modifiers/amplifiers) is IconCore,
    // layered on top, so a screen reader announcing "frame" per marker
    // would just be noise.
    <svg className="ictk-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {defs && <defs>{defs}</defs>}
      {shape.kind === 'rect' && (
        <rect x={0} y={0} width={100} height={100} rx={shape.rx} {...paintProps} />
      )}
      {shape.kind === 'circle' && <circle cx={50} cy={50} r={50} {...paintProps} />}
      {shape.kind === 'polygon' && <polygon points={shape.points} {...paintProps} />}
      {shape.kind === 'path' && <path d={shape.d} {...paintProps} />}
    </svg>
  );
}
