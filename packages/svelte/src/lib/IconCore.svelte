<script lang="ts">
  import Content from './Content.svelte';
  import type { Content as ContentType } from './types.js';

  /**
   * The icon/modifier composition — centered icon, modifiers above/below —
   * shared across every frame shape. Rendered as a layer on top of whichever
   * frame the consumer chose (same grid-area as .ictk-frame, painted on top
   * since it comes later in DOM order — see Icon.svelte), not by the frame
   * itself, so frames stay pure backdrop shapes regardless of what content is
   * being composed on top of them.
   */
  const {
    icon,
    modifierTop,
    modifierBottom,
  }: { icon?: ContentType; modifierTop?: ContentType; modifierBottom?: ContentType } = $props();
</script>

<div class="ictk-icon-core">
  {#if modifierTop != null}
    <div class="ictk-modifier ictk-modifier--top"><Content content={modifierTop} /></div>
  {/if}
  {#if icon != null}
    <div class="ictk-icon-content"><Content content={icon} /></div>
  {/if}
  {#if modifierBottom != null}
    <div class="ictk-modifier ictk-modifier--bottom"><Content content={modifierBottom} /></div>
  {/if}
</div>
