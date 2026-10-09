<script lang="ts">
  const { strength }: { strength: number } = $props();
  const bars = [0, 1, 2, 3];
</script>

<svg width="16" height="14" viewBox="0 0 16 14" style="display: block">
  <title>{`Signal strength: ${strength}/4`}</title>
  {#each bars as i (i)}
    {@const h = 3 + i * 3.5}
    <rect
      x={i * 4}
      y={14 - h}
      width={3}
      height={h}
      fill={i < strength ? '#2ecc71' : 'rgba(10,10,10,0.7)'}
    />
  {/each}
</svg>
