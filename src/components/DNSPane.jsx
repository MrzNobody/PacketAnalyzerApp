import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, XCircle, CheckCircle2, Search as SearchIcon, AlertTriangle, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';

// ── Category taxonomy ─────────────────────────────────────────────────────────
const DOMAIN_CATEGORIES = {
  // Search
  'google.com':        { cat: 'Search',     emoji: '🔍', risk: 'low'  },
  'bing.com':          { cat: 'Search',     emoji: '🔍', risk: 'low'  },
  'duckduckgo.com':    { cat: 'Search',     emoji: '🔍', risk: 'low'  },

  // Social
  'facebook.com':      { cat: 'Social',     emoji: '💬', risk: 'low'  },
  'instagram.com':     { cat: 'Social',     emoji: '📷', risk: 'low'  },
  'twitter.com':       { cat: 'Social',     emoji: '🐦', risk: 'low'  },
  'x.com':             { cat: 'Social',     emoji: '🐦', risk: 'low'  },
  'linkedin.com':      { cat: 'Social',     emoji: '💼', risk: 'low'  },
  'reddit.com':        { cat: 'Social',     emoji: '📰', risk: 'low'  },

  // Streaming
  'netflix.com':       { cat: 'Streaming',  emoji: '🎬', risk: 'low'  },
  'youtube.com':       { cat: 'Streaming',  emoji: '▶️',  risk: 'low'  },
  'googlevideo.com':   { cat: 'Streaming',  emoji: '▶️',  risk: 'low'  },
  'twitch.tv':         { cat: 'Streaming',  emoji: '🎮', risk: 'low'  },
  'spotify.com':       { cat: 'Streaming',  emoji: '🎵', risk: 'low'  },
  'disneyplus.com':    { cat: 'Streaming',  emoji: '🎬', risk: 'low'  },
  'hulu.com':          { cat: 'Streaming',  emoji: '🎬', risk: 'low'  },

  // Cloud / CDN
  'googleapis.com':    { cat: 'CDN / Cloud',emoji: '☁️', risk: 'low'  },
  'cloudflare.com':    { cat: 'CDN',        emoji: '🌐', risk: 'low'  },
  'akamai.net':        { cat: 'CDN',        emoji: '🌐', risk: 'low'  },
  'fastly.net':        { cat: 'CDN',        emoji: '🌐', risk: 'low'  },
  'amazonaws.com':     { cat: 'Cloud',      emoji: '☁️', risk: 'low'  },
  'azure.com':         { cat: 'Cloud',      emoji: '☁️', risk: 'low'  },

  // Enterprise / Work
  'microsoft.com':     { cat: 'Enterprise', emoji: '💼', risk: 'low'  },
  'office.com':        { cat: 'Enterprise', emoji: '📋', risk: 'low'  },
  'teams.microsoft.com':{ cat: 'Comms',    emoji: '📡', risk: 'low'  },
  'zoom.us':           { cat: 'Comms',      emoji: '📡', risk: 'low'  },
  'slack.com':         { cat: 'Comms',      emoji: '📡', risk: 'low'  },
  'github.com':        { cat: 'Dev Tools',  emoji: '⚙️', risk: 'low'  },

  // Updates / System
  'windowsupdate.com': { cat: 'OS Update',  emoji: '🔄', risk: 'low'  },
  'apple.com':         { cat: 'Vendor',     emoji: '🍎', risk: 'low'  },
  'mozilla.com':       { cat: 'Vendor',     emoji: '🦊', risk: 'low'  },

  // Suspicious / High-risk
  'pastebin.com':      { cat: 'Suspicious', emoji: '⚠️', risk: 'high' },
  'ngrok.io':          { cat: 'Tunnel',     emoji: '🚇', risk: 'high' },
  'dyn.com':           { cat: 'DDNS',       emoji: '⚠️', risk: 'medium'},
  'no-ip.com':         { cat: 'DDNS',       emoji: '⚠️', risk: 'medium'},
};

