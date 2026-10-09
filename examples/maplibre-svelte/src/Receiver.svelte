<script lang="ts">
  import IconifyIcon from '@iconify/svelte';
  import { Icon, SquareFrame } from '@tingard/ictk-svelte';
  import BatteryIcon from './BatteryIcon.svelte';
  import SignalBars from './SignalBars.svelte';

  const { id, signal, battery }: { id: string; signal: number; battery: number } = $props();
</script>

<!-- Amplifier content is a snippet (or plain text); declared once here and
     handed to Icon as values in the `amplifiers` record. -->
{#snippet frame()}
  <SquareFrame fill="#2f6fe0" stroke={{ color: 'white', width: 2 }} />
{/snippet}
{#snippet glyph()}
  <IconifyIcon
    icon="icon-park-outline:receiver"
    height="none"
    style="width: 12px; height: 12px; color: white"
  />
{/snippet}
{#snippet label()}
  <span style="color: white">{id}</span>
{/snippet}
{#snippet signalBars()}
  <SignalBars strength={signal} />
{/snippet}
{#snippet batteryIcon()}
  <BatteryIcon level={battery} />
{/snippet}

<Icon
  size={40}
  {frame}
  icon={glyph}
  modifierBottom={label}
  amplifiers={{ L0: signalBars, L4: batteryIcon }}
/>
