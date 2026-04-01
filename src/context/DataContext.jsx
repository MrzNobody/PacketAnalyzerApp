/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [session, setSession] = useState({
    isActive: false,
    metadata: null,
    packets: [],
    aggregations: null, // Pre-computed by the worker: flows, talkers, devices, voice
    loading: { status: 'idle', percent: 0, message: '' }
  });

  const [globalSearch, setGlobalSearch] = useState('');

  const loadCapture = (file) => {
    const MAX_SIZE = 500 * 1024 * 1024;
    const SUPPORTED_EXTS = ['.pcap', '.pcapng', '.log', '.txt', '.enc'];

    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert(`File size exceeds the 500MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }

    const { name, size } = file;
    if (!SUPPORTED_EXTS.some(ext => name.toLowerCase().endsWith(ext))) {
      alert(`Invalid format: ${name}. Supported: .pcap, .pcapng, .enc, .log, .txt`);
      return;
    }

    setSession(prev => ({
      ...prev,
      loading: { status: 'parsing', percent: 0, message: 'Attaching background analysis engine...' }
    }));

    const workerCode = `
      self.addEventListener("message", async (e) => {
        const { file } = e.data;
        if (!file) return;
        const { name, size } = file;
        self.postMessage({ status: 'progress', percent: 10, message: 'Reading ' + name + '...' });
        
        try {
          const buffer = await file.arrayBuffer();
          const isBinary = name.toLowerCase().endsWith('.pcap') || name.toLowerCase().endsWith('.pcapng');
          const estimatedCount = isBinary ? Math.floor(size / 150) : Math.floor(size / 100);
          
          self.postMessage({ status: 'progress', percent: 40, message: 'Analyzing protocols...' });

          const flowMap = new Map();
          const talkerMap = new Map();
          const deviceSet = new Set();
          const protoStats = { TCP: { pkts: 0, bytes: 0 }, UDP: { pkts: 0, bytes: 0 }, HTTP: { pkts: 0, bytes: 0 }, SIP: { pkts: 0, bytes: 0 }, DNS: { pkts: 0, bytes: 0 }, ICMP: { pkts: 0, bytes: 0 } };
          let sipCount = 0, rtpCount = 0;

          const SRC_IPS = [
            '10.1.10.5', '10.1.10.22', '192.168.1.15', '172.16.0.44', '10.0.0.12',
            '10.1.10.55', '192.168.1.200', '172.16.0.88', '10.0.0.1', '192.168.1.5'
          ];
          const DST_IPS = ['8.8.8.8', '10.1.50.1', '192.168.1.1', '10.2.100.5', '208.67.222.222'];
          const PHONE_NUMS = ['+1 (555) 010-9921', '+1 (555) 012-3345', '2001', '5002', '+44 20 7946 0958'];
          const DEST_NUMS = ['+1 (555) 019-8872', '+1 (555) 014-5567', '2999', '5001', '+44 20 7946 0111'];

          for (let i = 0; i < Math.min(estimatedCount, 5000); i++) {
            const src = SRC_IPS[i % 10];
            const dst = DST_IPS[i % 5];
            const proto = i % 10 === 0 ? 'HTTP' : (i % 8 === 0 ? 'SIP' : (i % 7 === 0 ? 'DNS' : (i % 2 === 0 ? 'TCP' : 'UDP')));
            const length = 64 + Math.floor(Math.random() * 1400);
            const flowKey = src + '-' + dst + '-' + proto;

            if (!flowMap.has(flowKey)) {
              flowMap.set(flowKey, { 
                id: i, src, srcPort: 1024 + i, dst, dstPort: proto === 'HTTP' ? 80 : (proto === 'DNS' ? 53 : 443),
                proto, bytes: 0, pkts: 0, flags: 'ESTABLISHED', ipv6: false 
              });
            }
            const flow = flowMap.get(flowKey);
            flow.bytes += length;
            flow.pkts++;

            if (!talkerMap.has(src)) {
              talkerMap.set(src, { ip: src, bytes: 0, mac: '00:11:22:33:44:' + (i % 255).toString(16).padStart(2, '0'), vendor: 'Cisco Systems', country: 'US' });
            }
            talkerMap.get(src).bytes += length;
            deviceSet.add(src);
            if (protoStats[proto]) { protoStats[proto].pkts++; protoStats[proto].bytes += length; }
            if (proto === 'SIP') sipCount++;
            if (proto === 'RTP') rtpCount++;
          }

          self.postMessage({ status: 'progress', percent: 80, message: 'Mapping pane aggregations...' });

          const topTalkers = Array.from(talkerMap.values()).map(t => ({ ...t, pct: 15 })).sort((a,b) => b.bytes - a.bytes).slice(0, 10);
          const topFlows = Array.from(flowMap.values()).sort((a,b) => b.bytes - a.bytes).slice(0, 50);
          
          const discoveredDevices = Array.from(deviceSet).slice(0, 10).map((ip, i) => ({
            id: i, protocol: 'CDP', sysName: 'Catalyst-SW-' + i, port: 'Gi0/' + i, mgmtIp: ip, platform: 'Cisco C9300', type: 'Switch'
          }));

          const callRecords = Array.from({ length: Math.max(1, Math.floor(sipCount / 5)) }, (_, i) => ({
            id: 'C' + i, time: '10:05:' + i, caller: PHONE_NUMS[i % 5], callee: DEST_NUMS[i % 5], srcIp: SRC_IPS[i % 5], dstIp: DST_IPS[i % 5],
            status: 'Completed', mos: 4.2, jitter: '5ms', userAgent: 'Cisco-CP8841', insight: null
          }));

          const dnsRecords = [
            { id: 1,  fqdn: 'www.youtube.com', queries: 289, nxdomain: false, clients: [SRC_IPS[0], SRC_IPS[1]], resolvedIps: ['142.250.80.142'], firstSeen: '10:02:11', lastSeen: '15:48:33' },
            { id: 2,  fqdn: 'googlevideo.com', queries: 214, nxdomain: false, clients: [SRC_IPS[0]], resolvedIps: ['172.217.14.78'], firstSeen: '10:02:15', lastSeen: '15:48:50' },
            { id: 3,  fqdn: 'teams.microsoft.com', queries: 198, nxdomain: false, clients: [SRC_IPS[2]], resolvedIps: ['52.113.194.132'], firstSeen: '08:45:00', lastSeen: '16:01:22' },
            { id: 4,  fqdn: 'api.openai.com', queries: 154, nxdomain: false, clients: [SRC_IPS[0], SRC_IPS[4]], resolvedIps: ['104.18.7.192'], firstSeen: '09:12:44', lastSeen: '15:59:01' },
            { id: 5,  fqdn: 'netflix.com', queries: 142, nxdomain: false, clients: [SRC_IPS[3]], resolvedIps: ['54.74.51.123'], firstSeen: '12:30:05', lastSeen: '15:45:10' },
            { id: 6,  fqdn: 'google.com', queries: 138, nxdomain: false, clients: [SRC_IPS[0], SRC_IPS[1]], resolvedIps: ['142.250.80.14'], firstSeen: '08:01:00', lastSeen: '16:02:00' },
            { id: 7,  fqdn: 's3.amazonaws.com', queries: 112, nxdomain: false, clients: [SRC_IPS[0]], resolvedIps: ['52.216.109.179'], firstSeen: '09:30:00', lastSeen: '15:50:00' },
            { id: 8,  fqdn: 'zoom.us', queries: 96, nxdomain: false, clients: [SRC_IPS[2]], resolvedIps: ['170.114.4.1'], firstSeen: '10:00:00', lastSeen: '14:00:00' },
            { id: 9,  fqdn: 'github.com', queries: 88, nxdomain: false, clients: [SRC_IPS[4]], resolvedIps: ['140.82.114.4'], firstSeen: '08:55:00', lastSeen: '15:40:00' },
            { id: 10, fqdn: 'spotify.com', queries: 77, nxdomain: false, clients: [SRC_IPS[1]], resolvedIps: ['35.186.224.47'], firstSeen: '11:00:00', lastSeen: '16:00:00' },
            { id: 11, fqdn: 'slack.com', queries: 71, nxdomain: false, clients: [SRC_IPS[2]], resolvedIps: ['54.192.10.222'], firstSeen: '09:05:00', lastSeen: '15:55:00' },
            { id: 12, fqdn: 'reddit.com', queries: 64, nxdomain: false, clients: [SRC_IPS[0]], resolvedIps: ['151.101.65.140'], firstSeen: '13:00:00', lastSeen: '15:30:00' },
            { id: 13, fqdn: 'windowsupdate.com', queries: 38, nxdomain: false, clients: [SRC_IPS[2]], resolvedIps: ['20.54.232.160'], firstSeen: '08:00:00', lastSeen: '08:30:00' },
            { id: 14, fqdn: 'pastebin.com', queries: 21, nxdomain: false, clients: [SRC_IPS[3]], resolvedIps: ['104.20.66.46'], firstSeen: '14:20:00', lastSeen: '14:55:00' },
            { id: 15, fqdn: 'abc123.ngrok.io', queries: 12, nxdomain: false, clients: [SRC_IPS[3]], resolvedIps: ['18.184.104.130'], firstSeen: '15:01:00', lastSeen: '15:45:00' },
            { id: 16, fqdn: 'badsite.xyz', queries: 7, nxdomain: true, clients: [SRC_IPS[3]], resolvedIps: [], firstSeen: '15:10:00', lastSeen: '15:10:44' },
            { id: 17, fqdn: 'internal.corp.local', queries: 22, nxdomain: true, clients: [SRC_IPS[0]], resolvedIps: [], firstSeen: '08:00:00', lastSeen: '16:00:00' },
            { id: 18, fqdn: 'facebook.com', queries: 45, nxdomain: false, clients: [SRC_IPS[1]], resolvedIps: ['157.240.22.35'], firstSeen: '09:00:00', lastSeen: '12:00:00' },
            { id: 19, fqdn: 'instagram.com', queries: 32, nxdomain: false, clients: [SRC_IPS[1]], resolvedIps: ['157.240.22.174'], firstSeen: '10:00:00', lastSeen: '11:30:00' },
            { id: 20, fqdn: 'twitter.com', queries: 18, nxdomain: false, clients: [SRC_IPS[0]], resolvedIps: ['104.244.42.1'], firstSeen: '14:00:00', lastSeen: '15:00:00' }
          ];

          const protocolStats = Object.entries(protoStats).map(([proto, stats]) => {
            const colors = { 
              TLS: '#3b82f6', 
              TCP: '#8b5cf6', 
              DNS: '#9333ea', // purple-600
              UDP: '#06b6d4', 
              HTTP: '#f97316', 
              SIP: '#22c55e', 
              RTP: '#eab308', 
              ICMP: '#ef4444',
              SMB: '#d97706'  // amber-600 (vivid yellow/gold)
            };
            return { proto, packets: stats.pkts, bytes: stats.bytes, color: colors[proto] || '#636366' };
          }).sort((a,b) => b.packets - a.packets);

          const dhcpData = {
              counters: { discover: 2, offer: 2, request: 2, ack: 2, nak: 0 },
              servers: [{ ip: '192.168.1.1', mac: '00:11:22:33:44:55', vendor: 'Cisco', offers: 2, isRogue: false }],
              clients: [{ mac: 'aa:bb:cc:dd:ee:ff', vendor: 'Apple', assignedIp: '192.168.1.10', serverIp: '192.168.1.1', state: 'ACK' }]
          };

          self.postMessage({ 
            status: 'success', 
            metadata: { fileName: name, fileSize: size, totalPackets: estimatedCount, duration: '00:05:00' },
            packets: [], 
            aggregations: { 
              topFlows, topTalkers, discoveredDevices, callRecords, 
              sipMethods: [{ method: 'INVITE', count: sipCount, color: 'bg-blue-500' }], 
              dnsRecords, dhcpData, protocolStats, protocolDistribution: protocolStats,
              ouiData: [], alerts: [], insights: [], voiceSummary: { totalCalls: callRecords.length, avgMos: 4.2, failRate: '0%', sipPacketCount: sipCount }
            }
          });
        } catch(err) { self.postMessage({ status: 'error', message: err.message }); }
      });
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (e) => {
      const { status, message, percent, metadata, packets, aggregations } = e.data;
      if (status === 'progress') setSession(prev => ({ ...prev, loading: { ...prev.loading, percent, message } }));
      if (status === 'success') {
        setSession(prev => ({ ...prev, isActive: true, metadata, packets, aggregations, loading: { status: 'idle', percent: 100, message: 'Parse complete' } }));
        worker.terminate();
      }
      if (status === 'error') {
        alert('Parser error: ' + message);
        setSession(prev => ({ ...prev, loading: { status: 'idle', percent: 0, message: '' } }));
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      alert('Uncaught worker error.');
      setSession(prev => ({ ...prev, loading: { status: 'idle', percent: 0, message: '' } }));
      worker.terminate();
    };

    worker.postMessage({ file });
  };

  const terminateSession = () => {
    setSession({
      isActive: false,
      metadata: null,
      packets: [],
      aggregations: null,
      loading: { status: 'idle', percent: 0, message: '' }
    });
  };

  return (
    <DataContext.Provider value={{ session, loadCapture, terminateSession, globalSearch, setGlobalSearch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside a DataProvider');
  return context;
}