// ── Rich mock DNS records ─────────────────────────────────────────────────────
const MOCK_DNS = [
  {
    id: 1,  fqdn: 'www.youtube.com',
    queries: 289, nxdomain: false,
    clients: ['192.168.1.42', '192.168.1.15', '192.168.1.78'],
    resolvedIps: ['142.250.80.142', '142.250.80.174'],
    firstSeen: '10:02:11', lastSeen: '15:48:33',
  },
  {
    id: 2,  fqdn: 'googlevideo.com',
    queries: 214, nxdomain: false,
    clients: ['192.168.1.42', '192.168.1.15'],
    resolvedIps: ['172.217.14.78'],
    firstSeen: '10:02:15', lastSeen: '15:48:50',
  },
  {
    id: 3,  fqdn: 'teams.microsoft.com',
    queries: 198, nxdomain: false,
    clients: ['192.168.1.101', '10.0.0.12', '192.168.1.55'],
    resolvedIps: ['52.113.194.132', '40.126.31.135'],
    firstSeen: '08:45:00', lastSeen: '16:01:22',
  },
  {
    id: 4,  fqdn: 'api.openai.com',
    queries: 154, nxdomain: false,
    clients: ['192.168.1.42', '10.0.0.5'],
    resolvedIps: ['104.18.7.192'],
    firstSeen: '09:12:44', lastSeen: '15:59:01',
  },
  {
    id: 5,  fqdn: 'netflix.com',
    queries: 142, nxdomain: false,
    clients: ['192.168.1.200', '192.168.1.78'],
    resolvedIps: ['54.74.51.123', '18.185.63.180'],
    firstSeen: '12:30:05', lastSeen: '15:45:10',
  },
  {
    id: 6,  fqdn: 'google.com',
    queries: 138, nxdomain: false,
    clients: ['192.168.1.42', '192.168.1.15', '10.0.0.1'],
    resolvedIps: ['142.250.80.14', '142.250.80.46'],
    firstSeen: '08:01:00', lastSeen: '16:02:00',
  },
  {
    id: 7,  fqdn: 's3.amazonaws.com',
    queries: 112, nxdomain: false,
    clients: ['192.168.1.42', '10.0.0.5'],
    resolvedIps: ['52.216.109.179'],
    firstSeen: '09:30:00', lastSeen: '15:50:00',
  },
  {
    id: 8,  fqdn: 'zoom.us',
    queries: 96,  nxdomain: false,
    clients: ['10.0.0.12', '192.168.1.55'],
    resolvedIps: ['170.114.4.1', '170.114.5.1'],
    firstSeen: '10:00:00', lastSeen: '14:00:00',
  },
  {
    id: 9,  fqdn: 'github.com',
    queries: 88,  nxdomain: false,
    clients: ['10.0.0.5', '192.168.1.42'],
    resolvedIps: ['140.82.114.4'],
    firstSeen: '08:55:00', lastSeen: '15:40:00',
  },
  {
    id: 10, fqdn: 'spotify.com',
    queries: 77,  nxdomain: false,
    clients: ['192.168.1.15', '192.168.1.78'],
    resolvedIps: ['35.186.224.47'],
    firstSeen: '11:00:00', lastSeen: '16:00:00',
  },
  {
    id: 11, fqdn: 'slack.com',
    queries: 71,  nxdomain: false,
    clients: ['192.168.1.101', '10.0.0.12'],
    resolvedIps: ['54.192.10.222'],
    firstSeen: '09:05:00', lastSeen: '15:55:00',
  },
  {
    id: 12, fqdn: 'reddit.com',
    queries: 64,  nxdomain: false,
    clients: ['192.168.1.42', '192.168.1.15'],
    resolvedIps: ['151.101.65.140'],
    firstSeen: '13:00:00', lastSeen: '15:30:00',
  },
  {
    id: 13, fqdn: 'windowsupdate.com',
    queries: 38,  nxdomain: false,
    clients: ['192.168.1.101'],
    resolvedIps: ['20.54.232.160'],
    firstSeen: '08:00:00', lastSeen: '08:30:00',
  },
  {
    id: 14, fqdn: 'pastebin.com',
    queries: 21,  nxdomain: false,
    clients: ['192.168.1.200'],
    resolvedIps: ['104.20.66.46'],
    firstSeen: '14:20:00', lastSeen: '14:55:00',
  },
  {
    id: 15, fqdn: 'abc123.ngrok.io',
    queries: 12,  nxdomain: false,
    clients: ['192.168.1.200'],
    resolvedIps: ['18.184.104.130'],
    firstSeen: '15:01:00', lastSeen: '15:45:00',
  },
  {
    id: 16, fqdn: 'badsite.xyz',
    queries: 7,   nxdomain: true,
    clients: ['192.168.1.200'],
    resolvedIps: [],
    firstSeen: '15:10:00', lastSeen: '15:10:44',
  },
  {
    id: 17, fqdn: 'internal.corp.local',
    queries: 22,  nxdomain: true,
    clients: ['10.0.0.1'],
    resolvedIps: [],
    firstSeen: '08:00:00', lastSeen: '16:00:00',
  },
];

