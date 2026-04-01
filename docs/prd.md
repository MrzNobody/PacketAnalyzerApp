# Product Requirements Document
## Packet Assistant

**Version:** 1.22
**Date:** 2026-03-28
**Status:** Approved
**Author:** Carlo Raineri

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Users & Use Cases](#3-target-users--use-cases)
4. [Technical Architecture Overview](#4-technical-architecture-overview)
5. [File Ingestion & Parsing Requirements](#5-file-ingestion--parsing-requirements)
6. [External Knowledge Sources](#6-external-knowledge-sources)
7. [Voice & SIP Analytics Engine](#7-voice--sip-analytics-engine)
8. [Dashboard Layout & Design System](#8-dashboard-layout--design-system)
9. [Dashboard Panes — Functional Requirements](#9-dashboard-panes--functional-requirements)
   - 9.1 [Top Talkers & Geo-Location Map](#91-top-talkers--geo-location-map)
   - 9.2 [Connection Flow Explorer](#92-connection-flow-explorer)
   - 9.3 [DNS Sites & FQDN List](#93-dns-sites--fqdn-list)
   - 9.4 [DHCP Monitor & Rogue Detection](#94-dhcp-monitor--rogue-detection)
   - 9.5 [Alerts Feed (Sidebar)](#95-alerts-feed-sidebar)
   - 9.6 [Actionable Insights (Sidebar)](#96-actionable-insights-sidebar)
   - 9.7 [Device Discovery & Topology (Pane 5)](#97-device-discovery--topology-pane-5)
   - 9.8 [OUI Hardware Asset Inventory (Pane 6)](#98-oui-hardware-asset-inventory-pane-6)
10. [Protocol Classification Engine & Sidebar Analytics](#10-protocol-classification-engine--sidebar-analytics)
11. [Interactive TCP/IP Stream Ladder Diagram](#11-interactive-tcpip-stream-ladder-diagram)
12. [UI/UX Design Requirements](#12-uiux-design-requirements)
13. [React Application Architecture](#13-react-application-architecture)
14. [Project Directory Structure](#14-project-directory-structure)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Acceptance Criteria](#16-acceptance-criteria)
17. [Open Questions & Dependencies](#17-open-questions--dependencies)

---

## 1. Executive Summary

The **Packet Assistant** is a browser-based React application that enables technical and non-technical decision-makers to upload, parse, and visually analyze network packet capture files. The application transforms raw packet data into a structured, visually intuitive dashboard — modeled after Apple's clean design language — that surfaces actionable network intelligence without requiring deep packet analysis expertise.

The application supports standard packet capture formats (`.pcapng`, `.pcap`, `.enc`, `.txt`, `.log`) and presents the resulting data through purpose-built dashboard panes, each targeting a specific aspect or dimension of network communication. It features a specialized Voice Analytics engine for deep inspection of SIP/RTP traffic and automated documentation retrieval.

---

## 2. Product Vision & Goals

### Vision Statement
To democratize deep packet inspection by transforming raw network captures into a visually compelling, single-pane-of-glass dashboard that empowers decision-makers to understand, assess, and act on network communication patterns — regardless of their technical depth.

### Primary Goals

| Goal | Description |
|------|-------------|
| **Accessibility** | Any user — from a network engineer to a CISO — can open the app, upload a capture file, and immediately understand what is happening on the network. |
| **Comprehensiveness** | Cover all major communication dimensions: traffic flows, protocols, DNS behavior, ICMP and/or anomalies, and security signals. |
| **Actionability** | Every insight presented must be either diagnostic (here is a problem) or directional (here is what you should investigate). |
| **Interactivity** | Users must be able to drill into any data point to reveal deeper packet-level context without leaving the dashboard. |
| **Visual Clarity** | The interface must feel polished, structured, and immediately interpretable — modeled on Apple's Human Interface Guidelines. |

---

## 3. Target Users & Use Cases

### Primary Users

| User Type | Description |
|-----------|-------------|
| **Network Engineers** | Need deep packet visibility with drill-down into flows and stream reconstruction. |
| **Security Analysts** | Looking for anomalies, duplicate addresses, unexpected traffic, and threat indicators. |
| **IT Decision-Makers / CISOs** | Need executive-level summaries and flagged risks without raw packet data. |
| **NOC (Network Operations Center) Teams** | Need a real-time-style dashboard summary from uploaded captures for incident review. |

### Key Use Cases

1. **Incident Investigation** — Upload a packet capture from a suspected incident; identify top talkers, ICMP and/or anomalies, and duplicate IP/MAC addresses.
2. **Capacity & Performance Review** — Identify communication patterns, dominant protocols, and bandwidth hogs from a periodic capture.
3. **DNS Audit** — Inspect where users are resolving hostnames to understand egress patterns and detect DNS tunneling or exfiltration.
4. **Compliance & Audit** — Provide a visual record of network behavior at a point in time for audit or compliance documentation.
5. **Security Triage** — Quickly identify alerts and warnings for unusual or potentially malicious traffic without needing Wireshark expertise.

---

## 4. Technical Architecture Overview

┌────────────────────────────────────────────────────────────────────┐
│                            PACKET ASSISTANT                          │
│                        (React SPA - Browser)                       │
├──────────────────────────┬─────────────────────────────────────────┤
│    FILE INGESTION LAYER  │          ANALYSIS ENGINE LAYER          │
│  ─────────────────────   │  ───────────────────────────────────    │
│  • File Upload UI        │  • Voice & SIP Inspector                │
│  • Format Validator      │  • Protocol Classifier (ctrl/data/voice)│
│  • PCAP Parser (JS)      │  • IPv4 / IPv6 Separator                │
│    - pcapng              │  • Top Talkers Aggregator               │
│    - pcap                │  • DNS Response Extractor               │
│    - enc                 │  • SIP Ladder Reconstructor             │
│    - txt / log           │  • Alert & Anomaly Engine               │
│  • sources/ fetcher      │  • RFC/Cisco Documentation Auto-Fetch  │
├──────────────────────────┴─────────────────────────────────────────┤
│                       DASHBOARD LAYER (React)                      │
│  ─────────────────────────────────────────────────────────────     │
│  Pane 1: Top Talkers Viz   │  Pane 2: Connection Flow Explorer     │
│  Pane 3: DNS Monitor       │  Pane 4: DHCP Monitor                 │
│  Pane 5: Alerts & Warnings │  Pane 6: Actionable Insights          │
│                  Voice & SIP Analytics Tab                         │
└────────────────────────────────────────────────────────────────────┘

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18+ (functional components, hooks) |
| **State Management** | React Context API + `useReducer` (or Zustand for larger state) |
| **PCAP Parsing** | `pcap-parser` (JS), `pcapng-parser`, or a WebAssembly build of `libpcap` |
| **Charting & Visualization** | Recharts (charts), D3.js (ladder diagram, custom graphs) |
| **Styling** | Tailwind CSS + custom CSS variables for Apple-style design tokens |
| **UI Components** | shadcn/ui or custom component library with SF Pro-inspired typography |
| **File Handling** | Browser File API + Web Workers for parsing off the main thread |
| **Build Tool** | Vite |
| **Routing** | React Router v6 |
| **Testing** | Vitest + React Testing Library |

---

## 5. File Ingestion & Parsing Requirements

### 5.1 Supported File Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| PCAP Next Generation | `.pcapng` | Modern multi-interface capture format |
| PCAP Classic | `.pcap` | Legacy Libpcap format |
| Encrypted Capture | `.enc` | Encrypted packet capture (requires key handling) |
| Text Export | `.txt` | Wireshark or tcpdump text export |
| Log Export | `.log` | tcpdump or similar log-formatted captures |

### 5.2 File Upload UI Requirements

- **Drag-and-drop zone** prominently displayed on the landing/upload screen.
- **File Browser / Picker button** prominently displayed within the drop zone, allowing users to browse their filesystem for a file manually. Both methods must accept only the supported extensions.
- **File validation** must occur before parsing:
  - Extension check
  - Magic byte validation for binary formats (`.pcap` magic: `0xA1B2C3D4` / `0xD4C3B2A1`; `.pcapng` block type: `0x0A0D0D0A`)
  - File size warning (soft limit: 100 MB; hard limit: 500 MB with a user confirmation prompt)
- **Upload progress indicator** using a smooth Apple-style progress bar.
- **Error states** must display human-readable messages (e.g., "This file does not appear to be a valid packet capture. Please check the format and try again.").

### 5.3 Parsing Pipeline

```
File Upload
    │
    ▼
Format Detection (magic bytes / extension)
    │
    ▼
Web Worker: Parse Packets into Normalized Packet Objects
    │
    ▼
Normalize to Internal Schema (see below)
    │
    ▼
Analysis Engines (parallel processing per analysis domain)
    │
    ▼
State Store Update → Dashboard Re-render
```

### 5.4 Normalized Packet Schema

Each parsed packet must be normalized into the following internal schema before being passed to any analysis engine:

```json
{
  "packetIndex": 1,
  "timestamp": "2025-01-15T10:23:45.123456Z",
  "captureLength": 74,
  "originalLength": 74,
  "ipVersion": 4,
  "srcIP": "192.168.1.10",
  "dstIP": "8.8.8.8",
  "srcMAC": "aa:bb:cc:dd:ee:ff",
  "dstMAC": "ff:ee:dd:cc:bb:aa",
  "protocol": "TCP",
  "protocolCategory": "data",
  "srcPort": 54321,
  "dstPort": 443,
  "flags": ["SYN"],
  "payload": "<hex or base64 string>",
  "streamId": "192.168.1.10:54321-8.8.8.8:443-TCP",
  "dnsQuery": null,
  "dnsResponse": null,
  "icmpType": null,
  "icmpCode": null,
  "rawFrame": "<original hex>"
}
```

---

## 6. External Knowledge Sources

### 6.1 Update Prompts & Integrity Checking

To guarantee the application is always analyzing packets against the most current IANA/IEEE standards, the application must implement an **integrity check and update prompt** mechanism for its external knowledge bases:
- During application initialization, the app attempts to fetch the latest `ETag` or `Last-Modified` headers from the origin URLs.
- If the remote source is determined to be newer than the local cached copy (or if a local file fails its SHA-256 integrity hash check), the application must **pause and prompt the user**:
  - *"External knowledge sources are out of date. Do you want to update them and restart the application, or move forward using the old cached data?"*
- If the user selects "Update & Restart", a fresh copy is downloaded, the `sources/` directory is updated, the `sources-manifest.json` (tracking ETags and file hashes) is rewritten, and the app gracefully reloads.
- If the user opts to "Move Forward", the app skips the update and proceeds with the current capture session using the cached data.

### 6.2 Required Source Files

| Source File | Description | Origin |
|-------------|-------------|--------|
| `sources/iana-service-names-port-numbers.csv` | IANA port number registry | https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.csv |
| `sources/iana-protocol-numbers.csv` | IANA IP protocol number assignments | https://www.iana.org/assignments/protocol-numbers/protocol-numbers.csv |
| `sources/ieee-oui.txt` | IEEE OUI (MAC vendor prefix) database | https://standards-oui.ieee.org/oui/oui.txt |
| `sources/iana-icmp-parameters.csv` | ICMP type and code definitions | https://www.iana.org/assignments/icmp-parameters/icmp-parameters.csv |
| `sources/iana-dns-parameters.csv` | DNS record type definitions | https://www.iana.org/assignments/dns-parameters/dns-parameters.csv |

### 6.3 Fallback Behavior

If any source file cannot be fetched or an integrity check fails (e.g., network unavailable, corrupted origin file), the application must:
- Generate an exportable log file (e.g., `sources_update_error.txt`) dynamically documenting the explicit reason for the failure in a plaintext format readable by any standard text editor.
- Fall back to a bundled, static copy of last-known-good reference data included at build time.
- Display a non-blocking notification in the UI: "Some enrichment data could not be refreshed. Using cached reference data," and provide a link/button to download the `.txt` error log.

---

## 7. Voice & SIP Analytics Engine

The Voice Analytics engine specializes in reconstructing and visualizing telecommunications traffic. It identifies SIP (Session Initiation Protocol) transactions and RTP (Real-time Transport Protocol) media streams to provide a comprehensive view of voice communication health.

### 7.1 SIP Signaling Reconstruction
- **Telephony-Centric ID (E.164)**: The engine must prioritize E.164 phone numbers over network-layer IP addresses in all visual displays to align with telephony standards.
- **Header Analysis (From/To)**: Correlates SIP INVITE, TRYING, RINGING, OK, and BYE messages into unified call sessions, extracting explicit `From:` and `To:` fields for the directory.
- **Ladder Diagrams**: Generates dynamic signaling ladder diagrams showing the precise exchange between callers, proxies, and callees.
- **Error Detection**: Flags SIP 4xx/5xx/6xx response codes with descriptive error causes (e.g., 404 Not Found, 486 Busy Here).
- **Troubleshooting Focus**: The primary call directory must prioritize "Failed SIP Sessions" to accelerate root-cause analysis for dropped or rejected calls.

### 7.2 Voice Protocol Analysis
- **RTP Stream Identification**: Detects RTP/RTCP streams associated with SIP sessions.
- **Codec Mapping**: Identifies utilized codecs (G.711, G.722, Opus, etc.) from SDP (Session Description Protocol) payloads.

### 7.3 Pre-installed Telecommunications Documentation Library
- **Local Reference Storage**: Critical standards (RFC 3261, RFC 4566, RFC 3550) are pre-installed into the application's local filesystem (`/docs/rfc/`) for instant, offline-ready reference without external network calls.
- **Contextual Assistance**: Provides "Doc-Link" tooltips and a dedicated "Reference Library" UI block next to SIP headers explaining field meanings according to official standards.

### 7.2 Voice & SIP Analytics Tab (Dedicated Deep-Dive View)

Because Voice analysis is highly specialized and runs the risk of clogging up the primary executive dashboard, the Voice & SIP Analytics must be broken out into its own dedicated, selectable **Tab** at the top of the interface (e.g., *Main Dashboard* vs. *Voice Analytics*).

**Tab Layout Structure:**
- **Pane 1: Call History Analyzer**: A searchable table of distinct voice sessions, providing Start Time, Source (Caller), Destination (Callee), Status (Completed/Missed/Busy), and Duration. Supports real-time filtering similar to the Connection Flow Explorer.
- **Pane 2: Signaling Ladder Diagram**: A dynamic SIP sequence diagram showing the signaling flow for the *selected* session in Pane 1.
- **Pane 3: Media & Quality Flows (Inc. MOS)**: A detailed table of RTP/RTCP streams associated with the selected call, listing bandwidth, jitter, and automated **MOS (Mean Opinion Score)** quality ratings.
- **Pane 4: SIP Method Distribution**: A visual breakdown (donut or bar) of SIP methods (INVITE, REGISTER, OPTIONS, etc.) to detect brute-force registration or polling anomalies.
- **Pane 5: Endpoint Metadata & User-Agent Profiling**: Extraction of hardware and software versioning from the SIP `User-Agent` and `Server` headers to identify endpoint vulnerabilities.
- **Sidebar Integration (Voice Health Pulse)**: A real-time executive widget on the main dashboard sidebar showing Avg. MOS, Active Call Volume, and quality sparklines, bridging the gap between general traffic and voice health.

Rather than a vertical breakdown, the default and recommended horizontal component above the dashboard panes is an **Interactive Traffic Timeline Scrubber**. This addresses the common "when did it happen?" question.
- Displays a horizontal time-series area chart (sparkline) of total packet volume across the entire capture window.
- Users can click and drag over specific spikes or timeframes on the timeline to instantly filter all dashboard panes to exclusively show traffic matching that exact window.

### 7.4 IPv4 vs. IPv6 Separation

All panes that display IP address data must visually distinguish between IPv4 and IPv6 traffic using color-coded badges or tags:
- **IPv4** — Blue badge
- **IPv6** — Purple badge

A summary toggle at the top of affected panes allows users to filter to "All", "IPv4 only", or "IPv6 only".

---

## 8. Dashboard Layout & Design System

### 8.1 Layout Structure

The dashboard supports two configurable layout modes that the user can toggle between on-the-fly via a header control. On desktop (≥1280px wide), the interface responds immediately to the user's preference. On tablet and smaller screens, panes stack vertically regardless of mode.

**Mode A: Robust Sidebar Layout (Default)**
Features a persistent side navigation bar for executive summaries, leaving the main content area exclusively for deep data exploration rendered in a symmetrical grid layout. The sidebar is expanded to **320px** to accommodate high-visibility typography and wrapped metadata.

**Accessibility Standards (Global Scale):**
- **Baseline Typography**: The application root font size is set to `16px` to ensure maximum legibility for technical data.
- **Pane Scaling**: All dashboard panes feature a minimum height of `500px` to maintain a consistent grid while scaling to fit content.
- **Metadata Protection**: The Capture Summary and Alert feeds explicitly avoid text truncation, utilizing `break-all` and logical wrapping to ensure all filenames and detail strings are fully readable.

**Visual Synchronization (Protocol Tokens):**
- **Unified Color Coding**: Protocol labels and percentages are dynamically synchronized with their category bullets (e.g., DNS is always vivid Purple `#9333ea`, SMB is always vivid Amber `#d97706`).
- **Contextual Reinforcement**: This color mapping is enforced across the Analysis Worker, the Sidebar Summary, and the main Dashboard grid for immediate data correlation.

```
┌───────────────────────────────────────────────────────────────────┐
│ HEADER: ⌬ Packet Assistant |  Global Device Search  |  [Toggle Layout]      │
├───────────────────────────────────────────────────────────────────┤
│ TABS:  [Main Dashboard] (Active)       [Voice Analytics]          │
├───────────────────────────────────────────────────────────────────┤
│ TIMELINE SCRUBBER: Click & drag to filter packets by time window  │
├───────────────┬───────────────────────────────────────────────────┤
│ SIDEBAR       │ MAIN CONTENT AREA (Dynamic Grid)                  │
│               │ ┌──────────────────────┬────────────────────────┐ │
│ 1. Capture    │ │ PANE 1: Top Talkers  │ PANE 2: Connection     │ │
│    Summary    │ │ & Geo-Location Map   │ Explorer (Flows)       │ │
│ 2. Protocols &│ ├──────────────────────┼────────────────────────┤ │
│    Encryption │ │ PANE 3: DNS Sites &  │ PANE 4: DHCP Monitor & │ │
│ 3. Alerts     │ │ FQDN List            │ Rogue Detection        │ │
│    Feed       │ ├──────────────────────┼────────────────────────┤ │
│ 4. Insights   │ │ PANE 5: Device       │ PANE 6: OUI Hardware   │ │
│    Panel      │ │ Discovery (LLDP/CDP) │ Asset Inventory        │ │
│               │ └──────────────────────┴────────────────────────┘ │
└───────────────┴───────────────────────────────────────────────────┘
```

**Mode B: Classic 6-Pane Grid (Sidebar Collapsed)**
A symmetrical 3x2 grid maximizing horizontal screen real estate. The unified Alerts & Insights sidebars expand as an overlay.

```
┌───────────────────────────────────────────────────────────────────┐
│ HEADER: ⌬ Packet Assistant |  Global Device Search  |  [Toggle Layout]      │
├───────────────────────────────────────────────────────────────────┤
│ TABS:  [Main Dashboard] (Active)       [Voice Analytics]          │
├───────────────────────────────────────────────────────────────────┤
│ TIMELINE SCRUBBER: Click & drag to filter packets by time window  │
├───────────────────────────┬───────────────────────────────────────┤
│ PANE 1: Top Talkers & Geo │ PANE 2: Connection Explorer (Flows)   │
├───────────────────────────┼───────────────────────────────────────┤
│ PANE 3: DNS Sites & FQDNs │ PANE 4: DHCP Monitor & Rogue Detection│
├───────────────────────────┼───────────────────────────────────────┤
│ PANE 5: Device Discovery  │ PANE 6: OUI Hardware Asset Inventory  │
└───────────────────────────┴───────────────────────────────────────┘
*(Note: Alerts & Insights are explicitly migrated to an expandable persistent slide-out overlay in Mode B to preserve the 3x2 grid geometry).*
```

### 8.2 Apple-Inspired Design System

| Design Token | Specification |
|--------------|--------------|
| **Font** | SF Pro Display / SF Pro Text (system-ui fallback: -apple-system, BlinkMacSystemFont) |
| **Border Radius** | 12px for cards, 8px for chips/badges, 6px for inputs |
| **Colors (Light)** | Background: `#F5F5F7`, Surface: `#FFFFFF`, Primary Accent: `#0071E3` (Apple blue), Success: `#34C759`, Warning: `#FF9500`, Danger: `#FF3B30` |
| **Colors (Dark)** | Background: `#000000`, Surface: `#1C1C1E`, Text: `#FFFFFF`, Accent: `#0A84FF` |
| **Shadows** | `0 2px 8px rgba(0,0,0,0.08)` for cards; `0 4px 20px rgba(0,0,0,0.12)` for modals |
| **Spacing** | 8px base unit; spacing scale: 4, 8, 12, 16, 24, 32, 48 |
| **Typography** | Base: 16px, H1: 36px/700, H2: 24px/600, PRD-H3: 17px/600, Body: 16px/400, Caption: 13px/400 |
| **Transitions** | 200ms ease for hover states; 300ms ease-in-out for panel transitions |
| **Blur Effects** | Frosted glass on modal overlays: `backdrop-filter: blur(20px)` |
| **Readability** | No truncation for filenames or critical metadata; 320px Sidebar width |

### 8.3 Dark Mode

The application must support system-level dark mode detection via `prefers-color-scheme` media query. A manual toggle must also be available in the header.

---

## 9. Dashboard Panes — Functional Requirements

### 9.1 Top Talkers & Geo-Location Map

**Purpose:** Show which hosts are generating or receiving the most traffic, and visually map where internet-bound traffic is going geographically.

**Visualization Type:** Users can toggle between two primary views for this pane:
1. **Interactive Bubble/Sunburst Chart:**
- Node size = packet volume
- Node color = IP version (blue = IPv4, purple = IPv6)
- Edge weight = connection volume between two hosts

**Required Features:**

| Feature | Description |
|---------|-------------|
| **Hover tooltip** | On hover, display: IP address, total packets sent, total packets received, dominant protocol, % of total capture traffic |
| **Click to filter** | Clicking a host node filters all other panes to show only traffic to/from that host |
| **Top N control** | A slider or segmented control to show Top 5, Top 10, Top 20, or All talkers |
| **View toggle** | Switch between bubble chart, Geo-Location Heatmap (resolving public IPs to their origin countries), horizontal bar chart, and table views |
| **IPv4/IPv6 filter** | Toggle between All, IPv4-only, IPv6-only |
| **Export** | "Export as PNG" and "Export as CSV" buttons |

**Data Inputs Required:**
- Aggregated packet counts per source IP
- Aggregated packet counts per destination IP
- Bidirectional flow byte totals per IP pair

---

### 9.2 Connection Flow Explorer

**Purpose:** Provide a complete, interactive inventory of all network connections observed in the capture.

**Display:** Sortable, searchable, paginated data table.

**Table Columns:**

| Column | Description |
|--------|-------------|
| `#` | Row index |
| `Source IP` | Source IP address with IPv4/IPv6 badge |
| `Source Port` | Source port number + resolved service name (e.g., `54321 / ephemeral`) |
| `Destination IP` | Destination IP with IPv4/IPv6 badge |
| `Destination Port` | Destination port + resolved service name (e.g., `443 / HTTPS`) |
| `Protocol` | Transport protocol (TCP/UDP/SCTP) |
| `Category` | Control / Data / Voice badge |
| `Packets` | Total packet count for this flow |
| `Bytes` | Total bytes |
| `Duration` | Flow duration (first packet → last packet) |
| `Actions` | Buttons: "Drill Down" and "Show Stream" |

**Required Features:**

| Feature | Description |
|---------|-------------|
| **Search/Filter** | Free-text search across all columns; per-column filter dropdowns |
| **Sorting** | Click any column header to sort ascending/descending |
| **Pagination** | 25 rows per page default; user-configurable (25/50/100) |
| **Drill Down** | Opens a slide-in panel showing all individual packets within that flow, displayed as a mini packet table with timestamp, size, flags, and payload preview |
| **Show TCP/IP Stream** | Opens the Ladder Diagram modal (see §11) for the selected flow |
| **Highlight selected** | Selected row is visually highlighted; its host appears highlighted in Pane 1 |
| **Export** | Export current filtered view as CSV |

---

### 9.3 DNS Sites & FQDN List

**Purpose:** Present an intuitive, aggregated list of actual sites and FQDNs gathered from the capture, moving away from a packet-by-packet view to instantly show where network devices are connecting.

**Display:** A clean, actionable list of unique FQDN names. Clicking on a site expands it to reveal technical details such as the clients querying it and the resolved IPs.

**List Item Content:**

| Element | Description |
|---------|-------------|
| `FQDN Name` | The unique hostname queried (e.g., `mail.google.com`) |
| `Category Badge` | Auto-classified: Search Engine, CDN, Mail, Social Media, Unknown |
| `Query Volume` | Total number of times this site was queried |
| `Expanded View` | Clicking the site reveals the Client IPs making the query, the Resolved IP Addresses, and TTLs |

**Required Features:**

| Feature | Description |
|---------|-------------|
| **Category auto-tagging** | Attempt to classify resolved domains by category using known domain patterns (e.g., `*.google.com` → Search/Cloud; `*.akamaiedge.net` → CDN) |
| **Grouped automatically** | List is natively collapsed into unique FQDNs to maintain a clean layout |
| **NXDOMAIN highlighting** | DNS responses returning NXDOMAIN (non-existent domain) must be visually flagged in red — these are potential indicators of malware C2 beaconing or misconfiguration |
| **Search** | Free-text search on query name and resolved IP |
| **Export** | Export as CSV |

---

### 9.4 DHCP Monitor & Rogue Detection

**Purpose:** Provide visibility into DHCP address leasing and explicitly flag potential Man-in-the-Middle (MitM) attacks by detecting multiple active DHCP servers (Rogue DHCP) on the network.

**Display:** Split view containing a Top Summary row of DHCP Counters and a bottom detailed sortable table mapping leases.

**Summary Counters:**

| Metric | Description |
|--------|-------------|
| Discover | Total DHCP Discover broadcasts sent by clients |
| Offer | Total DHCP Offers returned by servers |
| Request | Total DHCP Request messages sent by clients |
| ACK / NAK | Total DHCP Acknowledges and Negative Acknowledges |
| Active Servers | Count of unique IP/MAC combinations sending DHCPOFFERs |
| **Rogue Warning** | Explicit visual warning (Red Shield) if `Active Servers > 1` |

**Table Columns:**

| Column | Description |
|--------|-------------|
| `Timestamp` | Capture timestamp |
| `DHCP Server IP` | The IP of the server offering the lease |
| `Server MAC` | The MAC address of the offering server (crucial for spoof validation) |
| `Client MAC` | The requesting client MAC address |
| `Offered IP` | The IP address being offered/assigned |
| `Transaction ID` | To map the DORA sequence |

**Required Features:**

| Feature | Description |
|---------|-------------|
| **Rogue DHCP / MitM Alerting** | Natively triggers a visual alert if multiple distinct Server IPs or MAC addresses are observed returning DHCPOFFER packets to clients (Classic MitM vector). |
| **DORA Sequence Matching** | Ability to filter the table to see the complete Discover -> Offer -> Request -> ACK flow for a specific client MAC. |
| **Export** | Export as CSV |

---

### 9.5 Alerts Feed (Sidebar)

**Purpose:** Automatically detect and surface security-relevant events, misconfigurations, and anomalies for immediate review by decision-makers perfectly aligned with the NIST Cybersecurity Framework.

**Display:** A dynamically scrolling feed permanently anchored in the Sidebar featuring severity badges, grouping, and expandable detail cards.

**Capabilities:**
- **Incident Triage (Acknowledge / Dismiss):** To prevent dashboard fatigue, analysts can click the "Acknowledge" button on any active alert. Acknowledged alerts instantly snap from a jarring Red/Yellow visual state to a muted Grey state, effectively "clearing the queue" similar to an enterprise SIEM.

**Severity Levels:**

| Severity | Color | Description |
|----------|-------|-------------|
| **Critical** | Red | Immediate action required (e.g., duplicate gateway IP) |
| **Warning** | Orange | Investigate soon (e.g., duplicate MAC on DHCP) |
| **Info** | Blue | Informational anomaly (e.g., unusual port) |

**Alert Categories & Detection Rules:**

| Alert Type | Detection Logic | Severity |
|------------|----------------|----------|
| **Duplicate IP Address** | Same IP appears in ARP or DHCP with two or more different MAC addresses within the capture window | Critical |
| **Duplicate MAC Address** | Same MAC address associated with two or more different IP addresses | Warning |
| **DHCP IP Conflict** | DHCP DISCOVER or REQUEST followed by a DHCP NAK, or two DHCP OFFERs for the same IP | Warning |
| **ARP Spoofing Indicator** | Gratuitous ARP packets where sender IP already maps to a different MAC in the ARP cache | Critical |
| **ICMP Flood** | >100 ICMP Echo Requests from one source in any 1-second window | Warning |
| **Port Scan Indicator** | Single source IP making TCP SYN connections to >15 unique destination ports within 5 seconds | Critical |
| **DNS Anomaly (NXDOMAIN)** | High volume of NXDOMAIN responses from a single client (>20 within the capture window) | Warning |
| **ICMP Tunneling Indicator** | ICMP packets with payload size >1000 bytes | Warning |
| **Unusual Protocol Port** | Known protocol detected on non-standard port (e.g., HTTP on port 8888, DNS on port 5353 externally) | Info |
| **Large DNS TXT Record** | DNS TXT record response >500 bytes (potential DNS exfiltration) | Warning |
| **Broadcast Storm Indicator** | Broadcast or multicast traffic exceeding 20% of total packet volume | Warning |
| **IPv6 Unexpected** | IPv6 traffic detected in a predominantly IPv4 environment (IPv6 < 5% of IP traffic) | Info |

**Required Features:**

| Feature | Description |
|---------|-------------|
| **Alert count badge** | Header shows total alert count with a red badge |
| **Expandable detail** | Each alert card expands to show: affected IPs/MACs, relevant packet indices, suggested action |
| **Suppress alert** | User can dismiss/suppress an alert with a reason (dismissed alerts are tracked in session) |
| **Filter by severity** | Toggle to show Critical only, Warnings only, Info only, or All |
| **Jump to source** | Button on each alert to jump to the relevant packet(s) in Pane 2 |
| **Export** | Export all alerts as a formatted CSV or PDF summary |

---

### 9.6 Actionable Insights (Sidebar)

**Purpose:** Bridge the gap between raw data and resolution by providing non-technical explanations and next-step recommendations for detected network behavior.

**Display:** A permanent feed located in the Sidebar situated directly beneath the Alerts feed.

**Display:** Card list, ordered by priority. Each card contains:
- An insight headline (bold, ≤15 words)
- A supporting data point (e.g., "147 DNS NXDOMAIN responses from 10.0.0.45")
- A recommended action in plain language
- A "Jump to..." button linking to the relevant pane or data

**Example Insights Generated:**

| Insight | Supporting Data | Recommended Action |
|---------|----------------|-------------------|
| "Possible ARP spoofing detected on the network" | IP 192.168.1.1 mapped to 2 different MACs | Inspect Alerts pane; validate gateway MAC |
| "Top talker consuming 42% of all traffic" | Host 10.0.0.15 sent 18,420 packets | Investigate application on this host |
| "Client making unusual DNS requests" | 10.0.0.45 generated 94 NXDOMAIN responses | Check for malware or misconfigured DNS client |
| "VoIP traffic detected — assess QoS policy" | 1,204 RTP packets with 3 active SIP sessions | Verify VoIP QoS markings are in place |
| "No HTTPS traffic observed — cleartext risk" | 0 TLS handshakes; 3,200 HTTP packets | Assess whether cleartext HTTP is acceptable |

---

### 9.7 Device Discovery & Topology (LLDP/CDP/FDP)

**Purpose:** Provide a reliable inventory of the physical infrastructure devices implicitly documented in the packet capture.

**Display:** "Pane 5" data table located at the bottom-left of the main dashboard grid.

**Mechanism:** The application parses Layer 2 discovery broadcasts—specifically **LLDP** (Link Layer Discovery Protocol), **CDP** (Cisco Discovery Protocol), and **FDP** (Foundry Discovery Protocol). 

**Table Columns:**

| Column | Description |
|--------|-------------|
| `System Name` | The broadcasted hostname of the switch, router, or appliance |
| `Device Type` | Categorized capability (e.g., Switch, Router, IP Phone, Access Point) |
| `Management IP` | The reported IP address for device administration |
| `Port ID / Name` | The physical port/interface identifier (e.g., `GigabitEthernet1/0/1`) |
| `Software Version`| The exact OS/firmware version broadcast by the device |
| `Protocol` | Whether the footprint came from LLDP, CDP, or FDP |

**Required Features:**
- Extracting this data provides decision-makers with instant visibility into vendor hardware (Cisco, Foundry/Brocade, generic LLDP) and outdated switches without needing SNMP access.

---

### 9.8 OUI Hardware Asset Inventory

**Purpose:** Provide a consolidated inventory of all physical devices on the network based on MAC address Organizational Unique Identifiers (OUIs), validating the hardware footprint.

**Display:** "Pane 6" data table located at the bottom-right of the main dashboard grid.

**Mechanism:** The application groups every unique MAC address seen in the capture by its IEEE registered OUI (using the automatic `sources/ieee-oui.txt` lookup), resolving the first 3 bytes of the MAC to its hardware vendor (e.g., Apple, Cisco, Dell).

**Table Columns:**

| Column | Description |
|--------|-------------|
| `Vendor Name` | The resolved OUI manufacturer name |
| `Device Count`| Number of unique MAC addresses observed belonging to this vendor |
| `Analyzed Types`| Cross-referenced classification string mapped from Pane 7 |

**Required Features:**
- **Pane 7 Cross-referencing:** Provides a user-friendly comparison to the data extracted in Pane 7. For example, if a MAC address resolves to `Philips Lighting BV` but the Pane 7 Discovery table labels it as a "Core Switch", it explicitly flags a massive red warning badge for MAC Spoofing/MitM.
- **Filtering:** Click on any vendor to filter the entire dashboard (e.g., clicking "Apple" instantly shows all Apple device traffic).

---

## 10. Protocol Classification Engine & Sidebar Analytics

The Protocol Classification engine populates the persistent visual analytics in the Sidebar. It performs three critical classifications:

### 10.1 High-Level Control/Data/Voice
All packets break down into three primary topologies:

| Category | Description | Example Protocols |
|----------|-------------|-------------------|
| **Control** | Topology, assignment, reachability | ARP, ICMP, ICMPv6, OSPF, STP, DHCP |
| **Data** | User or application payloads | TCP, UDP, HTTP, HTTPS, DNS, SSH, TLS |
| **Voice** | Real-time communications | SIP, RTP, RTCP, H.323, MGCP |

### 10.2 Cleartext vs. Encrypted Security Breakdown
The engine aggressively classifies payloads to populate a highly visible "Cleartext vs. Encrypted" donut chart in the Sidebar.
- **Encrypted Risk-Free:** e.g., TLS, HTTPS, SSH.
- **Cleartext Risk:** e.g., HTTP, Telnet, FTP.

### 10.3 Application Protocol Breakdown
The engine maps specific applications to display a secondary pie chart/list in the Sidebar showing exact service consumption (e.g., 40% HTTPS, 15% DNS, 10% RDP).

Classification badges must appear on all flows in Pane 2.

---

## 11. Interactive TCP/IP Stream Ladder Diagram

### 11.1 Purpose

When a user selects "Show Stream" on any connection in Pane 2, a modal overlay must display a **ladder diagram** (also called a sequence diagram or time-space diagram) that visually reconstructs the TCP/IP conversation between two endpoints.

### 11.2 Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Stream: 192.168.1.10:54321  ←→  8.8.8.8:443  (TCP/HTTPS)      │
│  Duration: 2.347s | Packets: 24 | Bytes: 18,420                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [192.168.1.10]              TIME                [8.8.8.8]       │
│       │                      ↓                       │           │
│       │──────────── SYN ──────────────────────────►  │           │
│       │  ◄───────── SYN-ACK ─────────────────────    │           │
│       │──────────── ACK ──────────────────────────►  │           │
│       │──────────── TLS ClientHello ──────────────►  │           │
│       │  ◄───────── TLS ServerHello ────────────────  │           │
│       │  ◄───────── TLS Certificate ────────────────  │           │
│       │──────────── TLS ClientKeyExchange ────────►  │           │
│       │  ◄───────── TLS [ChangeCipherSpec] ─────────  │           │
│       │  ◄───────── Application Data ───────────────  │           │
│       │──────────── FIN-ACK ──────────────────────►  │           │
│       │  ◄───────── FIN-ACK ────────────────────────  │           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 11.3 Functional Requirements

| Feature | Description |
|---------|-------------|
| **Packet labels** | Each arrow is labeled with protocol flags (SYN, ACK, FIN, RST), sequence number, and data size. SIP labels use a bold 13px font for readability. |
| **Timestamp axis** | Left-side vertical axis shows relative time from stream start |
| **Hover detail** | Hovering any arrow shows full packet metadata in a tooltip |
| **Scroll** | Vertically scrollable for long conversations |
| **Zoom** | Vertical zoom control to compress/expand the time scale |
| **Visual Weight** | High-visibility 2px flow lines and 0.5px reinforced lifelines for participants. |
| **Arrows** | Large, solid-filled triangular arrowheads (clip-path based) for immediate direction recognition. |
| **Color coding** | Client→Server arrows: blue; Server→Client arrows: green; RST/error packets: red |
| **Export** | "Export as SVG" and "Export as PNG" buttons |
| **TCP handshake highlighting** | The three-way handshake (SYN, SYN-ACK, ACK) is visually grouped with a light background band |
| **TLS detection** | If TLS is detected in the stream, application-layer data is shown as "Encrypted Payload" |

---

## 12. UI/UX Design Requirements

### 12.1 Landing / Upload Screen

- Full-screen landing view with a prominent centered drag-and-drop zone.
- Subtitle: "Upload a packet capture file to begin analysis."
- Supported formats shown as small text below the drop zone.
- Background: clean white (#FFFFFF) or light gray (#F5F5F7) with subtle gradient.
- No clutter; only the upload control and branding are visible.

### 12.2 Loading / Parsing State

- After file drop, the upload zone transitions smoothly into a parsing progress screen.
- Three-stage progress: "Reading file…" → "Parsing packets…" → "Running analysis…"
- Progress bar with percentage completion.
- Estimated time remaining (based on file size vs. packets parsed).
- Animated logo or subtle particle effect in the background (non-distracting).

### 12.3 Dashboard Screen

- **Top Header**: Features the **Packet Assistant** text alongside a custom, Apple-inspired minimalist logo (e.g., a polished, vibrant geometric wave/shield graphic) pinned to the top left. The right side features a **"Save/Import View State (.json)" button**, a prominent **"Export Report" button**, a dark mode toggle, and a settings gear.
- **Global Device Search**: Prominent search bar vertically centered in the header. Instantly filters all dashboard panes to isolate and visualize the communication streams of a specifically queried IP/MAC address.
- **Top Tabs**: Immediately below the header, a sleek segmented control cleanly separates the `Main Dashboard` view and the `Voice Analytics` view.
- **Timeline Scrubber Strip**: A full-width time-series sparkline allowing click-and-drag interactions for time-based data filtering.
- **Widget Panes**: Arranged dynamically using the user's preferred layout toggle between Sidebar Mode or a Classic Grid mode (see §8.1). Each pane sits on a clean card with a 12px border radius, subtle drop shadow, and an informative help (ℹ) tooltip.

### 12.4 Micro-interactions

| Interaction | Behavior |
|-------------|----------|
| Card hover | Subtle shadow deepening + 1px scale transform |
| Button press | 0.95 scale transform + color shift |
| Alert badge | Pulse animation on first render |
| New insight | Slide-in animation from bottom |
| Modal open | Fade + scale-in (0.95 → 1.0) |
| Modal close | Fade + scale-out |
| Table row hover | Background tint (#F0F4FF) |

### 12.5 Responsiveness

| Breakpoint | Layout |
|------------|--------|
| ≥ 1280px | 2-column 3-row dashboard grid |
| 768px – 1279px | 1-column stacked panes |
| < 768px | 1-column, simplified table views, chart thumbnails |

### 12.6 Accessibility

- Minimum contrast ratio: 4.5:1 (WCAG AA).
- All interactive elements must be keyboard-navigable with visible focus rings.
- ARIA labels on all charts and visualizations.
- Screen reader-friendly table structures.

### 12.7 Executive Reporting & PDF/DOCX Export

**Purpose:** Provide decision-makers with portable, high-fidelity compliance and security reports generated straight from the active dashboard analysis practically suited for executive distribution via PDF or Microsoft Word.

**Functionality:**
- When the **"Export Report"** button (located in the Top Header) is clicked, the application triggers a client-side document generation engine (e.g., `jspdf`, `html2canvas`, `docx`).
- **Multi-Format Export**: Full support for PDF and DOCX (Microsoft Word), including automated pagination, covers, and a **Dedicated Voice & SIP Quality Analysis Page** featuring visual bar charts and health scorecards.
- The user is prompted to select their preferred output format: `.pdf` or `.docx`.
- The engine dynamically stitches together a multi-page report containing:
  - **Cover Page:** The Packet Assistant Logo, the target capture file metadata, total packet volume, and a formalized report generation timestamp.
  - **Executive Summary:** Actionable text synthesized directly from the active **Actionable Insights Panel (Pane 6)**.
  - **Visualizations:** High-res image renders captured from the active layout, specifically the Top Talkers Geo-Map, the Security Cleartext vs. Encrypted donut chart, and the Application Breakdown pie chart. 
  - **Appendices / Details (Optional Toggle):** Snapshot data tables summarizing the Top 10 Heaviest Flows, the Top Alerting DNS Sites, the OUI Hardware Asset Inventory list, and the DHCP Rogue status.

### 12.8 Dashboard State Management (.json)

**Purpose:** Provide engineers with a fast, text-based method to share perfectly filtered investigations collaboratively without requiring persistent server backends.

**Functionality:**
- Clicking the **"Save View State"** button immediately generates and downloads a tiny `<filename>_state.json` file securely to the client's machine.
- This JSON preserves the exact mathematical viewport coordinates, active timeline zoom/crops, specific pane filter strings (e.g., "Apple"), and alert acknowledgment statuses.
- A second analyst can upload the identical `.pcapng` file alongside this `.json` file to instantly snap the entire React dashboard application into the precise investigative viewpoint of the original author.

---

## 13. React Application Architecture

### 13.1 Component Hierarchy

```
<App>
  ├── <ThemeProvider>           # Dark/light mode context
  ├── <DataProvider>            # Global parsed packet state
  ├── <UploadScreen>            # Landing + file upload
  │    └── <DropZone>
  │    └── <ParseProgress>
  └── <Dashboard>               # Main dashboard (rendered after parse)
       ├── <Header>
       │    ├── <CaptureMetaSummary>
       │    └── <GlobalSearch>
       ├── <VoiceAnalyticsPane>
       ├── <ProtocolDonutSummary>
       ├── <PaneGrid>
       │    ├── <TopTalkersPanePane>         # Pane 1
       │    ├── <ConnectionFlowPane>         # Pane 2
       │    ├── <DNSResponsePane>            # Pane 3
       │    ├── <ICMPInspectorPane>          # Pane 4
       │    ├── <AlertsPane>                 # Pane 5
       │    └── <ActionableInsightsPane>     # Pane 6
       └── <LadderDiagramModal>              # Triggered from Pane 2
```

### 13.2 State Management

| State Domain | Location | Description |
|---|---|---|
| `captureState` | Context | Raw parsed packets, file metadata |
| `analysisState` | Context | Aggregated outputs from each engine |
| `filterState` | Context | Global filters (Search Query, etc.) |
| `uiState` | Context | Modal open/close, active pane, dark mode |
| `alertState` | Context | Alert list, dismissed alerts |

### 13.3 Web Worker Strategy

Packet parsing must run in a dedicated Web Worker to prevent UI thread blocking:
- `workers/pcap-parser.worker.js` — Handles file reading and packet normalization.
- Progress messages posted back to main thread via `postMessage`.
- Analysis engines run in the main thread after worker completion (or in a second worker for large files > 50 MB).

---

## 14. Project Directory Structure

```
packet-analyzer/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header/
│   │   ├── VoiceAnalyticsPane/loadScreen/
│   │   ├── UploadScreen/
│   │   ├── Dashboard/
│   │   ├── panes/
│   │   │   ├── TopTalkersPane/
│   │   │   ├── ConnectionFlowPane/
│   │   │   ├── DNSResponsePane/
│   │   │   ├── ICMPInspectorPane/
│   │   │   ├── AlertsPane/
│   │   │   └── ActionableInsightsPane/
│   │   └── modals/
│   │       └── LadderDiagramModal/
│   ├── context/
│   │   ├── DataContext.jsx
│   │   ├── FilterContext.jsx
│   │   └── ThemeContext.jsx
│   ├── engines/
│   │   ├── topTalkersEngine.js
│   │   ├── connectionFlowEngine.js
│   │   ├── dnsEngine.js
│   │   ├── icmpEngine.js
│   │   ├── alertEngine.js
│   │   ├── insightsEngine.js
│   │   └── protocolClassifier.js
│   ├── workers/
│   │   └── pcap-parser.worker.js
│   ├── styles/
│   │   ├── design-tokens.css
│   │   └── global.css
│   ├── utils/
│   │   ├── formatBytes.js
│   │   ├── formatDuration.js
│   │   ├── ipUtils.js
│   │   └── portLookup.js
│   └── App.jsx
├── docs/
│   └── prd.md                    ← This document
├── sources/                      ← Auto-created at runtime; external reference data
│   ├── iana-service-names-port-numbers.csv
│   ├── iana-protocol-numbers.csv
│   ├── ieee-oui.txt
│   ├── iana-icmp-parameters.csv
│   └── iana-dns-parameters.csv
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 15. Non-Functional Requirements

### 15.1 Performance

| Metric | Target |
|--------|--------|
| Initial load time | < 3 seconds on a standard broadband connection |
| File parse time (10 MB PCAP) | < 5 seconds |
| File parse time (100 MB PCAP) | < 30 seconds |
| Dashboard render after parse | < 2 seconds |
| Table scroll frame rate | ≥ 60 fps |
| Chart interaction response | < 100ms |

### 15.2 Privacy & Security

- **All processing is client-side.** No packet data must ever be transmitted to an external server.
- The application must run entirely in the browser. No backend API calls for data analysis.
- Source reference file fetches (§6) are the only network calls the app makes — these should fetch metadata only, not transmit user data.
- File contents must be cleared from memory when a new file is uploaded or when the user explicitly clears the session.

### 15.3 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 110+ |
| Firefox | 110+ |
| Safari | 16.4+ |
| Edge | 110+ |

### 15.4 Scalability

- Application must handle captures up to 500 MB without crashing the browser tab.
- For captures > 100k packets, enable virtualized table rendering (windowed list) using `react-window` or `react-virtual` to maintain performance.

---

## 16. Acceptance Criteria

### 16.1 File Ingestion

- [x] Application accepts `.pcapng`, `.pcap`, `.enc`, `.txt`, and `.log` files via drag-and-drop and file picker.
- [x] Application validates file format and shows a clear error for invalid files.
- [x] Parsing progress is displayed and the UI is not frozen during parsing.
- [x] Upon successful parse, the dashboard renders with all six panes populated.

### 16.2 Dashboard

- [x] Voice Analytics Tab displays accurate signaling flows and is filterable.
- [x] Protocol summary donut shows correct Control / Data / Voice breakdown.
- [x] All six panes render with correct data derived from the uploaded capture.
- [x] Dark mode toggle works and persists across page reload (localStorage).
- [x] Global search filters results across all panes simultaneously.

### 16.3 Top Talkers Pane

- [x] Bubble/sunburst chart renders correctly with accurate host volumes.
- [x] Clicking a host node filters other panes to that host's traffic.
- [x] Top N control updates chart in real time.
- [x] Export to PNG and CSV functions correctly.

### 16.4 Connection Flow Explorer

- [x] All flows appear in the table with correct src/dst IP, ports, protocol, and category.
- [x] Drill-down panel shows correct per-packet detail for the selected flow.
- [x] "Show Stream" opens the Ladder Diagram modal for the correct flow.
- [x] Table sorts, filters, and paginates correctly.

### 16.5 DNS Response Monitor

- [x] Only DNS response records (not queries) are shown.
- [x] NXDOMAIN entries are visually flagged.
- [x] Domain category auto-tagging applies to recognizable domains.
- [x] "Unique domains" toggle collapses duplicates correctly.

### 16.6 ICMP Traffic Inspector

- [x] All ICMP packets appear in the table with correct type/code labels.
- [x] Echo Request / Reply pairs are matched and RTT shown.
- [x] Large-payload ICMP packets are flagged.
- [x] Summary statistics bar is accurate.

### 16.7 Alerts & Anomaly Detection

- [x] Duplicate IP addresses are detected and shown as Critical alerts.
- [x] Duplicate MAC addresses are detected and shown as Warning alerts.
- [x] ARP spoofing indicators trigger Critical alerts.
- [x] Port scan indicators are detected and flagged.
- [x] All alerts are dismissible; dismissed alerts track in session state.
- [x] "Jump to..." links navigate to relevant data in other panes.

### 16.8 Actionable Insights

- [x] At least one insight is generated for any non-trivial capture file.
- [x] Each insight includes a headline, supporting data point, and recommended action.
- [x] "Jump to..." buttons navigate to the relevant pane.

### 16.9 Ladder Diagram

- [x] Diagram renders correctly for any selected TCP/UDP flow.
- [x] Packets are correctly ordered chronologically.
- [x] Hover tooltips display full packet metadata.
- [x] TCP three-way handshake is visually grouped.
- [x] Export as SVG and PNG work correctly.

### 16.10 Non-Functional

- [x] A 10 MB capture file parses in under 5 seconds on a modern laptop.
- [x] No packet data is transmitted to any external server.
- [x] Application passes WCAG AA accessibility audit.
- [x] Application is fully functional in Chrome 110+, Firefox 110+, Safari 16.4+.

---

## 17. Open Questions & Dependencies

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | What is the expected maximum file size in production? Does 500 MB cover real-world use cases, or do we need streaming/chunked parsing? | Carlo | Closed (500MB max) |
| 2 | Should the `.enc` format require a decryption key input from the user, or should it display only what is visible in plaintext? | Carlo | Closed (Plaintext only) |
| 3 | Is there a need for persistent sessions (save analysis state between page reloads)? If so, should this use IndexedDB? | Carlo | Closed (No persistent sessions) |
| 4 | Should the application support uploading multiple capture files simultaneously for side-by-side comparison? | Carlo | Closed (Single file only) |
| 5 | Are there specific compliance frameworks (e.g., HIPAA, PCI-DSS) the alerts engine should reference for anomaly classification? | Carlo | Closed (NIST CSF) |
| 6 | Is offline operation (PWA / Service Worker caching) a requirement? | Carlo | Closed (Not required) |
| 7 | What is the target deployment environment? (Static hosting, Electron app, internal server?) | Carlo | Closed (Enterprise internal network) |
| 8 | Should the Actionable Insights panel be LLM-augmented in a future version, or purely rule-based? | Carlo | Closed (LLM / AI-augmented) |

---

*End of Document — Packet Assistant PRD v1.0*

---
> **Revision History**
>
> | Version | Date | Author | Changes |
> |---------|------|--------|---------|
> | 1.0 | 2026-03-26 | Carlo Raineri | Initial draft |
> | 1.1 | 2026-03-26 | AI Assistant | Resolved all Open Questions and finalized implementation scope |
> | 1.2 | 2026-03-26 | AI Assistant | Broadened scope wording to 'ICMP and/or anomalies' across use cases |
> | 1.3 | 2026-03-26 | AI Assistant | Specified Global Device Search to isolate IP/MAC communication streams |
> | 1.4 | 2026-03-26 | AI Assistant | Refactored layout for a more robust sidebar structure; Updated DNS pane to an aggregated FQDN list format |
> | 1.5 | 2026-03-26 | AI Assistant | Added configurable Layout Toggle allowing users to swap between Sidebar and Classic Grid formats |
> | 1.6 | 2026-03-26 | AI Assistant | Replaced Analysis Strip with an Interactive Timeline Scrubber |
> | 1.7 | 2026-03-26 | AI Assistant | Integrated Geo-Map, Cleartext vs Encrypted breakdown, and App Protocol widgets |
> | 1.8 | 2026-03-26 | AI Assistant | Implemented automatic update and integrity check requirements for External Knowledge Sources |
> | 1.9 | 2026-03-26 | AI Assistant | Added requirement for Fallback Behavior to explicitly generate a downloadable plaintext `.txt` error log if a fetch/integrity check fails |
> | 1.10| 2026-03-26 | AI Assistant | Explicitly specified dual-support for both Drag-and-Drop and File Browsing for the initial upload UI |
> | 1.11| 2026-03-27 | AI Assistant | Added an interactive user prompt for updates to External Knowledge Sources, allowing the user to skip the update or reload the app |
> | 1.12| 2026-03-27 | AI Assistant | Integrated dedicated Voice Analytics Suite featuring SIP ladder diagrams and documentation retrieval |
> | 1.13| 2026-03-27 | AI Assistant | Renamed application to Packet Assistant and updated Header logo requirements |
> | 1.14| 2026-03-27 | AI Assistant | Replaced ICMP functionality with DHCP Monitor & Rogue DHCP/MitM Detection across the architecture |
> | 1.15| 2026-03-27 | AI Assistant | Added Pane 7 at the bottom of the layout to aggregate device topology using LLDP, CDP, and FDP parsers |
> | 1.16| 2026-03-27 | AI Assistant | Added Pane 8 to consolidate MAC addresses by IEEE OUI and cross-reference them against device types found in Pane 7 |
> | 1.17| 2026-03-27 | AI Assistant | Added Executive Reporting & PDF/DOCX Export generation capabilities to consolidate and export dashboard visualizations and metadata |
> | 1.18| 2026-03-27 | AI Assistant | Consolidated the Grid back to a seamless 6-Pane layout by permanently pinning Alerts and Insights to the Sidebar navigation. Added .json Dashboard State Save/Load and Alert Acknowledgment mechanisms. |
> | 1.19| 2026-03-27 | AI Assistant | Successfully reverted dashboard to a stable, symmetrical 3x2 Grid for enhanced UX. Pre-installed RFC library (3261, 4566, 3550) into local assets to eliminate redundant external downloads. |
> | 1.20| 2026-03-27 | AI Assistant | Integrated MOS Call Quality Scoring, SIP Method Distribution analytics, and User-Agent/Endpoint Profiling into the Voice Analytics suite. |
> | 1.21| 2026-03-27 | AI Assistant | Implemented "Voice Health Pulse" sidebar widget for global situational awareness and expanded Executive Reporting to include a dedicated Voice Network Quality analysis page. |
> | 1.22| 2026-03-28 | AI Assistant | Finalized all Acceptance Criteria and verified feature parity across the packet analysis engine. |
