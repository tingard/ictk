/**
 * Generates an SVG `points` attribute value for a regular n-gon, in the
 * same normalized 0-100 viewBox coordinate space FrameBase shapes use
 * (`{ kind: 'polygon' }`). `rotation` is in degrees, 0 pointing along the
 * positive x-axis (matching SVG's angle convention); `radius` is the
 * distance from center to each vertex (the circumradius), not to the
 * midpoint of an edge.
 *
 * Used to build SquareFrame/HexagonFrame — see their source for how a
 * rotation/radius pair produces a specific orientation — and exported so
 * adding a new regular-polygon frame (pentagon, octagon, ...) is a
 * one-line call rather than hand-plotting coordinates.
 */
export function nGonPoints(
  n: number,
  options: { cx?: number; cy?: number; radius?: number; rotation?: number } = {},
): string {
  const { cx = 50, cy = 50, radius = 50, rotation = 0 } = options;
  const points: string[] = [];
  for (let i = 0; i < n; i++) {
    const angle = ((rotation + (i * 360) / n) * Math.PI) / 180;
    points.push(`${round(cx + radius * Math.cos(angle))},${round(cy + radius * Math.sin(angle))}`);
  }
  return points.join(' ');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
