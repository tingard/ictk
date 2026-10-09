import type { AmplifierPosition } from '@tingard/ictk-core';
import type { Snippet } from 'svelte';

/**
 * Anything that can fill an icon/modifier/amplifier slot: plain text (the
 * common case for amplifiers) or a snippet for rich markup.
 */
export type Content = string | number | Snippet;

export type Amplifiers = Partial<Record<AmplifierPosition, Content>>;

export interface IconProps {
  /**
   * The frame, as a snippet rendering one of the built-in frames
   * (`{#snippet frame()}<SquareFrame fill="red" />{/snippet}`) or any custom
   * component. Icon doesn't read this snippet's output in any way — it just
   * renders it verbatim as a backdrop layer. The only real requirement is
   * that its rendered output carries the `ictk-frame` class, for grid
   * placement/sizing (see the core stylesheet) — FrameBase handles that for
   * you, and is the supported way to build a custom frame, but that's a
   * runtime/CSS contract the type system can't check.
   */
  frame: Snippet;
  icon?: Content;
  modifierTop?: Content;
  modifierBottom?: Content;
  /** Keyed by position code (see AMPLIFIER_POSITIONS). Only the slots present in this object are rendered. */
  amplifiers?: Amplifiers;
  /**
   * Overall icon size in pixels. The frame always renders at size x size,
   * anchored at its own center — amplifiers overflow outside this box but
   * never affect its dimensions, so the center point is a stable anchor for
   * map libraries (e.g. maplibregl.Marker's default `anchor: 'center'`).
   */
  size?: number;
  class?: string;
  style?: string;
}
