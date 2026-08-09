import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

export function SquareFrame({ fill }: Pick<FrameBaseProps, 'fill'>) {
  return <FrameBase fill={fill} style={{ borderRadius: '4px' }} />;
}
