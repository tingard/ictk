<script lang="ts">
  import { gradientId, paintFor, resolveFill } from '@tingard/ictk-core';
  import type { FrameBaseProps } from '@tingard/ictk-core';

  /**
   * The shared shell every frame — built-in or custom — should render
   * through. Handles the `ictk-frame` class (required for grid placement and
   * sizing within Icon; see the core stylesheet) and renders `shape` as real
   * SVG so `stroke` follows the actual outline for every shape. `fill` is a
   * convenience this shell offers, not something Icon itself requires.
   */
  const { fill, stroke, shape }: FrameBaseProps = $props();

  // Unique per component instance, so multiple gradient-filled icons on the
  // same page don't collide.
  // ($props.id() must be a bare variable initializer, so it can't be wrapped.)
  const uid = $props.id();
  const id = gradientId(uid);
  const resolved = $derived(resolveFill(fill));
  const paint = $derived(paintFor(resolved, id));
</script>

<!-- aria-hidden, not a <title>: purely decorative backdrop — the meaningful
     content (icon/modifiers/amplifiers) is layered on top. -->
<svg class="ictk-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  {#if resolved.kind === 'gradient'}
    <defs>
      <linearGradient {id} gradientTransform={resolved.transform}>
        {#each resolved.stops as stop}
          <stop offset={stop.offset} stop-color={stop.color} />
        {/each}
      </linearGradient>
    </defs>
  {/if}
  <!-- vector-effect keeps stroke.width a fixed pixel width regardless of icon
       size, matching how a CSS border width behaves. -->
  {#if shape.kind === 'rect'}
    <rect
      x={0}
      y={0}
      width={100}
      height={100}
      rx={shape.rx}
      fill={paint}
      stroke={stroke?.color}
      stroke-width={stroke?.width}
      vector-effect="non-scaling-stroke"
    />
  {:else if shape.kind === 'circle'}
    <circle
      cx={50}
      cy={50}
      r={50}
      fill={paint}
      stroke={stroke?.color}
      stroke-width={stroke?.width}
      vector-effect="non-scaling-stroke"
    />
  {:else if shape.kind === 'polygon'}
    <polygon
      points={shape.points}
      fill={paint}
      stroke={stroke?.color}
      stroke-width={stroke?.width}
      vector-effect="non-scaling-stroke"
    />
  {:else if shape.kind === 'path'}
    <path
      d={shape.d}
      fill={paint}
      stroke={stroke?.color}
      stroke-width={stroke?.width}
      vector-effect="non-scaling-stroke"
    />
  {/if}
</svg>
