import type { AmplifierPosition } from '@tingard/ictk-core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

export type Amplifiers = Partial<Record<AmplifierPosition, ReactNode>>;

export interface IconProps {
  /**
   * A frame element — one of the built-in frames (SquareFrame, CircleFrame,
   * ...) or any custom component. Icon doesn't read or clone this element's
   * props (no cloneElement) — it just renders it verbatim as a backdrop
   * layer, so there's no props contract to type here. The only real
   * requirement is that a frame's rendered output carries the `ictk-frame`
   * class, for grid placement/sizing (see styles.css) — FrameBase (from
   * ./frames/FrameBase) handles that for you, and is the supported way to
   * build a custom frame, but Icon itself doesn't enforce it and can't:
   * that's a runtime/CSS contract, not something the type system can check.
   */
  frame: ReactElement;
  icon?: ReactNode;
  modifierTop?: ReactNode;
  modifierBottom?: ReactNode;
  /** Keyed by position code (see AMPLIFIER_POSITIONS). Only the slots present in this object are rendered. */
  amplifiers?: Amplifiers;
  /**
   * Overall icon size in pixels. The frame always renders at size x size,
   * anchored at its own center — amplifiers overflow outside this box but
   * never affect its dimensions, so the center point is a stable anchor for
   * map libraries (e.g. maplibregl.Marker's default `anchor: 'center'`).
   * There's no other anchor mode yet (e.g. flagpole-style bottom anchors) —
   * add one if/when a real use case needs it.
   */
  size?: number;
  className?: string;
  style?: CSSProperties;
}
