import { gradientId, paintFor, resolveFill } from '@tingard/ictk-core';
import type { Fill } from '@tingard/ictk-core';
import { useId } from 'react';
import type { ReactNode } from 'react';

/**
 * Resolves a Fill into an SVG paint value (a plain color, or a `url(#id)`
 * gradient reference) plus whatever <defs> content that paint needs, if
 * any. A hook, not a plain function, because a gradient fill needs a unique
 * def id — useId keeps multiple icons with gradient fills on the same page
 * from colliding. The resolution itself lives in @tingard/ictk-core so the
 * Svelte binding renders identical gradients.
 */
export function useFillPaint(fill: Fill | undefined): { paint: string; defs: ReactNode } {
  const id = gradientId(useId());
  const resolved = resolveFill(fill);
  return {
    paint: paintFor(resolved, id),
    defs:
      resolved.kind === 'gradient' ? (
        <linearGradient id={id} gradientTransform={resolved.transform}>
          {resolved.stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      ) : null,
  };
}
