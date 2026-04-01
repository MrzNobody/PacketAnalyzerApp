/* eslint-disable no-unused-vars */
import { useState, useCallback } from 'react';
import { useData } from '../context/DataContext';
import Sidebar from './Sidebar';

import TopTalkersPane from './TopTalkersPane';
import ConnectionFlowPane from './ConnectionFlowPane';
import DNSPane from './DNSPane';
import DHCPPane from './DHCPPane';
import DeviceDiscoveryPane from './DeviceDiscoveryPane';
import OUIInventoryPane from './OUIInventoryPane';
import ProtocolDistributionPane from './ProtocolDistributionPane';
import VoiceAnalyticsPane from './VoiceAnalyticsPane';
import TCPLadderDiagram from './TCPLadderDiagram';
import { LayoutGrid, PanelLeft, Activity } from 'lucide-react';

const PANE_CARD = 'bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[12px] overflow-hidden flex flex-col transition-shadow hover:shadow-md min-h-[500px]';

export default function Dashboard({ activeTab }) {
  const { session } = useData();
  const [layoutMode, setLayoutMode] = useState('sidebar');
  const [showLadder, setShowLadder] = useState(false);

  const handleJump = useCallback((paneKey) => {
    const el = document.getElementById(`pane-${paneKey}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  if (activeTab === 'voice') {
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        <VoiceAnalyticsPane />
      </div>
    );
  }

  // Grid panes — always 2-col (sidebar) or 3-col (grid), paired layout
  const gridPanes = [
    { key: 'talkers',   el: <TopTalkersPane /> },
    { key: 'dns',       el: <DNSPane /> },
    { key: 'dhcp',      el: <DHCPPane /> },
    { key: 'discovery', el: <DeviceDiscoveryPane /> },
    { key: 'oui',       el: <OUIInventoryPane /> },
    { key: 'protocols', el: <ProtocolDistributionPane /> },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {showLadder && <TCPLadderDiagram onClose={() => setShowLadder(false)} />}



      {/* Layout Toggle Bar */}
      <div className="flex items-center gap-3 px-5 py-2 border-b border-[var(--border-color)] bg-[var(--surface-color)] shrink-0">
        <span className="text-[17px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Layout:</span>
        <div className="flex gap-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-0.5">
          {[
            { mode: 'sidebar', Icon: PanelLeft, title: 'Sidebar Mode (Default)' },
            { mode: 'grid',    Icon: LayoutGrid, title: 'Classic 6-Pane Grid' },
          ].map(({ mode, Icon, title }) => (
            <button key={mode} onClick={() => setLayoutMode(mode)} title={title}
              className={`p-1.5 rounded-md transition-all ${layoutMode === mode ? 'bg-[var(--surface-color)] shadow-sm text-blue-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-color)]'}`}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* TCP Ladder Quick Launch */}
        <button
          onClick={() => setShowLadder(true)}
          className="ml-auto flex items-center gap-1.5 text-[16px] font-medium text-[var(--text-secondary)] hover:text-blue-500 border border-[var(--border-color)] px-3 py-1.5 rounded-lg hover:border-blue-500/40 transition-all"
        >
          <Activity className="w-3.5 h-3.5" />
          TCP Stream Ladder
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {layoutMode === 'sidebar' && <Sidebar metadata={session.metadata} onJumpTo={handleJump} />}

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          {/* ── Grid Panes ── */}
          <div className={`grid gap-4 ${layoutMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            {gridPanes.map(p => (
              <div key={p.key} id={`pane-${p.key}`} className={`${PANE_CARD} shadow-sm`}>
                {p.el}
              </div>
            ))}
          </div>

          {/* ── Connection Flows — full-width standalone pane ── */}
          <div id="pane-flows" className={`${PANE_CARD} shadow-sm w-full`}>
            <ConnectionFlowPane onOpenLadder={() => setShowLadder(true)} />
          </div>
        </div>
      </div>
    </div>
  );
}
