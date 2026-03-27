/**
 * alerting-engine.js
 * Deterministic rule-based alerting engine
 * Aligned to NIST Cybersecurity Framework (CSF) categories: Identify, Protect, Detect, Respond
 */

export const ALERT_RULES = [
  {
    id: 'DHCP_ROGUE',
    title: 'Rogue DHCP Server Detected',
    desc: 'Multiple DHCP servers are responding with OFFERs. 192.168.1.254 (Unknown Vendor) is unauthorized.',
    severity: 'critical',
    nist: 'DE.CM-1',
    jumpTo: 'dhcp',
  },
  {
    id: 'DUPLICATE_IP',
    title: 'Duplicate IP Address Detected',
    desc: '192.168.1.15 is mapped to 2 different MAC addresses. Possible ARP spoofing or misconfiguration.',
    severity: 'critical',
    nist: 'DE.CM-7',
    jumpTo: 'flows',
  },
  {
    id: 'OUI_SPOOF',
    title: 'MAC/OUI Vendor Mismatch',
    desc: 'OUI DC:EF:09 resolves to "Philips Lighting BV" but is advertising as a network switch via CDP. High MitM risk.',
    severity: 'critical',
    nist: 'DE.CM-7',
    jumpTo: 'oui',
  },
  {
    id: 'CLEARTEXT_CREDS',
    title: 'Cleartext Credentials Observed',
    desc: 'HTTP Basic Authentication header detected in 3 unencrypted flows. Credentials are exposed on the wire.',
    severity: 'warning',
    nist: 'PR.DS-2',
    jumpTo: 'flows',
  },
  {
    id: 'HIGH_DNS_FAIL',
    title: 'Elevated DNS Failure Rate',
    desc: 'NXDOMAIN rate is 14% (baseline: ~2%). Possible DNS hijacking, misconfiguration, or C2 DGA activity.',
    severity: 'warning',
    nist: 'DE.CM-1',
    jumpTo: 'dns',
  },
  {
    id: 'OUTDATED_FW',
    title: 'Outdated Firmware Detected',
    desc: 'edge-sw-03 (Foundry FastIron GS) is running firmware 7.4.00, released in 2014. Update recommended.',
    severity: 'warning',
    nist: 'PR.IP-12',
    jumpTo: 'discovery',
  },
  {
    id: 'UNENCRYPTED_DNS',
    title: 'No Encrypted DNS Observed',
    desc: 'All DNS queries use plaintext UDP/53. Consider DNS-over-HTTPS (DoH) or DNS-over-TLS (DoT).',
    severity: 'info',
    nist: 'PR.DS-2',
    jumpTo: 'dns',
  },
  {
    id: 'TOP_TALKER',
    title: 'High Volume Outbound Host',
    desc: '192.168.1.42 is generating 38% of all outbound traffic. Verify this is expected behavior.',
    severity: 'info',
    nist: 'DE.CM-1',
    jumpTo: 'talkers',
  },
];

export const INSIGHTS = [
  {
    id: 1,
    headline: 'Immediate threat: Rogue DHCP server is issuing leases',
    detail: 'A device at 192.168.1.254 is acting as an unauthorized DHCP server. Clients leasing from it may have their traffic routed through an attacker-controlled gateway. Isolate immediately.',
    priority: 'P1',
    jumpTo: 'dhcp',
  },
  {
    id: 2,
    headline: 'Only 67% of traffic is encrypted — 33% is cleartext',
    detail: 'A significant fraction of your network traffic is unencrypted. Protocols like HTTP and SMB are carrying data that can be read by any device on the local network segment.',
    priority: 'P2',
    jumpTo: 'flows',
  },
  {
    id: 3,
    headline: 'Two network devices are running firmware from 2014',
    detail: 'The Foundry FastIron switch (edge-sw-03) is running firmware 7.4.00. Legacy firmware may contain unpatched CVEs. Schedule a maintenance window for updates.',
    priority: 'P2',
    jumpTo: 'discovery',
  },
  {
    id: 4,
    headline: 'Network topology spans 3 vendor ecosystems',
    detail: 'Devices from Cisco, Aruba, and Foundry/Brocade are all present. Ensure that security policies are consistent across all management interfaces.',
    priority: 'P3',
    jumpTo: 'discovery',
  },
];

export const nistColors = {
  'DE.CM-1': 'text-blue-400 bg-blue-400/10',
  'DE.CM-7': 'text-red-400 bg-red-400/10',
  'PR.DS-2': 'text-orange-400 bg-orange-400/10',
  'PR.IP-12': 'text-yellow-400 bg-yellow-400/10',
};
