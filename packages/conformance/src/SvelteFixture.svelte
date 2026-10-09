<script lang="ts">
  import {
    CapFrame,
    CircleFrame,
    CupFrame,
    DiamondFrame,
    HexagonFrame,
    Icon,
    SquareFrame,
  } from '@tingard/ictk-svelte';
  import type { Spec } from './spec';

  const { spec }: { spec: Spec } = $props();
  const frameName = $derived(spec.frame ?? 'square');
</script>

<Icon
  size={spec.size}
  class={spec.className}
  icon={spec.icon}
  modifierTop={spec.modifierTop}
  modifierBottom={spec.modifierBottom}
  amplifiers={spec.amplifiers}
>
  {#snippet frame()}
    {#if frameName === 'square'}
      <SquareFrame fill={spec.fill} stroke={spec.stroke} />
    {:else if frameName === 'circle'}
      <CircleFrame fill={spec.fill} stroke={spec.stroke} />
    {:else if frameName === 'hexagon'}
      <HexagonFrame fill={spec.fill} stroke={spec.stroke} />
    {:else if frameName === 'diamond'}
      <DiamondFrame fill={spec.fill} stroke={spec.stroke} />
    {:else if frameName === 'cup'}
      <CupFrame fill={spec.fill} stroke={spec.stroke} />
    {:else}
      <CapFrame fill={spec.fill} stroke={spec.stroke} />
    {/if}
  {/snippet}
</Icon>
