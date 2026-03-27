/**
 * TCP Stream Ladder Diagram
 * Interactive visual reconstruction of a TCP connection with SYN/ACK/FIN grouping,
 * TLS payload detection, and hover tooltips.
 */

const CLIENT = 'Client (192.168.1.42:54321)';
const SERVER = 'Server (1.1.1.1:443)';

const MOCK_STREAM = [
  { t: '0.000', from: 'client', flags: 'SYN', seq: 0, ack: null, size: 0, phase: 'handshake', info: 'Connection initiated' },
  { t: '0.022', from: 'server', flags: 'SYN-ACK', seq: 0, ack: 1, size: 0, phase: 'handshake', info: 'Server acknowledged' },
  { t: '0.023', from: 'client', flags: 'ACK', seq: 1, ack: 1, size: 0, phase: 'handshake', info: 'Handshake complete' },
  { t: '0.025', from: 'client', flags: 'PSH+ACK', seq: 1, ack: 1, size: 282, phase: 'tls', info: 'TLS Client Hello — TLSv1.3' },
  { t: '0.048', from: 'server', flags: 'PSH+ACK', seq: 1, ack: 283, size: 1340, phase: 'tls', info: 'TLS Server Hello + Certificate' },
  { t: '0.049', from: 'client', flags: 'ACK', seq: 283, ack: 1341, size: 0, phase: 'tls', info: 'ACK Server Hello' },
  { t: '0.051', from: 'client', flags: 'PSH+ACK', seq: 283, ack: 1341, size: 126, phase: 'tls', info: 'TLS Finished' },
  { t: '0.081', from: 'server', flags: 'PSH+ACK', seq: 1341, ack: 409, size: 51, phase: 'tls', info: 'TLS Finished' },
  { t: '0.082', from: 'client', flags: 'PSH+ACK', seq: 409, ack: 1392, size: 89, phase: 'data', info: '⚿ Encrypted Payload (HTTP/2 HEADERS)' },
  { t: '0.120', from: 'server', flags: 'PSH+ACK', seq: 1392, ack: 498, size: 4096, phase: 'data', info: '⚿ Encrypted Payload (HTTP/2 DATA)' },
  { t: '0.121', from: 'client', flags: 'ACK', seq: 498, ack: 5488, size: 0, phase: 'data', info: 'ACK large response' },
  { t: '0.200', from: 'client', flags: 'FIN+ACK', seq: 498, ack: 5488, size: 0, phase: 'close', info: 'Client closing connection' },
  { t: '0.221', from: 'server', flags: 'FIN+ACK', seq: 5488, ack: 499, size: 0, phase: 'close', info: 'Server confirmed close' },
  { t: '0.222', from: 'client', flags: 'ACK', seq: 499, ack: 5489, size: 0, phase: 'close', info: 'Connection terminated' },
];

const phaseColors = {
  handshake: 'bg-blue-500/10',
  tls: 'bg-purple-500/10',
  data: 'bg-green-500/10',
  close: 'bg-gray-400/10',
};

const flagColors = {
  'SYN': 'text-blue-400',
  'SYN-ACK': 'text-blue-400',
  'ACK': 'text-gray-400',
  'PSH+ACK': 'text-green-400',
  'FIN+ACK': 'text-red-400',
};

import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { exportCSV } from '../utils/export-utils';

export default function TCPLadderDiagram({ onClose }) {
  const [hovered, setHovered] = useState(null);

  const handleCsvExport = () => {
    exportCSV(MOCK_STREAM.map(p => ({
      Time: p.t, Direction: p.from, Flags: p.flags, Seq: p.seq, Ack: p.ack ?? '', Bytes: p.size, Info: p.info
    })), 'tcp-stream-ladder.csv');
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] shrink-0">
          <div>
            <h3 className="text-[16px] font-bold text-[var(--text-color)]">TCP Stream Ladder Diagram</h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{CLIENT} → {SERVER}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCsvExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] text-[var(--text-secondary)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-color)] text-[var(--text-secondary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phase Legend */}
        <div className="flex items-center gap-4 px-6 py-2 border-b border-[var(--border-color)] shrink-0">
          {[
            { label: 'TCP Handshake', color: 'bg-blue-500' },
            { label: 'TLS Negotiation', color: 'bg-purple-500' },
            { label: 'Encrypted Data', color: 'bg-green-500' },
            { label: 'Connection Close', color: 'bg-gray-400' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
              <span className="text-[11px] text-[var(--text-secondary)]">{p.label}</span>
            </div>
          ))}
        </div>

        {/* Ladder Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scroll">
          {/* Column Headers — fixed at top */}
          <div className="sticky top-0 grid grid-cols-[64px_1fr_1fr] gap-0 mb-2 bg-[var(--surface-color)] z-10">
            <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Time</div>
            <div className="text-[11px] font-bold text-blue-400 truncate text-center">{CLIENT}</div>
            <div className="text-[11px] font-bold text-green-400 truncate text-center">{SERVER}</div>
          </div>

          <div className="flex flex-col gap-0">
            {MOCK_STREAM.map((pkt, i) => {
              const isClient = pkt.from === 'client';
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[64px_1fr_1fr] gap-0 py-1.5 px-1 rounded-lg transition-colors cursor-pointer relative ${phaseColors[pkt.phase]} ${hovered === i ? 'ring-1 ring-blue-500/30' : ''}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Timestamp */}
                  <div className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center">{pkt.t}s</div>

                  {/* Client side */}
                  <div className="flex items-center justify-center relative">
                    {isClient && (
                      <div className="flex items-center gap-2 w-full justify-end pr-4">
                        <span className={`text-[11px] font-bold ${flagColors[pkt.flags] ?? 'text-[var(--text-secondary)]'}`}>{pkt.flags}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] max-w-[120px] truncate">{pkt.size > 0 ? `${pkt.size}B` : ''}</span>
                        {/* Arrow right */}
                        <div className="flex items-center">
                          <div className="h-px w-8 bg-blue-400"></div>
                          <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-blue-400"></div>
                        </div>
                      </div>
                    )}
                    {!isClient && (
                      <div className="flex items-center gap-2 w-full justify-start pl-4">
                        {/* Arrow left */}
                        <div className="flex items-center">
                          <div className="w-0 h-0 border-y-[4px] border-y-transparent border-r-[6px] border-r-green-400"></div>
                          <div className="h-px w-8 bg-green-400"></div>
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)]">{pkt.size > 0 ? `${pkt.size}B` : ''}</span>
                        <span className={`text-[11px] font-bold ${flagColors[pkt.flags] ?? 'text-[var(--text-secondary)]'}`}>{pkt.flags}</span>
                      </div>
                    )}
                  </div>

                  {/* Server side */}
                  <div className="flex items-center pl-4">
                    {hovered === i && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[11px] text-[var(--text-color)] shadow-xl z-20 whitespace-nowrap">
                        <span className="font-semibold">{pkt.info}</span>
                        <span className="text-[var(--text-secondary)] ml-2">· Seq {pkt.seq}{pkt.ack !== null ? ` · Ack ${pkt.ack}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
