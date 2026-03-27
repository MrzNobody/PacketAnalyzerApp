import { useEffect, useState } from 'react';
import { runSourceIntegrityCheck, confirmSourcesUpToDate, getLastConfirmedLabel, downloadDiagnosticsLog, SOURCES } from '../utils/sources-check';
import { CheckCircle2, RefreshCw, ArrowRight, Download, DatabaseZap } from 'lucide-react';

/**
 * SourcesIntegrityModal
 * 
 * Shown on startup when one or more knowledge sources (IEEE OUI, IANA ports)
 * have not been user-confirmed within the last 7 days.
 * 
 * Uses localStorage timestamps only — no live network requests (avoids CORS).
 */
export default function SourcesIntegrityModal({ onDismiss }) {
  // Synchronous compute instead of setState in effect
  const [state] = useState(() => {
    const result = runSourceIntegrityCheck();
    return result.allCurrent ? 'current' : { staleItems: result.staleItems };
  });

  useEffect(() => {
    if (state === 'current') {
      const t = setTimeout(() => onDismiss(), 1200);
      return () => clearTimeout(t);
    }
  }, [state, onDismiss]);

  const handleConfirmAndContinue = () => {
    confirmSourcesUpToDate();
    onDismiss();
  };

  const handleSkip = () => {
    onDismiss();
  };

  // Loading / checking state
  if (state === null) return null;

  // All sources are current — show brief success
  if (state === 'current') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-[var(--text-color)]">Knowledge sources are current</p>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1">Launching Packet Assistant...</p>
        </div>
      </div>
    );
  }

  // Stale sources — prompt user
  const { staleItems } = state;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border-color)]">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <DatabaseZap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[var(--text-color)]">Knowledge Sources Need Review</h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Some registry data hasn't been verified in over 7 days
            </p>
          </div>
        </div>

        {/* Source List */}
        <div className="px-6 py-4">
          <p className="text-[12px] text-[var(--text-secondary)] mb-3">
            Packet Assistant uses the following external registries for vendor and port lookups.
            These cannot be fetched live in the browser, but you can manually download updates from the links below.
          </p>

          <div className="flex flex-col gap-2 mb-4">
            {SOURCES.map(s => {
              const isStale = staleItems.some(si => si.key === s.key);
              const lastConfirmed = getLastConfirmedLabel(s.key);
              return (
                <div key={s.key} className={`rounded-xl border p-3.5 flex items-center gap-3 ${isStale ? 'border-orange-400/30 bg-orange-400/5' : 'border-[var(--border-color)]'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--text-color)]">{s.name}</span>
                      {isStale && <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full">Needs Verification</span>}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{s.description}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">Last confirmed: <span className="font-medium">{lastConfirmed}</span></p>
                  </div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-blue-500 hover:underline shrink-0 whitespace-nowrap"
                  >
                    View Source ↗
                  </a>
                </div>
              );
            })}
          </div>

          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-3 text-[12px] text-[var(--text-secondary)] mb-5">
            <strong className="text-[var(--text-color)]">No action is required.</strong> Packet Assistant includes embedded fallback data for both registries. Click "Confirm & Continue" to mark sources as reviewed, or "Skip" to proceed without confirming.
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => downloadDiagnosticsLog()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-color)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Diagnostics Log
            </button>
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-color)] transition-colors"
            >
              Skip for Now
            </button>
            <button
              onClick={handleConfirmAndContinue}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            >
              Confirm & Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
