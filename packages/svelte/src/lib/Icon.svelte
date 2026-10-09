<script lang="ts">
  import { AMPLIFIER_POSITIONS, DEFAULT_SIZE } from '@tingard/ictk-core';
  import Content from './Content.svelte';
  import IconCore from './IconCore.svelte';
  import type { IconProps } from './types.js';

  const {
    frame,
    icon,
    modifierTop,
    modifierBottom,
    amplifiers,
    size = DEFAULT_SIZE,
    class: className,
    style,
  }: IconProps = $props();
</script>

<!--
  width/height are set inline so the box is exactly size x size even without
  the stylesheet. --ictk-size is also set so the stylesheet can scale
  amplifier font-size/offsets (in em) with icon size, independent of the
  ambient page font. Requires importing '@tingard/ictk-svelte/style.css'.
-->
<div
  class={['ictk-icon', className]}
  {style}
  style:width="{size}px"
  style:height="{size}px"
  style:--ictk-size="{size}px"
>
  {@render frame()}
  <IconCore {icon} {modifierTop} {modifierBottom} />
  {#if amplifiers}
    {#each AMPLIFIER_POSITIONS as position (position)}
      {@const content = amplifiers[position]}
      {#if content != null}
        <div class="ictk-amplifier ictk-amplifier--{position}"><Content {content} /></div>
      {/if}
    {/each}
  {/if}
</div>