function categorize(fqdn) {
  const entry = Object.entries(DOMAIN_CATEGORIES).find(([k]) => fqdn.includes(k));
  return entry ? entry[1] : null;
}

const RISK_STYLES = {
  high:   'text-red-400 bg-red-400/10 border-red-400/30',
  medium: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  low:    '',
};

export default function DNSPane() {
  const [expanded,  setExpanded]  = useState(null);
  const [filter,    setFilter]    = useState('');
  const [sortBy,    setSortBy]    = useState('queries'); // 'queries' | 'alpha' | 'risk'

  const { globalSearch, session } = useData();
  const gs = (globalSearch || '').toLowerCase();
  const lf = (filter || '').toLowerCase();

  const dns = useMemo(() => {
    const raw = (session.isActive && session.aggregations?.dnsRecords)
      ? session.aggregations.dnsRecords
      : MOCK_DNS;

    const filtered = raw.filter(d => {
      const hay = `${d.fqdn} ${d.clients.join(' ')} ${d.resolvedIps.join(' ')}`.toLowerCase();
      return (!gs || hay.includes(gs)) && (!lf || d.fqdn.toLowerCase().includes(lf));
    });

    if (sortBy === 'queries') return [...filtered].sort((a, b) => b.queries - a.queries);
    if (sortBy === 'alpha')   return [...filtered].sort((a, b) => a.fqdn.localeCompare(b.fqdn));
    if (sortBy === 'risk') {
      const order = { high: 0, medium: 1, low: 2, none: 3 };
      return [...filtered].sort((a, b) => {
        const ra = categorize(a.fqdn)?.risk ?? 'none';
        const rb = categorize(b.fqdn)?.risk ?? 'none';
        return (order[ra] ?? 3) - (order[rb] ?? 3);
      });
    }
    return filtered;
  }, [session.aggregations, session.isActive, gs, lf, sortBy]);

  const totalQueries = dns.reduce((s, d) => s + d.queries, 0);
  const nxCount      = dns.filter(d => d.nxdomain).length;
  const riskyCount   = dns.filter(d => {
    const cat = categorize(d.fqdn);
    return cat && (cat.risk === 'high' || cat.risk === 'medium');
  }).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-[13px] font-semibold text-[var(--text-color)] shrink-0">DNS Sites &amp; FQDNs</h3>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Filter domain..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full text-[12px] bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg pl-7 pr-3 py-1 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats + Sort row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--text-color)]">{dns.length}</span> domains
            </span>
            <span className="text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--text-color)]">{totalQueries.toLocaleString()}</span> queries
            </span>
            {nxCount > 0 && (
              <span className="text-red-400 font-semibold">{nxCount} NXDOMAIN</span>
            )}
            {riskyCount > 0 && (
              <span className="flex items-center gap-1 text-orange-400 font-semibold">
                <AlertTriangle className="w-3 h-3" />{riskyCount} flagged
              </span>
            )}
          </div>
          <div className="flex gap-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-0.5">
            {[['queries','Top'], ['alpha','A–Z'], ['risk','Risk']].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${sortBy === k ? 'bg-[var(--surface-color)] text-blue-500 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-color)]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-0.5 custom-scroll">
        {dns.map(d => {
          const cat     = categorize(d.fqdn);
          const isRisky = cat && (cat.risk === 'high' || cat.risk === 'medium');
          const maxQ    = MOCK_DNS.reduce((m, x) => Math.max(m, x.queries), 1);

          return (
            <div key={d.id}>
              <button
                onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                className={`w-full flex items-center gap-2 py-2 px-2 rounded-lg transition-colors text-left group ${
                  isRisky
                    ? 'hover:bg-orange-500/5'
                    : d.nxdomain
                    ? 'hover:bg-red-500/5'
                    : 'hover:bg-[var(--bg-color)]'
                }`}
              >
                {/* Expand arrow */}
                {expanded === d.id
                  ? <ChevronDown  className="w-3 h-3 shrink-0 text-[var(--text-secondary)]" />
                  : <ChevronRight className="w-3 h-3 shrink-0 text-[var(--text-secondary)]" />
                }

                {/* Status icon */}
                {d.nxdomain
                  ? <XCircle      className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  : isRisky
                  ? <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-orange-400" />
                  : <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-400" />
                }

                {/* Emoji category badge */}
                {cat && (
                  <span className="text-[13px] shrink-0" title={cat.cat}>{cat.emoji}</span>
                )}

                {/* FQDN */}
                <span className="flex-1 text-[12px] font-mono text-[var(--text-color)] truncate">{d.fqdn}</span>

                {/* Inline mini progress bar */}
                <div className="w-14 h-1 rounded-full bg-[var(--border-color)] overflow-hidden shrink-0 hidden group-hover:block">
                  <div
                    className={`h-full rounded-full ${isRisky ? 'bg-orange-400' : d.nxdomain ? 'bg-red-400' : 'bg-blue-500'}`}
                    style={{ width: `${(d.queries / maxQ) * 100}%` }}
                  />
                </div>

                {/* NXDOMAIN / Risk badge */}
                {d.nxdomain && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/30 px-1.5 py-0.5 rounded-full shrink-0">NXDOMAIN</span>
                )}
                {!d.nxdomain && isRisky && (
                  <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full shrink-0 ${RISK_STYLES[cat.risk]}`}>
                    {cat.cat}
                  </span>
                )}
                {!d.nxdomain && !isRisky && cat && (
                  <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-color)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-full shrink-0 hidden group-hover:inline">
                    {cat.cat}
                  </span>
                )}

                {/* Query count */}
                <span className="text-[11px] text-[var(--text-secondary)] font-mono shrink-0 w-10 text-right">{d.queries}q</span>
              </button>

              {/* Expanded detail */}
              {expanded === d.id && (
                <div className="ml-6 mb-1 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] p-3 text-[11px] space-y-3">

                  {/* Meta row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {cat && (
                      <span className="font-semibold text-[var(--text-color)]">{cat.emoji} {cat.cat}</span>
                    )}
                    <span className="text-[var(--text-secondary)]">First: <span className="font-mono text-[var(--text-color)]">{d.firstSeen}</span></span>
                    <span className="text-[var(--text-secondary)]">Last: <span className="font-mono text-[var(--text-color)]">{d.lastSeen}</span></span>
                    <a
                      href={`https://${d.fqdn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:underline ml-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" /> Visit
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[var(--text-secondary)] mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        Querying Clients ({d.clients.length})
                      </p>
                      <div className="flex flex-col gap-1">
                        {d.clients.map(c => (
                          <div key={c} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span className="font-mono text-[var(--text-color)]">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)] mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        Resolved IPs
                      </p>
                      {d.resolvedIps.length
                        ? d.resolvedIps.map(ip => (
                            <div key={ip} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                              <span className="font-mono text-[var(--text-color)]">{ip}</span>
                            </div>
                          ))
                        : <p className="text-red-400 font-medium">No resolution (NXDOMAIN)</p>
                      }
                    </div>
                  </div>

                  {/* Risk callout */}
                  {isRisky && (
                    <div className={`flex items-start gap-2 p-2 rounded-lg border ${cat.risk === 'high' ? 'bg-red-500/5 border-red-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cat.risk === 'high' ? 'text-red-400' : 'text-orange-400'}`} />
                      <p className={`text-[11px] font-medium ${cat.risk === 'high' ? 'text-red-400' : 'text-orange-400'}`}>
                        {cat.risk === 'high'
                          ? `High-risk category (${cat.cat}). Investigate the querying host${d.clients.length > 1 ? 's' : ''} immediately.`
                          : `Moderate-risk category (${cat.cat}). Verify if this traffic is policy-compliant.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
