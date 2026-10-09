import {
  CapFrame,
  CircleFrame,
  CupFrame,
  DiamondFrame,
  HexagonFrame,
  Icon,
  SquareFrame,
} from '@tingard/ictk-react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Adapter, FrameName, Spec } from './spec';

const FRAMES = {
  square: SquareFrame,
  circle: CircleFrame,
  hexagon: HexagonFrame,
  diamond: DiamondFrame,
  cup: CupFrame,
  cap: CapFrame,
} satisfies Record<FrameName, unknown>;

export const reactAdapter: Adapter = {
  name: 'react',
  cssPath: new URL('../../react/dist/style.css', import.meta.url),
  render(spec: Spec) {
    const Frame = FRAMES[spec.frame ?? 'square'];
    return renderToStaticMarkup(
      <Icon
        size={spec.size}
        className={spec.className}
        frame={<Frame fill={spec.fill} stroke={spec.stroke} />}
        icon={spec.icon}
        modifierTop={spec.modifierTop}
        modifierBottom={spec.modifierBottom}
        amplifiers={spec.amplifiers}
      />,
    );
  },
};
