import type { ReactNode } from 'react';

interface IconCoreProps {
  icon?: ReactNode;
  modifierTop?: ReactNode;
  modifierBottom?: ReactNode;
}

/**
 * The icon/modifier composition — centered icon, modifiers above/below —
 * shared across every frame shape. Rendered as a layer on top of whichever
 * frame the consumer chose (same grid-area as .ictk-frame, painted on top
 * since it comes later in DOM order — see Icon.tsx), not by the frame
 * itself, so frames stay pure backdrop shapes regardless of what content is
 * being composed on top of them.
 */
export function IconCore({ icon, modifierTop, modifierBottom }: IconCoreProps) {
  return (
    <div className="ictk-icon-core">
      {modifierTop != null && <div className="ictk-modifier ictk-modifier--top">{modifierTop}</div>}
      {icon != null && <div className="ictk-icon-content">{icon}</div>}
      {modifierBottom != null && (
        <div className="ictk-modifier ictk-modifier--bottom">{modifierBottom}</div>
      )}
    </div>
  );
}
