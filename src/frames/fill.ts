import type { CSSProperties } from 'react';

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
  | { type: 'atlas'; src: string; x: number; y: number; width: number; height: number };

export function resolveFillStyle(fill: Fill | undefined): CSSProperties {
  if (!fill) return {};

  if (typeof fill === 'string') {
    return { background: fill };
  }

  switch (fill.type) {
    case 'gradient': {
      const stops = fill.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ');
      return { background: `linear-gradient(${fill.angle ?? 0}deg, ${stops})` };
    }
    case 'image':
      return {
        backgroundImage: `url(${fill.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    case 'atlas':
      return {
        backgroundImage: `url(${fill.src})`,
        backgroundPosition: `-${fill.x}px -${fill.y}px`,
        backgroundSize: 'auto',
        width: fill.width,
        height: fill.height,
      };
  }
}
