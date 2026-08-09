import { useId } from 'react';
import type { ReactNode } from 'react';

// Lives in frames/, not in types.ts: fill is a FrameBase/built-in-frame
// convenience, not something Icon itself requires or even knows about —
// Icon renders `frame` verbatim and never reads its props. Colocating this
// here keeps that boundary honest instead of implying Icon mandates a fill
// contract it doesn't actually enforce.

export type GradientStop = { offset: number; color: string };

export type Fill =
  | string
  | { type: 'gradient'; stops: GradientStop[]; angle?: number }
  | { type: 'image'; src: string }
  | {
      type: 'atlas';
      src: string;
      x: number;
      y: number;
      width: number;
      height: number;
      /** The full atlas image's own pixel dimensions — needed to scale/position it correctly as an SVG pattern fill, unlike CSS background-position/size, which get this from the browser automatically. */
      naturalWidth: number;
      naturalHeight: number;
    };

export interface Stroke {
  color: string;
  width: number;
}

/**
 * Resolves a Fill into an SVG paint value (a plain color, or a `url(#id)`
 * reference) plus whatever <defs> content that paint needs (a
 * linearGradient or pattern), if any. A hook, not a plain function, because
 * gradient/image/atlas fills need a unique def id — useId keeps multiple
 * icons with gradient/image fills on the same page from colliding.
 */
export function useFillPaint(fill: Fill | undefined): { paint: string; defs: ReactNode } {
  const rawId = useId();
  const id = `ictk-fill-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (!fill) return { paint: 'none', defs: null };
  if (typeof fill === 'string') return { paint: fill, defs: null };

  switch (fill.type) {
    case 'gradient':
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
    case 'image':
      return {
        paint: `url(#${id})`,
        defs: (
          <pattern id={id} patternUnits="objectBoundingBox" width={1} height={1}>
            <image href={fill.src} width={100} height={100} preserveAspectRatio="xMidYMid slice" />
          </pattern>
        ),
      };
    case 'atlas': {
      const scaleX = 100 / fill.width;
      const scaleY = 100 / fill.height;
      return {
        paint: `url(#${id})`,
        defs: (
          <pattern id={id} patternUnits="objectBoundingBox" width={1} height={1}>
            <image
              href={fill.src}
              x={-fill.x * scaleX}
              y={-fill.y * scaleY}
              width={fill.naturalWidth * scaleX}
              height={fill.naturalHeight * scaleY}
              preserveAspectRatio="none"
            />
          </pattern>
        ),
      };
    }
  }
}
