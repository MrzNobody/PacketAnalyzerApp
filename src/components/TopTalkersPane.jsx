import { useState, useMemo } from 'react';
import { Globe, BarChart3 } from 'lucide-react';
import { useData } from '../context/DataContext';

const MOCK_TALKERS = [
  { ip: '192.168.1.42', mac: 'a4:c3:f0:1e:2d:44', vendor: 'Apple', bytes: 48200000, pct: 38, country: 'US', ipv6: false },
  { ip: '10.0.0.15', mac: '00:1a:2b:3c:4d:5e', vendor: 'Cisco', bytes: 22100000, pct: 17, country: 'DE', ipv6: false },
  { ip: '2001:db8::1', mac: 'b8:27:eb:45:a1:99', vendor: 'Raspberry Pi', bytes: 18500000, pct: 15, country: 'GB', ipv6: true },
  { ip: '192.168.1.101', mac: 'dc:a6:32:fa:00:b3', vendor: 'Dell', bytes: 12000000, pct: 9, country: 'US', ipv6: false },
  { ip: '172.16.0.3', mac: '00:50:56:ab:cd:ef', vendor: 'VMware', bytes: 9800000, pct: 8, country: 'NL', ipv6: false },
];

function fmtBytes(b) {
  if (b > 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  if (b > 1e3) return `${(b / 1e3).toFixed(1)} KB`;
  return `${b} B`;
}



export default function TopTalkersPane() {
  const [view, setView] = useState('bars'); // 'bars' | 'geo'
  const { globalSearch, session } = useData();
  const gs = (globalSearch || '').toLowerCase();

  const filteredTalkers = useMemo(() => {
    const raw = (session.isActive && session.aggregations?.topTalkers) ? session.aggregations.topTalkers : MOCK_TALKERS;
    return raw.filter(t => !gs || t.ip.toLowerCase().includes(gs) || t.mac.toLowerCase().includes(gs) || (t.vendor && t.vendor.toLowerCase().includes(gs)));
  }, [session.aggregations, session.isActive, gs]);

  return (
    <div className="flex flex-col h-full">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <h3 className="text-[13px] font-semibold text-[var(--text-color)]">Top Talkers</h3>
        <div className="flex items-center gap-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-0.5">
          <button
            onClick={() => setView('bars')}
            title="Volume Bars"
            className={`p-1 rounded transition-all ${view === 'bars' ? 'bg-[var(--surface-color)] shadow-sm text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-color)]'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView('geo')}
            title="Geo Map"
            className={`p-1 rounded transition-all ${view === 'geo' ? 'bg-[var(--surface-color)] shadow-sm text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-color)]'}`}
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {view === 'bars' && filteredTalkers.map((t, i) => (
          <div key={t.ip} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] text-[var(--text-secondary)] font-mono w-3">{i + 1}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${t.ipv6 ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>
                  {t.ipv6 ? 'IPv6' : 'IPv4'}
                </span>
                <span className="text-[12px] font-mono text-[var(--text-color)] truncate">{t.ip}</span>
                {t.vendor === 'Enterprise Asset' && (
                  <span className="text-[9px] font-bold bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Enterprise</span>
                )}
                <span className="text-[11px] text-[var(--text-secondary)] hidden group-hover:inline">{t.vendor}</span>
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] shrink-0">{fmtBytes(t.bytes)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg-color)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${t.pct}%` }}
              />
            </div>
          </div>
        ))}

        {view === 'geo' && (
          <div className="flex-1 flex flex-col gap-2">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] text-center py-8 text-[12px] text-[var(--text-secondary)]">
              🌍 Geo-IP Map visualization mounts here (Phase 3 — IP → Country resolution)
            </div>
            {filteredTalkers.map(t => (
              <div key={t.ip} className="flex items-center justify-between text-[12px]">
                <span className="font-mono text-[var(--text-color)]">{t.ip}</span>
                <span className="text-[var(--text-secondary)]">{t.country}</span>
                <span className="font-semibold text-[var(--text-secondary)]">{fmtBytes(t.bytes)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
