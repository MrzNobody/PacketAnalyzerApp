import { useState, useMemo, useRef } from 'react';
import { Phone, Activity, Search, History, ArrowRight, Gauge, BookUser } from 'lucide-react';
import { useData } from '../context/DataContext';

const MOCK_SIP_LADDER_SUCCESS = [
  { id: 1, dir: 'right', label: 'INVITE sip:+15615550199@pbp.corp.local SIP/2.0', source: 'Internal', dest: 'Gateway' },
  { id: 2, dir: 'left',  label: 'SIP/2.0 100 Trying', source: 'Gateway', dest: 'Internal' },
  { id: 3, dir: 'left',  label: 'SIP/2.0 180 Ringing', source: 'Gateway', dest: 'Internal' },
  { id: 4, dir: 'left',  label: 'SIP/2.0 200 OK (SDP)', source: 'Gateway', dest: 'Internal' },
  { id: 5, dir: 'right', label: 'ACK sip:+15615550199@pbp.corp.local SIP/2.0', source: 'Internal', dest: 'Gateway' },
  { id: 6, dir: 'bidir', label: 'RTP / RTCP Media Stream (G.711u)', source: 'Internal', dest: 'Gateway' },
  { id: 7, dir: 'right', label: 'BYE sip:+15615550199@pbp.corp.local SIP/2.0', source: 'Internal', dest: 'Gateway' },
  { id: 8, dir: 'left',  label: 'SIP/2.0 200 OK', source: 'Gateway', dest: 'Internal' },
];

const MOCK_SIP_LADDER_FAILED = [
  { id: 1, dir: 'right', label: 'INVITE sip:+15615550199@pbp.corp.local SIP/2.0', source: 'Internal', dest: 'Gateway' },
  { id: 2, dir: 'left',  label: 'SIP/2.0 100 Trying', source: 'Gateway', dest: 'Internal' },
  { id: 3, dir: 'left',  label: 'SIP/2.0 403 Forbidden', source: 'Gateway', dest: 'Internal' },
  { id: 4, dir: 'right', label: 'ACK sip:+15615550199@pbp.corp.local SIP/2.0', source: 'Internal', dest: 'Gateway' },
];

const MOCK_CALL_RECORDS = [
  { 
    id: 'C1', time: '10:23:45', caller: '+15615550101', callee: '+15615550199', status: 'Completed', duration: '14m 02s', jitter: '2.1ms', mos: 4.4,
    insight: null, userAgent: 'PolycomVVX-VVX410-UA/5.9.5.0614'
  },
  { 
    id: 'C2', time: '10:28:12', caller: '+15615550105', callee: '+15615550199', status: 'Busy', duration: '0s', jitter: '-', mos: '-',
    insight: { reason: 'User is currently on another call (SIP 486 Busy Here).', action: 'No action needed. Target device is functioning normally.' }, 
    userAgent: 'Cisco-CP8841/12.5.1'
  },
  { 
    id: 'C3', time: '10:45:30', caller: '+15615550101', callee: '+18005550123', status: 'Completed', duration: '03m 45s', jitter: '8.4ms', mos: 3.2,
    insight: { reason: 'Network congestion detected on outbound gateway.', action: 'Investigate jitter buffer settings on trunk interface (+15615550100).' },
    userAgent: 'PolycomVVX-VVX410-UA/5.9.5.0614'
  },
  { 
    id: 'C4', time: '11:02:15', caller: '+15615550112', callee: '+15615550101', status: 'Forbidden', duration: '0s', jitter: '-', mos: '-',
    insight: { reason: 'SIP Authentication credentials mismatched (Digest Auth failure).', action: 'Verify SIP password on handset (+15615550112) and PBX configuration.' },
    userAgent: 'Zoiper rv2.10.11.7-mod'
  },
  { 
    id: 'C5', time: '11:15:00', caller: '+15615550101', callee: '+15615550100', status: 'Completed', duration: '22m 10s', jitter: '1.4ms', mos: 4.8,
    insight: null, userAgent: 'Cisco-CP8861/14.0.1'
  },
  { 
    id: 'C6', time: '11:32:40', caller: '+18885550999', callee: '+15615550101', status: 'Not Found', duration: '0s', jitter: '-', mos: '-',
    insight: { reason: 'Dialed extension does not exist on the local registrar (SIP 404).', action: 'Check dial plan configuration on the Core PBX.' },
    userAgent: 'SBC-Gateway-Internal'
  },
  { 
    id: 'C7', time: '11:45:12', caller: '+15615550105', callee: '+19005550111', status: 'Service Unavailable', duration: '0s', jitter: '-', mos: '-',
    insight: { reason: 'Outbound trunk carrier rejected the call due to credit limit (SIP 503).', action: 'Verify account balance with SIP Provider (Level3/Lumen).' },
    userAgent: 'Cisco-CP8841/12.5.1'
  },
  { 
    id: 'C8', time: '12:01:05', caller: '+15615550112', callee: '+15615550199', status: 'Timeout', duration: '32s', jitter: '-', mos: '-',
    insight: { reason: 'No response from destination gateway (SIP 408 Request Timeout).', action: 'Check connectivity to peer trunk (+18885550000).' },
    userAgent: 'Zoiper rv2.10.11.7-mod'
  },
  { 
    id: 'C9', time: '12:05:40', caller: '+15615550112', callee: '+15615550199', status: 'Timeout', duration: '0s', jitter: '-', mos: '-',
    insight: { reason: 'No response from destination gateway (SIP 408 Request Timeout).', action: 'Check connectivity to peer trunk (+18885550000).' },
    userAgent: 'Zoiper rv2.10.11.7-mod'
  },
];

