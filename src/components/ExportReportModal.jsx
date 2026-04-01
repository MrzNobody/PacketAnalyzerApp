import { useState } from 'react';
import { FileText, FileType2, X, Loader2, Share2 } from 'lucide-react';
import { exportReportPDF, exportReportDOCX } from '../utils/report-generator';

export default function ExportReportModal({ metadata, onClose }) {
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      if (format === 'pdf') await exportReportPDF(metadata);
      else await exportReportDOCX(metadata);
    } finally {
      setGenerating(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-[16px] font-bold text-[var(--text-color)]">Export Executive Report</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-color)] text-[var(--text-secondary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[17px] text-[var(--text-secondary)] mb-5">
            Select a format to generate a comprehensive report including insights, security alerts, NIST references, and capture metadata.
          </p>

          {/* Format Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { id: 'pdf', label: 'PDF Document', sub: 'Best for sharing & printing', Icon: FileText, color: 'text-red-400 bg-red-400/10 border-red-400/30' },
              { id: 'docx', label: 'Microsoft Word', sub: 'Best for editing & customizing', Icon: FileType2, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  format === f.id
                    ? f.color
                    : 'border-[var(--border-color)] hover:border-blue-500/40'
                }`}
              >
                <f.Icon className={`w-6 h-6 mb-2 ${format === f.id ? f.color.split(' ')[0] : 'text-[var(--text-secondary)]'}`} />
                <p className="text-[17px] font-semibold text-[var(--text-color)]">{f.label}</p>
                <p className="text-[17px] text-[var(--text-secondary)]">{f.sub}</p>
              </button>
            ))}
          </div>

          {/* Report contents preview */}
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-4 mb-5 text-[16px] text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-color)] mb-2">Report will include:</p>
            {['Cover page with capture metadata & timestamp', 'Executive summary from Actionable Insights feed', 'Full security alerts with NIST CSF references', 'Device discovery inventory appendix', 'DHCP rogue server status'].map(item => (
              <p key={item} className="flex items-center gap-2 py-0.5">
                <span className="text-blue-500">✓</span> {item}
              </p>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-color)] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              {generating ? 'Generating...' : `Export as ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
