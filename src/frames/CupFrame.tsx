import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

/** Flat top, rounded bottom — the sea-subsurface silhouette from NATO's own guidance for map icons. */
export function CupFrame({ fill }: Pick<FrameBaseProps, 'fill'>) {
  return <FrameBase fill={fill} style={{ borderRadius: '0 0 50% 50%' }} />;
}
