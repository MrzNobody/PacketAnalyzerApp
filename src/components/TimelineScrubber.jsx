import { useMemo } from 'react';

/**
 * TimelineScrubber: A full-width sparkline representing packet volume over time.
 * Click or drag to filter the visible time window in the DataContext.
 */
export default function TimelineScrubber({ packets = [] }) {
  // Build histogram of packet volume per second bucket (mock)
  const buckets = useMemo(() => {
    if (!packets.length) return Array(60).fill(0).map((_, i) => ({ t: i, v: Math.floor(((i * 13) % 80) + 10) }));
    // Real: bin by timestamp
    return packets.reduce((acc, p) => {
      const sec = Math.floor((p.timestamp - packets[0].timestamp) / 1000);
      acc[sec] = (acc[sec] || 0) + 1;
      return acc;
    }, {});
  }, [packets]);

  const values = Array.isArray(buckets) ? buckets.map(b => b.v) : Object.values(buckets);
  const max = Math.max(...values, 1);
  const width = 1000;
  const height = 48;
  const barW = width / values.length;

  const points = values.map((v, i) => {
    const x = i * barW + barW / 2;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-[64px] px-5 border-b border-[var(--border-color)] bg-[var(--surface-color)] flex flex-col justify-center gap-1 shrink-0">
      <div className="flex items-center justify-between text-[17px] text-[var(--text-secondary)] font-medium">
        <span>TRAFFIC TIMELINE — drag to filter window</span>
        <span className="font-mono">{values.length}s capture window</span>
      </div>
      <div className="relative w-full overflow-hidden rounded cursor-crosshair" style={{ height: height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Gradient fill */}
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#sparkGrad)"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
