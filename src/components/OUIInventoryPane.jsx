import { ShieldAlert } from 'lucide-react';
import { useData } from '../context/DataContext';

// Simulated OUI inventory grouped by vendor
// Cross-referenced against DeviceDiscovery Pane — mismatch triggers red flag
const MOCK_OUI_INVENTORY = [
  { id: 1, vendor: 'Apple Inc.', oui: 'A4:C3:F0', count: 12, discoveredTypes: [], spoofFlag: false },
  { id: 2, vendor: 'Cisco Systems', oui: '00:1A:2B', count: 3, discoveredTypes: ['Switch', 'Router'], spoofFlag: false },
  { id: 3, vendor: 'Dell Technologies', oui: 'DC:A6:32', count: 5, discoveredTypes: [], spoofFlag: false },
  { id: 4, vendor: 'Raspberry Pi Foundation', oui: 'B8:27:EB', count: 2, discoveredTypes: [], spoofFlag: false },
  // Spoof case: OUI says "Philips Lighting" but discovery says "Core Switch"
  { id: 5, vendor: 'Philips Lighting BV', oui: 'DC:EF:09', count: 1, discoveredTypes: ['Switch'], spoofFlag: true },
  { id: 6, vendor: 'VMware, Inc.', oui: '00:50:56', count: 4, discoveredTypes: ['Server'], spoofFlag: false },
];

const VENDOR_COLORS = [
  'bg-blue-500/80', 'bg-indigo-500/80', 'bg-green-500/80',
  'bg-orange-500/80', 'bg-purple-500/80', 'bg-yellow-500/80',
];

const MAX_COUNT = Math.max(...MOCK_OUI_INVENTORY.map(o => o.count));

export default function OUIInventoryPane() {
  const { globalSearch } = useData();
  const gs = (globalSearch || '').toLowerCase();
  const items = MOCK_OUI_INVENTORY.filter(item => !gs || item.vendor.toLowerCase().includes(gs) || item.oui.toLowerCase().includes(gs));

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 shrink-0 flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-[var(--text-color)]">OUI Hardware Asset Inventory</h3>
        <span className="text-[17px] text-[var(--text-secondary)]">IEEE OUI Registry</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2 custom-scroll">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`rounded-xl border p-3 transition-all cursor-pointer hover:shadow-sm ${
              item.spoofFlag
                ? 'border-red-500/50 bg-red-500/5'
                : 'border-[var(--border-color)] hover:border-blue-500/40'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {/* Colored OUI circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[16px] font-bold shrink-0 ${VENDOR_COLORS[i % VENDOR_COLORS.length]}`}>
                {item.vendor.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[17px] font-semibold text-[var(--text-color)] truncate">{item.vendor}</p>
                  {item.spoofFlag && (
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </div>
                <p className="text-[17px] font-mono text-[var(--text-secondary)]">{item.oui}:xx:xx:xx</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[17px] font-bold text-[var(--text-color)]">{item.count}</p>
                <p className="text-[16px] text-[var(--text-secondary)]">device{item.count !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Volume bar */}
            <div className="w-full h-1.5 rounded-full bg-[var(--bg-color)] overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${item.spoofFlag ? 'bg-red-500' : VENDOR_COLORS[i % VENDOR_COLORS.length]}`}
                style={{ width: `${(item.count / MAX_COUNT) * 100}%` }}
              />
            </div>

            {/* Cross-reference */}
            {item.discoveredTypes.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[16px] text-[var(--text-secondary)]">Pane 5 match:</span>
                {item.discoveredTypes.map(t => (
                  <span key={t} className={`text-[16px] font-semibold px-1.5 py-0.5 rounded-full ${item.spoofFlag ? 'text-red-400 bg-red-400/10' : 'text-blue-400 bg-blue-400/10'}`}>{t}</span>
                ))}
                {item.spoofFlag && (
                  <span className="text-[16px] font-bold text-red-500 ml-auto">⚠ MAC SPOOF / MitM RISK</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
