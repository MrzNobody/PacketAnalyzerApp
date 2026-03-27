import { useState, useCallback } from 'react';
import { Server, Router, Wifi, Monitor, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';

const MOCK_DEVICES = [
  { id: 1, protocol: 'CDP',  sysName: 'core-sw-01',     port: 'GigabitEthernet0/1',  mgmtIp: '10.0.0.1',  platform: 'Cisco Catalyst 9300',   version: '16.12.4', type: 'Switch'       },
  { id: 2, protocol: 'CDP',  sysName: 'dist-rt-02',     port: 'GigabitEthernet0/0',  mgmtIp: '10.0.0.2',  platform: 'Cisco ISR 4331',        version: '16.9.6',  type: 'Router'       },
  { id: 3, protocol: 'LLDP', sysName: 'ap-lobby-01',    port: 'eth0',                mgmtIp: '10.0.0.10', platform: 'Aruba AP-515',           version: '8.10.0.1',type: 'Access Point' },
  { id: 4, protocol: 'FDP',  sysName: 'edge-sw-03',     port: 'FastEthernet0/24',    mgmtIp: '10.0.0.3',  platform: 'Foundry FastIron GS',    version: '7.4.00',  type: 'Switch'       },
  { id: 5, protocol: 'LLDP', sysName: 'server-esxi-01', port: 'vmnic0',              mgmtIp: '10.0.0.50', platform: 'VMware ESXi 7.0',        version: '7.0.3',   type: 'Server'       },
];

const protoColors = {
  CDP:  'text-blue-400 bg-blue-400/10',
  LLDP: 'text-purple-400 bg-purple-400/10',
  FDP:  'text-green-400 bg-green-400/10',
};

const DeviceIcon = ({ type }) => {
  const cls = 'w-4 h-4 shrink-0';
  if (type === 'Router')       return <Router  className={`${cls} text-orange-400`} />;
  if (type === 'Access Point') return <Wifi    className={`${cls} text-blue-400`}   />;
  if (type === 'Server')       return <Server  className={`${cls} text-purple-400`} />;
  return                              <Monitor className={`${cls} text-green-400`}  />;
};

// Convert an IPv4 address to its PTR query name (e.g. 10.0.0.1 → 1.0.0.10.in-addr.arpa)
function toPTRName(ip) {
  return ip.split('.').reverse().join('.') + '.in-addr.arpa';
}

// Attempt a PTR lookup via Cloudflare DoH
async function resolvePTR(ip) {
  const name = toPTRName(ip);
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=PTR`,
      { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    // RCODE 0 = NOERROR; Answer section contains PTR records
    if (json.Status !== 0 || !json.Answer?.length) return null;
    // PTR RDATA ends with a trailing dot — strip it
    const ptr = json.Answer.find(a => a.type === 12); // type 12 = PTR
    return ptr ? ptr.data.replace(/\.$/, '') : null;
  } catch {
    return null;
  }
}

// Derive status label
function resolveStatus(state) {
  if (!state) return null;
  if (state.status === 'loading') return 'loading';
  if (state.hostname)             return 'resolved';
  if (state.status === 'private') return 'private';
  return 'unresolved';
}

const PRIVATE_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
];

function isPrivateIP(ip) {
  return PRIVATE_RANGES.some(r => r.test(ip));
}

export default function DeviceDiscoveryPane() {
  const { globalSearch, session } = useData();
  const gs = (globalSearch || '').toLowerCase();

  const raw = (session.isActive && session.aggregations?.discoveredDevices)
    ? session.aggregations.discoveredDevices
    : MOCK_DEVICES;

  const devices = raw.filter(d =>
    !gs ||
    d.sysName.toLowerCase().includes(gs)  ||
    d.mgmtIp.toLowerCase().includes(gs)   ||
    d.platform.toLowerCase().includes(gs) ||
    d.type.toLowerCase().includes(gs)
  );

  // Map of mgmtIp → { status: 'loading'|'resolved'|'unresolved'|'private', hostname: string|null }
  const [resolved, setResolved] = useState({});
  const [resolving, setResolving] = useState(false);

  const handleResolveAll = useCallback(async () => {
    setResolving(true);

    // Kick off all PTR lookups in parallel
    const seed = {};
    devices.forEach(d => {
      seed[d.mgmtIp] = { status: 'loading', hostname: null };
    });
    setResolved({ ...seed });

    await Promise.all(
      devices.map(async (d) => {
        const ip = d.mgmtIp;

        if (isPrivateIP(ip)) {
          // Private IPs won't resolve via public DoH — mark immediately
          setResolved(prev => ({
            ...prev,
            [ip]: { status: 'private', hostname: null }
          }));
          return;
        }

        const hostname = await resolvePTR(ip);
        setResolved(prev => ({
          ...prev,
          [ip]: {
            status: hostname ? 'resolved' : 'unresolved',
            hostname,
          },
        }));
      })
    );

    setResolving(false);
  }, [devices]);

  const anyResolved = Object.keys(resolved).length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-[var(--text-color)]">Device Discovery</h3>
            <div className="flex gap-1">
              {['CDP', 'LLDP', 'FDP'].map(p => (
                <span key={p} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${protoColors[p]}`}>{p}</span>
              ))}
            </div>
          </div>

          {/* Resolve Hostnames button */}
          <button
            onClick={handleResolveAll}
            disabled={resolving}
            title="Attempt reverse DNS (PTR) lookups via Cloudflare DoH for all device management IPs"
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
              resolving
                ? 'border-blue-500/30 text-blue-500 bg-blue-500/5 cursor-not-allowed'
                : anyResolved
                ? 'border-green-500/30 text-green-600 bg-green-500/5 hover:bg-green-500/10'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-blue-500 hover:border-blue-500/40 hover:bg-blue-500/5'
            }`}
          >
            {resolving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving…</>
              : anyResolved
              ? <><CheckCircle2 className="w-3.5 h-3.5" /> Re-Resolve</>
              : <><RefreshCw className="w-3.5 h-3.5" /> Resolve Hostnames</>
            }
          </button>
        </div>

        {/* DoH note — shown after first attempt */}
        {anyResolved && !resolving && (
          <p className="text-[10px] text-[var(--text-secondary)] mt-1.5">
            PTR results via Cloudflare DoH (1.1.1.1). Private/RFC1918 IPs require an internal DNS server — not resolvable from the browser.
          </p>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <table className="w-full border-collapse text-[12px]" style={{ minWidth: 520 }}>
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              {['Type', 'System Name', 'Hostname (PTR)', 'Port', 'Mgmt IP', 'Platform', 'Version', 'Proto'].map(h => (
                <th key={h} className="text-left py-2 px-1.5 font-semibold text-[var(--text-secondary)] text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.map(d => {
              const state  = resolved[d.mgmtIp];
              const status = resolveStatus(state);

              return (
                <tr key={d.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-color)] transition-colors">
                  {/* Type */}
                  <td className="py-2 px-1.5">
                    <div className="flex items-center gap-1.5">
                      <DeviceIcon type={d.type} />
                      <span className="text-[11px] text-[var(--text-secondary)]">{d.type}</span>
                    </div>
                  </td>

                  {/* System Name (self-reported via CDP/LLDP) */}
                  <td className="py-2 px-1.5 font-mono font-semibold text-[var(--text-color)]">{d.sysName}</td>

                  {/* Hostname (PTR resolved) */}
                  <td className="py-2 px-1.5">
                    {!state && (
                      <span className="text-[11px] text-[var(--text-secondary)] opacity-40 italic">—</span>
                    )}
                    {status === 'loading' && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-500">
                        <Loader2 className="w-3 h-3 animate-spin" /> resolving…
                      </span>
                    )}
                    {status === 'resolved' && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-green-500">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        {state.hostname}
                      </span>
                    )}
                    {status === 'private' && (
                      <span
                        className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] italic"
                        title="Private/RFC1918 IP — requires internal DNS. Not resolvable via public DoH."
                      >
                        <AlertCircle className="w-3 h-3 shrink-0 text-orange-400" />
                        Private IP
                      </span>
                    )}
                    {status === 'unresolved' && (
                      <span className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] italic">
                        <AlertCircle className="w-3 h-3 shrink-0 opacity-40" />
                        No PTR record
                      </span>
                    )}
                  </td>

                  {/* Port */}
                  <td className="py-2 px-1.5 font-mono text-[var(--text-secondary)] text-[11px]">{d.port}</td>

                  {/* Mgmt IP */}
                  <td className="py-2 px-1.5 font-mono text-[var(--text-color)]">{d.mgmtIp}</td>

                  {/* Platform */}
                  <td className="py-2 px-1.5 text-[var(--text-secondary)] text-[11px]">{d.platform}</td>

                  {/* Version */}
                  <td className="py-2 px-1.5 font-mono text-[var(--text-secondary)] text-[11px]">{d.version}</td>

                  {/* Protocol badge */}
                  <td className="py-2 px-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${protoColors[d.protocol]}`}>{d.protocol}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
