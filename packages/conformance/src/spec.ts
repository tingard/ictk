import type { AmplifierPosition, Fill, Stroke } from '@tingard/ictk-core';

export const FRAME_NAMES = ['square', 'circle', 'hexagon', 'diamond', 'cup', 'cap'] as const;
export type FrameName = (typeof FRAME_NAMES)[number];

/**
 * A framework-neutral description of one icon. Every binding gets an adapter
 * turning a Spec into an HTML string, so the same scenario runs through all
 * of them. Content is plain text on purpose: text is the one content type
 * every binding supports identically (React nodes and Svelte snippets are
 * each binding's own business and covered by its own unit tests).
 */
export interface Spec {
  size?: number;
  frame?: FrameName;
  fill?: Fill;
  stroke?: Stroke;
  icon?: string;
  modifierTop?: string;
  modifierBottom?: string;
  amplifiers?: Partial<Record<AmplifierPosition, string>>;
  className?: string;
}

export interface Adapter {
  name: string;
  /** Server-render the spec to an HTML fragment. */
  render(spec: Spec): string;
  /** Absolute path of the stylesheet this binding's consumers would import. */
  cssPath: URL;
}
