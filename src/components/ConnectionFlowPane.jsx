import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { useData } from '../context/DataContext';

const MOCK_FLOWS = [
  { id: 1, src: '192.168.1.42', srcPort: 54321, dst: '1.1.1.1',         dstPort: 443, proto: 'TLS',  bytes: 4820000, pkts: 3120, flags: 'ESTABLISHED', ipv6: false },
  { id: 2, src: '192.168.1.15', srcPort: 55102, dst: '8.8.8.8',         dstPort: 53,  proto: 'DNS',  bytes: 1200,    pkts: 8,    flags: 'UDP',          ipv6: false },
  { id: 3, src: '2001:db8::1',  srcPort: 45000, dst: '2606:4700::1',    dstPort: 443, proto: 'TLS',  bytes: 2100000, pkts: 890,  flags: 'ESTABLISHED', ipv6: true  },
  { id: 4, src: '192.168.1.101',srcPort: 139,   dst: '192.168.1.5',     dstPort: 445, proto: 'SMB',  bytes: 560000,  pkts: 320,  flags: 'FIN',          ipv6: false },
  { id: 5, src: '172.16.0.3',   srcPort: 60021, dst: '93.184.216.34',   dstPort: 80,  proto: 'HTTP', bytes: 42000,   pkts: 64,   flags: 'FIN',          ipv6: false },
  { id: 6, src: '192.168.1.200',srcPort: 33901, dst: '17.253.144.10',   dstPort: 443, proto: 'TLS',  bytes: 3100000, pkts: 2100, flags: 'ESTABLISHED', ipv6: false },
];

const protoColor = {
  TLS:  'text-green-400 bg-green-400/10',
  DNS:  'text-purple-400 bg-purple-400/10',
  HTTP: 'text-orange-400 bg-orange-400/10',
  SMB:  'text-yellow-400 bg-yellow-400/10',
};

function fmtBytes(b) {
  if (b > 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  if (b > 1e3) return `${(b / 1e3).toFixed(1)} KB`;
  return `${b} B`;
}

export default function ConnectionFlowPane({ onOpenLadder }) {
  const [sortBy,   setSortBy]   = useState('bytes');
  const [sortDir,  setSortDir]  = useState('desc');
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState('');
  const { globalSearch, session } = useData();
  const gs = (globalSearch || '').toLowerCase();
  const lf = (filter || '').toLowerCase();

  // Use pre-aggregated flows from worker — zero main-thread cost
  const flows = useMemo(() => {
    const raw = (session.isActive && session.aggregations?.topFlows) ? session.aggregations.topFlows : MOCK_FLOWS;
    return raw
      .filter(f => {
        const gMatch = !gs || f.src.toLowerCase().includes(gs) || f.dst.toLowerCase().includes(gs) || f.proto.toLowerCase().includes(gs);
        const lMatch = !lf || f.src.toLowerCase().includes(lf) || f.dst.toLowerCase().includes(lf) || f.proto.toLowerCase().includes(lf);
        return gMatch && lMatch;
      })
      .sort((a, b) => sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
  }, [session.aggregations, session.isActive, gs, lf, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'desc'
      ? <ArrowDown className="w-3 h-3 text-blue-500" />
      : <ArrowUp   className="w-3 h-3 text-blue-500" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0 gap-3">
        <h3 className="text-[17px] font-semibold text-[var(--text-color)] shrink-0">Connection Flows</h3>
        <input
          type="text"
          placeholder="Filter IP / protocol..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 text-[16px] bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <table className="w-full border-collapse text-[16px]" style={{ minWidth: 520 }}>
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              {[
                { label: 'Source',      col: null    },
                { label: 'Destination', col: null    },
                { label: 'Proto',       col: null    },
                { label: 'Bytes',       col: 'bytes' },
                { label: 'Pkts',        col: 'pkts'  },
                { label: '',            col: null    }, // expand arrow
                { label: '',            col: null    }, // ladder button col
              ].map((h, i) => (
                <th
                  key={i}
                  onClick={() => h.col && toggleSort(h.col)}
                  className={`text-left py-2 px-1 font-semibold text-[var(--text-secondary)] select-none text-[17px] ${h.col ? 'cursor-pointer hover:text-[var(--text-color)]' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {h.label}
                    {h.col && <SortIcon col={h.col} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {flows.map(f => (
              <>
                <tr
                  key={f.id}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-color)] transition-colors group"
                >
                  {/* Source */}
                  <td
                    className="py-2 px-1 font-mono text-[var(--text-color)] cursor-pointer"
                    onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                  >
                    <span className={`inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded-full mr-1 ${f.ipv6 ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {f.ipv6 ? 'v6' : 'v4'}
                    </span>
                    {f.src}:{f.srcPort}
                  </td>

                  {/* Destination */}
                  <td
                    className="py-2 px-1 font-mono text-[var(--text-secondary)] cursor-pointer"
                    onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                  >
                    {f.dst}:{f.dstPort}
                  </td>

                  {/* Protocol */}
                  <td className="py-2 px-1">
                    <span className={`text-[16px] font-semibold px-1.5 py-0.5 rounded-full ${protoColor[f.proto] ?? 'bg-gray-400/10 text-gray-400'}`}>
                      {f.proto}
                    </span>
                  </td>

                  {/* Bytes */}
                  <td className="py-2 px-1 text-[var(--text-secondary)] font-mono">
                    {fmtBytes(f.bytes)}
                  </td>

                  {/* Packets */}
                  <td className="py-2 px-1 text-[var(--text-secondary)] font-mono">
                    {f.pkts.toLocaleString()}
                  </td>

                  {/* Expand toggle */}
                  <td
                    className="py-2 px-1 text-[var(--text-secondary)] cursor-pointer w-6"
                    onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                  >
                    {expanded === f.id
                      ? <ChevronDown  className="w-3.5 h-3.5" />
                      : <ChevronRight className="w-3.5 h-3.5" />}
                  </td>

                  {/* ── Ladder Diagram Button (per-row) ── */}
                  <td className="py-2 px-1 w-8">
                    <button
                      title={`View TCP Ladder: ${f.src}:${f.srcPort} → ${f.dst}:${f.dstPort}`}
                      onClick={() => onOpenLadder?.(f)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-500/15 text-[var(--text-secondary)] hover:text-blue-500 transition-all"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>

                {/* Expanded detail row */}
                {expanded === f.id && (
                  <tr key={`${f.id}-detail`} className="bg-[var(--bg-color)]">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="grid grid-cols-4 gap-3 text-[17px]">
                        <div>
                          <p className="text-[var(--text-secondary)]">TCP Flags</p>
                          <p className="font-semibold text-[var(--text-color)]">{f.flags}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-secondary)]">Avg Pkt Size</p>
                          <p className="font-semibold text-[var(--text-color)]">{(f.bytes / f.pkts).toFixed(0)} B</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-secondary)]">IP Version</p>
                          <p className="font-semibold text-[var(--text-color)]">{f.ipv6 ? 'IPv6' : 'IPv4'}</p>
                        </div>
                        <div>
                          <button
                            onClick={() => onOpenLadder?.(f)}
                            className="flex items-center gap-1.5 text-blue-500 hover:text-blue-400 font-semibold transition-colors"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            View Stream Ladder
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
