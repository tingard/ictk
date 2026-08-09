import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

export function DiamondFrame({ fill, stroke }: Pick<FrameBaseProps, 'fill' | 'stroke'>) {
  return (
    <FrameBase
      fill={fill}
      stroke={stroke}
      shape={{ kind: 'polygon', points: '50,0 100,50 50,100 0,50' }}
    />
  );
}
