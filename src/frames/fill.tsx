import { useId } from 'react';
import type { ReactNode } from 'react';

// Lives in frames/, not in types.ts: fill is a FrameBase/built-in-frame
// convenience, not something Icon itself requires or even knows about —
// Icon renders `frame` verbatim and never reads its props. Colocating this
// here keeps that boundary honest instead of implying Icon mandates a fill
// contract it doesn't actually enforce.
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
 * Resolves a Fill into an SVG paint value (a plain color, or a `url(#id)`
 * gradient reference) plus whatever <defs> content that paint needs, if
 * any. A hook, not a plain function, because a gradient fill needs a unique
 * def id — useId keeps multiple icons with gradient fills on the same page
 * from colliding.
 */
export function useFillPaint(fill: Fill | undefined): { paint: string; defs: ReactNode } {
  const rawId = useId();
  const id = `ictk-fill-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (!fill) return { paint: 'none', defs: null };
  if (typeof fill === 'string') return { paint: fill, defs: null };

  return {
    paint: `url(#${id})`,
    defs: (
      <linearGradient id={id} gradientTransform={`rotate(${fill.angle ?? 0}, 0.5, 0.5)`}>
        {fill.stops.map((s) => (
          <stop key={s.offset} offset={`${s.offset * 100}%`} stopColor={s.color} />
        ))}
      </linearGradient>
    ),
  };
}
