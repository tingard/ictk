// Small SVG status icons for amplifier slots — deliberately not emoji, for
// consistent rendering across platforms/fonts.

export function SignalBars({ strength }: { strength: number }) {
  const bars = [0, 1, 2, 3];
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" style={{ display: 'block' }}>
      <title>{`Signal strength: ${strength}/4`}</title>
      {bars.map((i) => {
        const h = 3 + i * 3.5;
        return (
          <rect
            key={i}
            x={i * 4}
            y={14 - h}
            width={3}
            height={h}
            fill={i < strength ? '#2ecc71' : 'rgba(10,10,10,0.7)'}
          />
        );
      })}
    </svg>
  );
}

export function BatteryIcon({ level }: { level: number }) {
  const color = level < 20 ? '#e74c3c' : level < 50 ? '#f39c12' : '#2ecc71';
  const fillWidth = Math.max(1, (level / 100) * 14);
  return (
    <svg
      width="20"
      height="12"
      viewBox="0 0 20 12"
      style={{ display: 'block' }}
    >
      <title>{`Battery: ${level}%`}</title>
      <rect
        x="0.5"
        y="0.5"
        width="17"
        height="11"
        rx="1.5"
        fill="#000"
        stroke="#eee"
        strokeWidth="1"
      />
      <rect x="18" y="4" width="1.5" height="4" fill="#eee" />
      <rect x="2" y="2" width={fillWidth} height="8" fill={color} />
    </svg>
  );
}
