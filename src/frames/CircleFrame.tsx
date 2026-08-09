import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

export function CircleFrame({ fill }: Pick<FrameBaseProps, 'fill'>) {
  return <FrameBase fill={fill} style={{ borderRadius: '50%' }} />;
}
