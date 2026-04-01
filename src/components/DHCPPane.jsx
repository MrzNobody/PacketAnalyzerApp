import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';

const MOCK_DHCP = {
  counters: { discover: 18, offer: 24, request: 18, ack: 17, nak: 1 },
  servers: [
    { ip: '192.168.1.1', mac: '00:1a:2b:3c:4d:5e', vendor: 'Cisco Systems', offers: 18, isRogue: false },
    { ip: '192.168.1.254', mac: 'dc:ef:09:ab:cd:12', vendor: 'Unknown Vendor', offers: 6, isRogue: true },
  ],
  clients: [
    { mac: 'a4:c3:f0:1e:2d:44', vendor: 'Apple', assignedIp: '192.168.1.42', serverIp: '192.168.1.1', state: 'ACK' },
    { mac: '00:50:56:ab:cd:ef', vendor: 'VMware', assignedIp: '192.168.1.110', serverIp: '192.168.1.254', state: 'ACK' },
    { mac: 'b8:27:eb:45:a1:99', vendor: 'Raspberry Pi', assignedIp: null, serverIp: '192.168.1.1', state: 'NAK' },
  ],
};

const rogueDetected = MOCK_DHCP.servers.some(s => s.isRogue);

const DORA_STEPS = ['DISCOVER', 'OFFER', 'REQUEST', 'ACK'];
const DORA_KEYS = ['discover', 'offer', 'request', 'ack'];
const DORA_COLORS = ['text-blue-400 bg-blue-400/10', 'text-purple-400 bg-purple-400/10', 'text-yellow-400 bg-yellow-400/10', 'text-green-400 bg-green-400/10'];

export default function DHCPPane() {
  const { globalSearch } = useData();
  const gs = (globalSearch || '').toLowerCase();

  const servers = MOCK_DHCP.servers.filter(s => !gs || s.ip.toLowerCase().includes(gs) || s.mac.toLowerCase().includes(gs) || s.vendor.toLowerCase().includes(gs));
  const clients = MOCK_DHCP.clients.filter(c => !gs || c.mac.toLowerCase().includes(gs) || c.vendor.toLowerCase().includes(gs) || (c.assignedIp && c.assignedIp.toLowerCase().includes(gs)) || c.serverIp.toLowerCase().includes(gs));

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scroll">
      {/* Rogue Server Alert Banner */}
      {rogueDetected && (
        <div className="mx-4 mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/40 rounded-xl p-4 shrink-0">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[17px] font-bold text-red-500">⚠ Rogue DHCP Server Detected — Possible MitM Attack</p>
            <p className="text-[16px] text-red-400/80 mt-0.5">
              Multiple DHCP servers are issuing OFFERs. A device at <span className="font-mono font-semibold">192.168.1.254</span> (Unknown Vendor) is acting as an unauthorized DHCP server.
            </p>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 pb-2 shrink-0">
        <h3 className="text-[17px] font-semibold text-[var(--text-color)]">DHCP Monitor & Rogue Detection</h3>
      </div>

      {/* DORA Sequence Counters */}
      <div className="px-4 pb-3 shrink-0">
        <p className="text-[16px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">DORA Sequence Counters</p>
        <div className="grid grid-cols-4 gap-2">
          {DORA_STEPS.map((step, i) => (
            <div key={step} className={`rounded-xl border p-3 text-center ${i < DORA_STEPS.length - 1 ? 'border-[var(--border-color)]' : rogueDetected ? 'border-green-400/30 bg-green-400/5' : 'border-[var(--border-color)]'}`}>
              <p className={`text-[16px] font-bold uppercase tracking-wider ${DORA_COLORS[i].split(' ')[0]}`}>{step}</p>
              <p className="text-[24px] font-bold text-[var(--text-color)]">{MOCK_DHCP.counters[DORA_KEYS[i]]}</p>
            </div>
          ))}
        </div>
        {/* NAK pill */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[16px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">NAK</span>
          <span className="bg-red-400/10 text-red-400 text-[16px] font-bold px-2 py-0.5 rounded-full">{MOCK_DHCP.counters.nak} refused</span>
        </div>
      </div>

      {/* DHCP Servers Section */}
      <div className="px-4 pb-3">
        <p className="text-[16px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Active DHCP Servers</p>
        <div className="flex flex-col gap-2">
          {servers.map(server => (
            <div key={server.ip} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${server.isRogue ? 'border-red-500/40 bg-red-500/5' : 'border-[var(--border-color)] bg-[var(--bg-color)]'}`}>
              {server.isRogue
                ? <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                : <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-[var(--text-color)] font-mono">{server.ip}</p>
                <p className="text-[17px] text-[var(--text-secondary)]">{server.mac} · {server.vendor}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[16px] font-mono text-[var(--text-secondary)]">{server.offers} OFFERs</p>
                {server.isRogue && <p className="text-[16px] font-bold text-red-500">ROGUE</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DHCP Clients */}
      <div className="px-4 pb-4">
        <p className="text-[16px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2">DHCP Clients</p>
        <table className="w-full text-[17px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              {['MAC', 'Vendor', 'Assigned IP', 'Server', 'State'].map(h => (
                <th key={h} className="text-left py-1 px-1 text-[var(--text-secondary)] font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.mac} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-color)]">
                <td className="py-1.5 px-1 font-mono text-[var(--text-color)]">{c.mac}</td>
                <td className="py-1.5 px-1 text-[var(--text-secondary)]">{c.vendor}</td>
                <td className="py-1.5 px-1 font-mono">{c.assignedIp ?? <span className="text-red-400">None</span>}</td>
                <td className="py-1.5 px-1 font-mono text-[var(--text-secondary)]">{c.serverIp}</td>
                <td className="py-1.5 px-1">
                  <span className={`font-bold px-1.5 py-0.5 rounded-full text-[16px] ${c.state === 'ACK' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {c.state}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
