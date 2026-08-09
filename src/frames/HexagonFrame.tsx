import type { FrameBaseProps } from './FrameBase';
import { FrameBase } from './FrameBase';

export function HexagonFrame({ fill }: Pick<FrameBaseProps, 'fill'>) {
  return (
    <FrameBase
      fill={fill}
      style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
    />
  );
}
