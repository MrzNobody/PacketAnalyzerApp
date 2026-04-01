import { useState } from 'react';
import { AlertTriangle, Info, ShieldAlert, CheckCircle2, ChevronRight, Lightbulb, ExternalLink } from 'lucide-react';
import { ALERT_RULES, INSIGHTS, nistColors } from '../utils/alerting-engine';

const sevConfig = {
  critical: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: ShieldAlert },
  warning:  { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', icon: AlertTriangle },
  info:     { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', icon: Info },
};

const priorityColors = {
  P1: 'text-red-500 bg-red-500/10',
  P2: 'text-orange-400 bg-orange-400/10',
  P3: 'text-blue-400 bg-blue-400/10',
};

function AlertCard({ alert, onAck, acked, onJump }) {
  const cfg = sevConfig[alert.severity];
  const Icon = cfg.icon;
  return (
    <div className={`rounded-xl border p-3 transition-all ${acked ? 'opacity-35 grayscale border-[var(--border-color)]' : `${cfg.bg} ${cfg.border}`}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${acked ? 'text-[var(--text-secondary)]' : cfg.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-semibold leading-snug text-[var(--text-color)]">{alert.title}</p>
          <p className="text-[17px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{alert.desc}</p>
          <span className={`inline-flex mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${nistColors[alert.nist] ?? 'bg-gray-400/10 text-gray-400'}`}>
            NIST {alert.nist}
          </span>
        </div>
      </div>
      {!acked && (
        <div className="mt-2 flex items-center gap-3">
          <button onClick={() => onAck(alert.id)} className="flex items-center gap-1 text-[17px] font-medium text-[var(--text-secondary)] hover:text-green-500 transition-colors">
            <CheckCircle2 className="w-3 h-3" /> Acknowledge
          </button>
          {alert.jumpTo && (
            <button onClick={() => onJump(alert.jumpTo)} className="flex items-center gap-1 text-[17px] font-medium text-[var(--text-secondary)] hover:text-blue-500 transition-colors ml-auto">
              <ExternalLink className="w-3 h-3" /> Jump to →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ metadata, onJumpTo }) {
  const [ackedIds, setAckedIds] = useState(new Set());
  const [section, setSection] = useState('alerts');
  const [protoOpen, setProtoOpen] = useState(true);

  const ack = (id) => setAckedIds(prev => new Set([...prev, id]));
  const activeCount = ALERT_RULES.filter(a => !ackedIds.has(a.id)).length;

  return (
    <aside className="w-[320px] shrink-0 border-r border-[var(--border-color)] bg-[var(--surface-color)] flex flex-col overflow-hidden">
      {/* Capture Meta */}
      <div className="p-4 border-b border-[var(--border-color)] shrink-0">
        <p className="text-[16px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2 text-center border border-blue-500/20 py-1 rounded bg-blue-500/5">Capture Summary</p>
        <p className="text-[17px] font-mono font-semibold text-[var(--text-color)] break-all mb-3 leading-tight">{metadata?.fileName ?? 'Waiting for capture...'}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
          {[
            ['Format', metadata?.format ?? 'PCAP/NG'],
            ['Total Size', metadata ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : '0.0 MB'],
            ['Total Packets', metadata ? metadata.totalPackets.toLocaleString() : '0'],
            ['Capture Duration', metadata?.duration ?? '00:00:00'],
          ].map(([label, val]) => (
            <div key={label} className="border-l-2 border-blue-500/30 pl-2">
              <p className="text-[12px] text-[var(--text-secondary)] uppercase font-bold tracking-tighter mb-0.5">{label}</p>
              <p className="text-[16px] font-black text-[var(--text-color)] font-mono">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Protocols & Encryption */}
      <div className="p-4 border-b border-[var(--border-color)] shrink-0">
        <button className="w-full flex items-center justify-between text-[16px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2"
          onClick={() => setProtoOpen(o => !o)}>
          <span>Protocols & Encryption</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${protoOpen ? 'rotate-90' : ''}`} />
        </button>
        {protoOpen && (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-[17px] mb-1">
                <span className="text-[var(--text-secondary)]">🔒 Encrypted</span>
                <span className="font-semibold text-green-500">67%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-color)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: '67%' }} />
              </div>
              <div className="flex justify-between text-[17px] mt-1">
                <span className="text-[var(--text-secondary)]">⚠️ Cleartext</span>
                <span className="font-semibold text-orange-400">33%</span>
              </div>
            </div>
            {[
              { name: 'HTTPS/TLS', pct: 52, color: 'blue-500' },
              { name: 'DNS', pct: 18, color: 'purple-600' },
              { name: 'HTTP', pct: 15, color: 'orange-400' },
              { name: 'SMB', pct: 8, color: 'amber-600' },
              { name: 'Other', pct: 7, color: 'gray-400' },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-2 py-0.5">
                <div className={`w-2 h-2 rounded-full shrink-0 bg-${p.color}`} />
                <span className="text-[16px] flex-1 text-[var(--text-color)]">{p.name}</span>
                <span className={`text-[17px] font-bold font-mono text-${p.color}`}>{p.pct}%</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Voice Network Health */}
      <div className="p-4 border-b border-[var(--border-color)] bg-green-500/[0.03] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[16px] font-bold uppercase tracking-widest text-green-600">Voice Network Health</p>
          <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-bold text-green-600">LIVE</span>
          </div>
        </div>
        <div className="flex items-end justify-between mb-3 px-1">
          <div>
            <p className="text-[24px] font-black text-[var(--text-color)] leading-none">4.2</p>
            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-1">Avg. MOS Score</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[16px] font-bold text-[var(--text-color)] leading-none">12</p>
            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-1">Active Calls</p>
          </div>
        </div>
        <div className="flex items-end gap-1 h-7 px-1">
           {[40, 60, 45, 80, 75, 90, 85, 70, 95, 80, 85, 90].map((h, i) => (
             <div key={i} className="flex-1 bg-green-500/20 rounded-t-[1px]" style={{ height: `${h}%` }} />
           ))}
        </div>
      </div>

      {/* Alerts / Insights Toggle */}
      <div className="flex border-b border-[var(--border-color)] shrink-0">
        {['alerts', 'insights'].map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`flex-1 py-2 text-[16px] font-semibold capitalize transition-colors ${section === s ? 'text-blue-500 border-b-2 border-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-color)]'}`}>
            {s === 'alerts' ? `Alerts${activeCount > 0 ? ` (${activeCount})` : ''}` : 'Insights'}
          </button>
        ))}
      </div>

      {/* Scrollable Feed */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scroll">
        {section === 'alerts' && ALERT_RULES.map(a => (
          <AlertCard key={a.id} alert={a} acked={ackedIds.has(a.id)} onAck={ack} onJump={onJumpTo} />
        ))}
        {section === 'insights' && INSIGHTS.map(ins => (
          <div key={ins.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] p-3">
            <div className="flex gap-2 items-start mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${priorityColors[ins.priority]}`}>{ins.priority}</span>
                </div>
                <p className="text-[16px] font-semibold text-[var(--text-color)] leading-snug">{ins.headline}</p>
                <p className="text-[17px] text-[var(--text-secondary)] mt-1 leading-relaxed">{ins.detail}</p>
              </div>
            </div>
            {ins.jumpTo && (
              <button onClick={() => onJumpTo?.(ins.jumpTo)} className="flex items-center gap-1 text-[17px] font-medium text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
                <ExternalLink className="w-3 h-3" /> Jump to →
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
