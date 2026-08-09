import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

/** Rounded top, flat bottom — the air silhouette from that same guidance; the inverse of CupFrame. */
export function CapFrame({ fill }: Pick<FrameBaseProps, 'fill'>) {
  return <FrameBase fill={fill} style={{ borderRadius: '50% 50% 0 0' }} />;
}
