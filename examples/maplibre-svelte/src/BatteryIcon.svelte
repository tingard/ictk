<script lang="ts">
  const { level }: { level: number } = $props();
  const color = $derived(level < 20 ? '#e74c3c' : level < 50 ? '#f39c12' : '#2ecc71');
  const fillWidth = $derived(Math.max(1, (level / 100) * 14));
</script>

<svg width="20" height="12" viewBox="0 0 20 12" style="display: block">
  <title>{`Battery: ${level}%`}</title>
  <rect x="0.5" y="0.5" width="17" height="11" rx="1.5" fill="#000" stroke="#eee" stroke-width="1" />
  <rect x="18" y="4" width="1.5" height="4" fill="#eee" />
  <rect x="2" y="2" width={fillWidth} height="8" fill={color} />
</svg>