const MOCK_SIP_METHODS = [
  { method: 'INVITE',   count: 42, color: 'bg-blue-500' },
  { method: 'BYE',      count: 38, color: 'bg-green-500' },
  { method: 'REGISTER', count: 12, color: 'bg-orange-500' },
  { method: 'OPTIONS',  count: 6,  color: 'bg-purple-500' },
  { method: 'CANCEL',   count: 2,  color: 'bg-slate-400' },
];

export default function VoiceAnalyticsPane() {
  const [searchQuery,    setSearchQuery]    = useState('');
  const [selectedCallId, setSelectedCallId] = useState('C1');

  const ladderRef = useRef(null);
  const { globalSearch, session } = useData();

  // Consume pre-aggregated data from worker — no main-thread computation
  const callRecords = useMemo(() =>
    (session.isActive && session.aggregations?.callRecords) ? session.aggregations.callRecords : MOCK_CALL_RECORDS
  , [session.aggregations, session.isActive]);

  const sipMethodDistribution = useMemo(() =>
    (session.isActive && session.aggregations?.sipMethods) ? session.aggregations.sipMethods : MOCK_SIP_METHODS
  , [session.aggregations, session.isActive]);

  const groupedFailedCalls = useMemo(() => {
    const groups = {};
    callRecords.filter(c => c.status !== 'Completed').forEach(call => {
      const key = `${call.caller}-${call.callee}`;
      if (!groups[key]) {
        groups[key] = { ...call, attempts: 1 };
      } else {
        groups[key].attempts += 1;
        // Keep the latest call data for status/time
        groups[key].time = call.time;
        groups[key].status = call.status;
        groups[key].id = call.id;
      }
    });
    return Object.values(groups);
  }, [callRecords]);

  const filteredCalls = useMemo(() => {
    return callRecords.filter(c =>
      c.caller.includes(searchQuery) || c.callee.includes(searchQuery) || c.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [callRecords, searchQuery]);

  const activeCall = useMemo(() => callRecords.find(c => c.id === selectedCallId), [callRecords, selectedCallId]);

  const handleViewLadder = (callId) => {
    setSelectedCallId(callId);
    // Scroll ladder into view
    setTimeout(() => {
      ladderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const getMosColor = (mos) => {
    if (mos === '-') return 'text-[var(--text-secondary)]';
    if (mos >= 4.0) return 'text-green-500';
    if (mos >= 3.0) return 'text-orange-500';
    return 'text-red-500';
  };

  const totalMethods = sipMethodDistribution.reduce((acc, m) => acc + m.count, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-color)]">
      {/* Header */}
      <div className="p-5 shrink-0 border-b border-[var(--border-color)] bg-[var(--surface-color)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[var(--text-color)]">Voice &amp; SIP Analytics</h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Automated MOS Quality analysis and SIP signaling inspection</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-color)] transition-colors">
            Export Voice CAP
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-5 space-y-6 custom-scroll">

        {/* ── 1. SIP Method Distribution ── */}
        <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">SIP Method Distribution</span>
            <span className="text-[10px] text-blue-500 font-bold">{totalMethods} Packets</span>
          </div>
          <div className="h-2 w-full bg-[var(--bg-color)] rounded-full overflow-hidden flex mb-3">
            {sipMethodDistribution.map((m) => (
              <div
                key={m.method}
                className={`${m.color} h-full transition-all`}
                style={{ width: `${(m.count / totalMethods) * 100}%` }}
                title={`${m.method}: ${m.count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {sipMethodDistribution.map((m) => (
              <div key={m.method} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${m.color}`} />
                <span className="text-[10px] font-medium text-[var(--text-secondary)]">{m.method}</span>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-60">{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. SIP Signaling Ladder + Call Directory ── */}
        <div ref={ladderRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-4">
          {/* Signaling Ladder (Left 2 Columns) */}
          <div className="lg:col-span-2 bg-[var(--surface-color)] rounded-[16px] border border-[var(--border-color)] flex flex-col shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-color)]/30">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-[13px] text-[var(--text-color)]">
                  SIP Signaling Ladder — Session {selectedCallId}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end text-[10px] text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-color)] uppercase tracking-tighter">User-Agent</span>
                  <span className="font-mono">{activeCall?.userAgent}</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-color)] border border-[var(--border-color)] px-2 py-0.5 rounded-md">
                  {activeCall?.status === 'Completed' ? 'Flow: RTP G.711u' : 'Flow: Control Only'}
                </span>
              </div>
            </div>

            <div className="p-8 relative min-h-[360px]">
              <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)] mb-10 px-12 uppercase tracking-widest">
                <div className="flex flex-col items-center">
                  <span>{activeCall?.caller}</span>
                  <span className="text-[9px] mt-1 text-blue-400 font-medium whitespace-nowrap">Caller ID / Origin</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>{activeCall?.callee}</span>
                  <span className="text-[9px] mt-1 text-purple-400 font-medium whitespace-nowrap">Dialed Number / Callee</span>
                </div>
              </div>

              <div className="absolute top-20 bottom-8 left-[6.5rem] w-0.5 bg-[var(--border-color)] opacity-60 z-0" />
              <div className="absolute top-20 bottom-8 right-[6.5rem] w-0.5 bg-[var(--border-color)] opacity-60 z-0" />

              <div className="flex flex-col gap-8 relative z-10 px-12 pb-4">
                {(activeCall?.status === 'Completed' ? MOCK_SIP_LADDER_SUCCESS : MOCK_SIP_LADDER_FAILED).map(step => (
                  <div key={step.id} className="relative w-full h-6 flex items-center justify-center">
                    {step.dir === 'right' && (
                      <div className="absolute left-0 w-[100%] h-0.5 bg-blue-500/80 flex items-center">
                        <div 
                          className="absolute right-0 w-3 h-4 bg-blue-600" 
                          style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
                        />
                        <span className="absolute w-full -top-6 text-center text-[13px] font-bold text-[var(--text-color)]">{step.label}</span>
                      </div>
                    )}
                    {step.dir === 'left' && (
                      <div className="absolute right-0 w-[100%] h-0.5 bg-purple-500/80 flex items-center">
                        <div 
                          className="absolute left-0 w-3 h-4 bg-purple-600" 
                          style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}
                        />
                        <span className="absolute w-full -top-6 text-center text-[13px] font-bold text-[var(--text-secondary)]">{step.label}</span>
                      </div>
                    )}
                    {step.dir === 'bidir' && (
                      <div className="absolute left-0 w-[100%] h-3 bg-green-500/20 border-y border-dashed border-green-500/50 flex items-center justify-center">
                        <span className="absolute -top-5 text-center text-[13px] font-black text-green-500">{step.label}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call Directory (Right Column) */}
          <div className="flex flex-col">
            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[16px] shadow-sm flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex items-center gap-2 shrink-0">
                <BookUser className="w-4 h-4 text-red-500" />
                <h3 className="text-[13px] font-semibold text-[var(--text-color)]">Failed SIP Sessions</h3>
                <span className="ml-auto text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-color)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-md">
                  {groupedFailedCalls.length} issues
                </span>
              </div>

              {/* Entry list */}
              <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)] custom-scroll">
                {groupedFailedCalls.map((call) => (
                  <button
                    key={call.id}
                    onClick={() => handleViewLadder(call.id)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-[var(--bg-color)]/60 ${
                      selectedCallId === call.id ? 'bg-red-500/8 border-l-2 border-red-500' : 'border-l-2 border-transparent'
                    }`}
                  >
                    {/* From: → To: */}
                    <div className="flex flex-col gap-1 mb-2 relative">
                      {call.attempts > 1 && (
                        <div className="absolute top-0 right-0 bg-red-500/15 border border-red-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-red-500">
                          {call.attempts} attempts
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-red-500/60 uppercase w-8">From:</span>
                        <span className="text-[13px] font-bold font-mono text-[var(--text-color)] truncate pr-16">{call.caller}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-red-500/60 uppercase w-8">To:</span>
                        <span className="text-[13px] font-bold font-mono text-[var(--text-color)] truncate pr-16">{call.callee}</span>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        call.status === 'Busy' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {call.status}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono ml-auto">{call.time}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-color)]/20 shrink-0">
                <p className="text-[10px] text-[var(--text-secondary)] text-center">
                  Click any entry to load its SIP ladder
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Call History Analyzer (bottom) ── */}
        <div className="bg-[var(--surface-color)] rounded-[16px] border border-[var(--border-color)] overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-color)]/30">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold text-[13px] text-[var(--text-color)]">Call History Analyzer</h3>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-color)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-md">
                {filteredCalls.length} sessions
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search numbers or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg text-[12px] w-52 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                  <th className="px-5 py-2.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Start Time</th>
                  <th className="px-5 py-2.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Caller ID</th>
                  <th className="px-5 py-2.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dialed Number</th>
                  <th className="px-5 py-2.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-2.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">MOS Score</th>
                  <th className="px-5 py-2.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">Avg. Jitter</th>
                  <th className="px-5 py-2.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">SIP Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredCalls.map((call) => (
                  <tr
                    key={call.id}
                    className={`group transition-colors ${selectedCallId === call.id ? 'bg-blue-500/5' : 'hover:bg-[var(--bg-color)]/40'}`}
                  >
                    <td className="px-5 py-3 text-[12px] font-medium text-[var(--text-secondary)]">{call.time}</td>
                    <td className="px-5 py-3 text-[13px] font-bold text-[var(--text-color)]">{call.caller}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500/50" />
                        <span className="text-[13px] font-bold text-[var(--text-color)]">{call.callee}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12px]">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        call.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                        call.status === 'Missed' || call.status === 'Forbidden' ? 'bg-red-500/10 text-red-600' : 'bg-orange-500/10 text-orange-600'
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className={`flex items-center gap-1.5 text-[13px] font-black ${getMosColor(call.mos)}`}>
                        <Gauge className="w-3.5 h-3.5" />
                        {call.mos}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-[var(--text-secondary)] font-mono">{call.jitter}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleViewLadder(call.id)}
                        title={`View SIP flow for session ${call.id}`}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          selectedCallId === call.id
                            ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-500/50 hover:text-blue-500 hover:bg-blue-500/5'
                        }`}
                      >
                        <Activity className="w-3 h-3" />
                        {selectedCallId === call.id ? 'Viewing' : 'View Flow'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
