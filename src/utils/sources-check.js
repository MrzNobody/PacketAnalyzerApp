/**
 * sources-check.js
 * 
 * Knowledge source freshness tracking using localStorage timestamps.
 * 
 * WHY no live network requests:
 * External registries (IEEE OUI, IANA) block cross-origin HEAD requests from browsers (CORS).
 * Instead we track the last time the user confirmed sources, and prompt for a manual check
 * if it has been more than STALE_THRESHOLD_MS days. The user can trigger a manual app restart
 * or dismiss and continue with embedded fallback data.
 */

export const SOURCES = [
  {
    key: 'ieee-oui',
    name: 'IEEE OUI Registry',
    description: 'MAC vendor lookup database from IEEE Standards Association',
    url: 'https://standards-oui.ieee.org/oui/oui.txt',
    lastConfirmedKey: 'pa_oui_confirmed_at',
  },
  {
    key: 'iana-ports',
    name: 'IANA Service Names & Ports',
    description: 'Port-to-service name mapping from the Internet Assigned Numbers Authority',
    url: 'https://www.iana.org/assignments/service-names-port-numbers/',
    lastConfirmedKey: 'pa_iana_confirmed_at',
  },
];

// Prompt user to re-confirm after this many days
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Check all sources for staleness based on localStorage timestamps.
 * Returns { allCurrent: bool, staleItems: Source[] }
 */
export function runSourceIntegrityCheck() {
  const now = Date.now();
  const staleItems = SOURCES.filter(s => {
    const lastConfirmed = parseInt(localStorage.getItem(s.lastConfirmedKey) || '0', 10);
    return (now - lastConfirmed) > STALE_THRESHOLD_MS;
  });

  return {
    allCurrent: staleItems.length === 0,
    staleItems,
  };
}

/**
 * Stamp all sources as confirmed-current right now.
 */
export function confirmSourcesUpToDate(sources = SOURCES) {
  const now = String(Date.now());
  sources.forEach(s => localStorage.setItem(s.lastConfirmedKey, now));
}

/**
 * Get human-readable "last confirmed" string for a source key.
 */
export function getLastConfirmedLabel(sourceKey) {
  const source = SOURCES.find(s => s.key === sourceKey);
  if (!source) return 'Never';
  const ts = parseInt(localStorage.getItem(source.lastConfirmedKey) || '0', 10);
  if (!ts) return 'Never verified';
  const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

/**
 * Generate and trigger download of an error diagnostics .txt file.
 * Called when a user reports an issue and wants a log.
 */
export function downloadDiagnosticsLog(notes = '') {
  const lines = [
    'Packet Assistant — Source Diagnostics Log',
    '='.repeat(50),
    `Generated: ${new Date().toISOString()}`,
    '',
    'Knowledge Source Status:',
    '',
    ...SOURCES.map(s => {
      const confirmed = getLastConfirmedLabel(s.key);
      return `[${s.name}]\n  URL: ${s.url}\n  Last Confirmed: ${confirmed}`;
    }),
    '',
    notes ? `Notes:\n${notes}` : '',
    '',
    'Resolution:',
    '  • Registry data is bundled as fallback in this version of Packet Assistant.',
    '  • For the latest OUI data, visit: https://standards-oui.ieee.org/oui/oui.txt',
    '  • For the latest IANA data, visit: https://www.iana.org/assignments/service-names-port-numbers/',
    '',
    'Packet Assistant — All packet analysis is performed 100% locally on your device.',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `packet-assistant-diagnostics-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
