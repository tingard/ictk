import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

export function DiamondFrame({ fill }: Pick<FrameBaseProps, 'fill'>) {
  return (
    <FrameBase fill={fill} style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
  );
}
