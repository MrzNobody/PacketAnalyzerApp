import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

const MOCK_PROTOCOLS = [
  { proto: 'TLS',  packets: 18420, bytes: 48200000, color: '#3b82f6' },  // blue-500
  { proto: 'TCP',  packets: 12840, bytes: 31500000, color: '#8b5cf6' },  // violet-500
  { proto: 'DNS',  packets:  6210, bytes:  1420000, color: '#a855f7' },  // purple-500
  { proto: 'UDP',  packets:  5880, bytes:  9800000, color: '#06b6d4' },  // cyan-500
  { proto: 'HTTP', packets:  3120, bytes:  7650000, color: '#f97316' },  // orange-500
  { proto: 'SIP',  packets:  1640, bytes:   820000, color: '#22c55e' },  // green-500
  { proto: 'RTP',  packets:  1380, bytes:  4310000, color: '#eab308' },  // yellow-500
  { proto: 'ICMP', packets:   420, bytes:    84000, color: '#ef4444' },  // red-500
];

function fmtBytes(b) {
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  if (b >= 1e3) return `${(b / 1e3).toFixed(1)} KB`;
  return `${b} B`;
}

// Compact SVG donut ring
function DonutRing({ data, size = 80 }) {
  const total = data.reduce((s, d) => s + d.packets, 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const slices = data.map((d) => {
    const pct = d.packets / total;
    const dash = pct * circ;
    const gap  = circ - dash;
    const el = { ...d, dash, gap, offset };
    offset += dash;
    return el;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      {slices.map((s) => (
        <circle
          key={s.proto}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={7}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}

export default function ProtocolDistributionPane() {
  const [sortBy, setSortBy] = useState('packets'); // 'packets' | 'bytes'
  const { globalSearch, session } = useData();
  const gs = (globalSearch || '').toLowerCase();

  const protocols = useMemo(() => {
    const raw = (session.isActive && session.aggregations?.protocolStats)
      ? session.aggregations.protocolStats
      : MOCK_PROTOCOLS;
    return raw
      .filter(p => !gs || p.proto.toLowerCase().includes(gs))
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [session.aggregations, session.isActive, gs, sortBy]);

  const totalPackets = protocols.reduce((s, p) => s + p.packets, 0);
  const totalBytes   = protocols.reduce((s, p) => s + p.bytes, 0);
  const maxPackets   = Math.max(...protocols.map(p => p.packets), 1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 shrink-0 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[var(--text-color)]">Protocol Distribution</h3>
        <div className="flex items-center gap-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-0.5">
          {(['packets', 'bytes']).map(mode => (
            <button
              key={mode}
              onClick={() => setSortBy(mode)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${sortBy === mode ? 'bg-[var(--surface-color)] text-blue-500 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-color)]'}`}
            >
              {mode === 'packets' ? 'Pkts' : 'Bytes'}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3 custom-scroll">

        {/* Donut + Totals Row */}
        <div className="flex items-center gap-4 p-3 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
          <div className="relative shrink-0">
            <DonutRing data={protocols} size={80} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase leading-tight text-center">
                {protocols.length}<br/>proto
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <div>
              <p className="text-[11px] text-[var(--text-secondary)]">Total Packets</p>
              <p className="text-[16px] font-bold text-[var(--text-color)] font-mono">{totalPackets.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-secondary)]">Total Volume</p>
              <p className="text-[14px] font-bold text-[var(--text-color)] font-mono">{fmtBytes(totalBytes)}</p>
            </div>
          </div>
          {/* Legend dots */}
          <div className="flex flex-col gap-1 ml-auto shrink-0">
            {protocols.slice(0, 5).map(p => (
              <div key={p.proto} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">{p.proto}</span>
              </div>
            ))}
            {protocols.length > 5 && (
              <span className="text-[10px] text-[var(--text-secondary)] opacity-60">+{protocols.length - 5} more</span>
            )}
          </div>
        </div>

        {/* Per-Protocol Bars */}
        {protocols.map((p) => {
          const barPct = sortBy === 'packets'
            ? (p.packets / maxPackets) * 100
            : (p.bytes / Math.max(...protocols.map(x => x.bytes), 1)) * 100;
          const sharePct = ((p.packets / totalPackets) * 100).toFixed(1);

          return (
            <div key={p.proto} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-[12px] font-semibold text-[var(--text-color)] font-mono w-10">{p.proto}</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">{sharePct}%</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                  {sortBy === 'packets' ? p.packets.toLocaleString() + ' pkts' : fmtBytes(p.bytes)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-color)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barPct}%`, background: p.color, opacity: 0.8 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
