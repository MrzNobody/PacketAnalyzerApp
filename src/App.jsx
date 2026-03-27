import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SourcesIntegrityModal from './components/SourcesIntegrityModal';
import ExportReportModal from './components/ExportReportModal';

function UploadGateway() {
  const { loadCapture } = useData();
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    const file = e.dataTransfer.files[0];
    if (file) loadCapture(file);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl mb-5">
            <UploadCloud className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-[32px] font-bold tracking-tight text-[var(--text-color)] mb-2">
            Deep packet analysis, simplified.
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)]">
            Upload a packet capture file. All processing is 100% local — nothing leaves your device.
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-[20px] p-14 text-center transition-all duration-300 ${
            isHovering
              ? 'border-blue-500 bg-blue-500/5 scale-[1.015]'
              : 'border-[var(--border-color)] bg-[var(--surface-color)] hover:border-gray-400'
          }`}
          onDragEnter={() => setIsHovering(true)}
          onDragLeave={() => setIsHovering(false)}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <h3 className="text-[19px] font-semibold text-[var(--text-color)] mb-2">Drag & Drop your capture file</h3>
          <p className="text-[13px] text-[var(--text-secondary)] mb-6">
            .pcap · .pcapng · .log · .enc · .txt — max 500 MB — single file only
          </p>
          <input
            type="file" ref={fileInputRef} className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) loadCapture(f); }}
            accept=".pcap,.pcapng,.log,.enc,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            Browse Files
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5">
          {['.pcap', '.pcapng', '.log', '.enc', '.txt'].map(ext => (
            <span key={ext} className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-color)] border border-[var(--border-color)] px-2 py-0.5 rounded-md">{ext}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ParsingOverlay() {
  const { session } = useData();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
      <h3 className="text-[22px] font-semibold text-[var(--text-color)] mb-2">Parsing Packet Capture...</h3>
      <p className="text-[14px] text-[var(--text-secondary)] mb-6 max-w-sm">{session.loading.message}</p>
      <div className="w-72 h-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${session.loading.percent}%` }} />
      </div>
      <p className="mt-2 text-[12px] text-[var(--text-secondary)] font-mono">{session.loading.percent}%</p>
    </div>
  );
}

function AppContent() {
  const { session } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSourcesModal, setShowSourcesModal] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  const isParsing = session.loading.status === 'parsing';
  const isDashboard = session.isActive;

  const handleSaveState = () => {
    const state = {
      version: '1.0',
      generated: new Date().toISOString(),
      metadata: session.metadata,
      activeTab,
      filters: {},
      acknowledgedAlerts: [],
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.metadata?.fileName ?? 'session'}_state.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col">
      {showSourcesModal && <SourcesIntegrityModal onDismiss={() => setShowSourcesModal(false)} />}
      {showExportModal && <ExportReportModal metadata={session.metadata} onClose={() => setShowExportModal(false)} />}

      <Header
        showTabs={isDashboard}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExport={() => setShowExportModal(true)}
        onSave={handleSaveState}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {!isDashboard && !isParsing && <UploadGateway />}
        {isParsing && <ParsingOverlay />}
        {isDashboard && <Dashboard activeTab={activeTab} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
