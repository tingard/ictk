<script lang="ts">
  import { BUILT_IN_SHAPES } from '@tingard/ictk-core';
  import type { FrameBaseProps } from '@tingard/ictk-core';
  import FrameBase from '../FrameBase.svelte';

  const { fill, stroke }: Pick<FrameBaseProps, 'fill' | 'stroke'> = $props();
</script>

<FrameBase {fill} {stroke} shape={BUILT_IN_SHAPES.diamond} />
