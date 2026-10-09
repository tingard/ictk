// Lives alongside the frame types, not with Icon: fill is a FrameBase/built-in
// frame convenience, not something Icon itself requires or even knows about —
// Icon renders `frame` verbatim and never reads its props.
//
// Deliberately solid-color/gradient only. Image/texture-atlas backgrounds
// don't need any of FrameBase's machinery — an atlas-backed frame is just
// an `<img>`/`<canvas>` positioned under a transparent frame, or a custom
// frame rendering its own `<pattern>` fill directly — so keeping them out
// of FrameBase avoids owning their aspect-ratio/cropping behavior.

export type GradientStop = { offset: number; color: string };

export type Fill = string | { type: 'gradient'; stops: GradientStop[]; angle?: number };

export interface Stroke {
  color: string;
  width: number;
}

/**
 * A framework-neutral description of what a frame's SVG paint should be.
 * Each binding turns `gradient` into a real <linearGradient> in its own
 * template syntax, so React and Svelte frames render identical gradients
 * from one piece of logic.
 */
export type ResolvedFill =
  | { kind: 'none' }
  | { kind: 'color'; color: string }
  | {
      kind: 'gradient';
      /** Value for the <linearGradient> `gradientTransform` attribute. */
      transform: string;
      stops: { offset: string; color: string }[];
    };

export function resolveFill(fill: Fill | undefined): ResolvedFill {
  if (!fill) return { kind: 'none' };
  if (typeof fill === 'string') return { kind: 'color', color: fill };
  return {
    kind: 'gradient',
    transform: `rotate(${fill.angle ?? 0}, 0.5, 0.5)`,
    stops: fill.stops.map((s) => ({ offset: `${s.offset * 100}%`, color: s.color })),
  };
}

/**
 * Turns a framework-generated unique id (React's `useId`, Svelte's
 * `$props.id()`) into a value safe to use as an SVG gradient id and inside
 * `url(#...)` — those ids can contain characters (`:`, `«»`) that are not
 * valid in a bare `url(#id)` reference. The `ictk-fill-` prefix keeps it
 * from colliding with ids on the host page.
 */
export function gradientId(rawId: string): string {
  return `ictk-fill-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
}

/** The SVG `fill` paint value for a resolved fill, given its gradient id. */
export function paintFor(resolved: ResolvedFill, id: string): string {
  switch (resolved.kind) {
    case 'none':
      return 'none';
    case 'color':
      return resolved.color;
    case 'gradient':
      return `url(#${id})`;
  }
}
