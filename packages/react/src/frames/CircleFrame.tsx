import { BUILT_IN_SHAPES } from '@tingard/ictk-core';
import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

export function CircleFrame({ fill, stroke }: Pick<FrameBaseProps, 'fill' | 'stroke'>) {
  return <FrameBase fill={fill} stroke={stroke} shape={BUILT_IN_SHAPES.circle} />;
}
