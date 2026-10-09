<script lang="ts">
  import IconifyIcon from '@iconify/svelte';
  import { Icon } from '@tingard/ictk-svelte';

  const { bearing }: { bearing: number } = $props();
</script>

<!-- A custom frame: any markup carrying the `ictk-frame` class works, no
     FrameBase required. -->
{#snippet frame()}
  <IconifyIcon
    icon="ic:outline-airplanemode-active"
    height="none"
    class="ictk-frame"
    style="transform: rotate({bearing}deg); color: white"
  />
{/snippet}
{#snippet bearingLabel()}
  <span style="background-color: white; padding: 3px">{bearing.toFixed(1)}&deg;</span>
{/snippet}

{#snippet speedLabel()}
  <span style="background-color: white; padding: 3px">100kts</span>
{/snippet}

<Icon size={48} {frame} amplifiers={{ R4: bearingLabel, R1: speedLabel }} />
