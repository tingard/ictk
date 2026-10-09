<script lang="ts">
  import type { Content } from './types.js';

  const { content }: { content: Content } = $props();
</script>

{#if typeof content === 'function'}{@render content()}{:else}{content}{/if}
