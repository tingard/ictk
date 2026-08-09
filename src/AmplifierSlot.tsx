import { memo } from 'react';
import type { ReactNode } from 'react';
import type { AmplifierPosition } from './types';

interface AmplifierSlotProps {
  position: AmplifierPosition;
  content: ReactNode;
}

/**
 * Memoized so that updating one amplifier's content doesn't re-render sibling
 * slots — bailout relies on the caller preserving referential stability for
 * the amplifiers it didn't change (see Icon.test.tsx for a worked example).
 */
export const AmplifierSlot = memo(function AmplifierSlot({
  position,
  content,
}: AmplifierSlotProps) {
  return <div className={`ictk-amplifier ictk-amplifier--${position}`}>{content}</div>;
});
