/**
 * Amplifier slot positions, following the field layout from NATO's own guidance for map icons, referenced in the README figure.
 */
export const AMPLIFIER_POSITIONS = [
  'T',
  'L0',
  'L1',
  'L2',
  'L3',
  'L4',
  'R0',
  'R1',
  'R2',
  'R3',
  'R4',
  'B0',
  'B1',
] as const;

export type AmplifierPosition = (typeof AMPLIFIER_POSITIONS)[number];
