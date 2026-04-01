# Implementation Plan: Packet Assistant

This implementation plan is broken down into 5 progressive phases based on the PRD. Every phase represents a shippable milestone that delivers immediate, demonstrable value to the customer—moving from foundational file ingestion to advanced, executive-ready insights.

---

## Phase 1: Foundation & Core Parsing
**Customer Value:** The application can seamlessly and securely ingest industry-standard packet capture files locally in the browser. This demonstrates the core capability to handle potentially sensitive network files without relying on a cloud backend, ensuring privacy and immediate data access.

- [x] Initialize React 18+ application with Vite and Tailwind CSS.
- [x] Set up the robust sidebar architecture and dynamic main content layout utilizing the Apple-inspired design system tokens, including a user-configurable toggle to switch between the modern sidebar layout and a classic 6-pane grid layout.
- [x] Implement a dual-action File Upload UI featuring both a prominent Drag-and-Drop zone and a native filesystem Browse button, complete with format validation for `.pcap`, `.pcapng`, `.enc` (plaintext parsing only), `.txt`, and `.log`.
- [x] Enforce a 500MB maximum file size limit and restrict the interface to single-file uploads (no side-by-side comparison).
- [x] Integrate a Web Worker strategy (`pcap-parser.worker.js`) to parse PCAP files off the main UI thread, ensuring the app remains responsive.
- [x] Normalize parsed packets into the standardized internal JSON schema and expose them via the global `DataContext`.
- [x] Present a basic "Upload Summary" header detailing target filename, execution format, filesize, parsed packet count, and timestamp range.

---

## Phase 2: Basic Visibility & Flow Analysis
**Customer Value:** Users go from unstructured raw packets to an organized, searchable inventory. They can instantly see "who is talking to whom" and identify the top bandwidth consumers (Top Talkers) on their network, providing immediate situational awareness.

- [x] Integrate a "Voice Health Pulse" widget into the main dashboard sidebar for global situational awareness.
- [x] Expand the "Executive Reporting Engine" (Phase 4) to include a dedicated **Voice Quality & SIP Analysis Page** with visual bar charts and scorecards in both PDF and DOCX outputs.
- [x] Implement the Interactive Traffic Timeline Scrubber (sparkline) to visualize traffic volume over time and allow users to intuitively filter specific time windows.
- [x] Implement the "Voice & SIP Analytics Tab" as a completely separate dashboard view, featuring a **Failed SIP Sessions** directory (E.164 based with From/To analysis), SIP Method Distribution analytics, and automated MOS quality analysis.
- [x] Harmonize parsing engines and UI to prioritize **E.164 phone numbers** over network IP addresses across all telephony diagnostic views.
- [x] Build the robust Protocol Classification Engine & Sidebar Analytics (categorizing traffic into Control, Data, and Voice).
- [x] Implement the "Cleartext vs. Encrypted" security donut chart in the Sidebar to visually expose insecure payloads.
- [x] Implement the Application Protocol Breakdown pie chart/list in the Sidebar to display specific application service consumption (e.g., HTTPS, DNS, RDP).
- [x] Develop the "Connection Flow Explorer" table with search, sorting, and pagination.
- [x] Implement a Global Device Search box in the header to filter packets globally for specific IP or MAC addresses and instantly isolate their communication streams.
- [x] Integrate visual badges distinguishing between IPv4 and IPv6 traffic.
- [x] Develop the "Top Talkers & Geo-Location Map" visualization pane, allowing users to toggle between a volume-based bubble chart and a geographic map resolving public IPs to destination countries/cities.
- [x] Implement foundational drill-down capability from the flow table to view basic underlying packet details.

---

## Phase 3: Deep Dive into DNS, DHCP & Device Discovery
**Customer Value:** Network intent and hardware topology become visible without active agents. DNS and DHCP monitoring expose external resource access and internal MitM vectors perfectly. Parsing Layer 2 Discovery packets paints a highly valuable picture of the underlying infrastructure hardware mapping.

- [x] Implement the runtime update prompt and integrity checking mechanism (`sources/`) for external IANA/IEEE data, utilizing ETag/Last-Modified headers to verify updates and prompting the user to either update and restart or skip.
- [x] Build a fallback failure utility that instantly generates and allows downloading of a readable `.txt` error log if the knowledge source network fetch or integrity check fails.
- [x] Build the "DNS Sites & FQDN List" pane to present an aggregated list of unique sites, expanding to reveal querying clients and resolved IPs, while explicitly flagging failed resolutions (`NXDOMAIN`).
- [x] Add domain category auto-tagging heuristics for recognizable traffic (e.g., categorizing major CDNs or search engines).
- [x] Build the "DHCP Monitor & Rogue Detection" pane to display Discover, Offer, Request, and ACK counters.
- [x] Implement Man-in-the-Middle (MitM) logic to throw an immediate visual warning if multiple unique DHCP server IP/MACs are returning DHCPOFFERs.
- [x] Build the "Pane 5" interface for Device Discovery, populating it by parsing broadcasted LLDP, CDP, and FDP packets.
- [x] Build the "Pane 6" OUI Hardware Asset Inventory pane to consolidate MAC addresses by vendor and explicitly cross-reference mismatches against Pane 5 discovery data.
- [x] Enable cross-pane interactivity: clicking a host in the Top Talkers chart or a Vendor in Pane 6 automatically filters all relevant panels.

---

## Phase 4: Security Alerts & Automated Insights
**Customer Value:** The dashboard transitions from a data exploration tool into an automated decision-support engine. Even non-technical decision-makers can instantly review plain-language recommendations and flagged security anomalies (like IP conflicts or port scans).

- [x] Build the robust Alerting Engine to automatically assess rules (e.g., Duplicate IPs, ARP spoofing, high-volume ICMP flooding) aligned to the NIST Cybersecurity Framework (CSF).
- [x] Implement the "Alerts & Anomaly Detection" scrollable feed with recognizable severity badges (Critical, Warning, Info).
- [x] Develop the "Actionable Insights Panel" to synthesize dashboard data into top priority, plain-language recommendations (designed to be LLM/AI-augmented).
- [x] Ensure every alert and insight includes a contextual "Jump to..." action link, bringing the user precisely to the supporting packet flow.
- [x] Allow users to dismiss/suppress alerts during an active session.
- [x] Integrate global data export capabilities (CSV/PNG) allowing users to easily generate offline reports.

---

## Phase 5: Advanced Interactive Visualization & Polish
**Customer Value:** True deep packet inspection meets premium user experience. Network engineers can troubleshoot specific communication streams step-by-step, while the entire application feels undeniably polished, fast, and enterprise-grade.

- [x] Build the interactive "TCP/IP Stream Ladder Diagram" modal utilizing D3.js, featuring **high-visibility 2px flow lines** and **solid-filled triangular arrowheads** for maximum clarity.
- [x] Integrate TCP handshake visual grouping and TLS payload detection indicators within the ladder diagram.
- [x] Build the "Executive Reporting Engine" capable of packaging dashboard visualizations (via `html2canvas`), captured metadata, and actionable insights into a formally styled, downloadable `.pdf` or `.docx` document.
- [x] Apply system-level Dark Mode support (`prefers-color-scheme`) with a manual toggle in the main header.
- [x] Perfect the UI/UX micro-interactions (e.g., frosted glass blur effects, smooth panel transitions, subtle card hover shadows).
- [x] Implement list virtualization (`react-window` or equivalent) for table components scaling up to 100k+ packets smoothly.
- [x] Implement **Global Accessibility Scaling**: Enforced a `16px` baseline font size across all modules, increased Sidebar width to `320px` to prevent metadata truncation, and established a consistent `500px` minimum pane height for optimal grid visual balance.
- [x] Deploy **Unified Protocol Visual Tokens**: Synchronized protocol percentage labels with their respective category bullets (e.g., Purple for DNS, Amber for SMB) using shared color definitions across the Analysis Worker, Sidebar summary, and main dashboard grid to enhance cognitive pattern recognition.
- [x] Finalize the application build optimized for deployment within an enterprise internal network environment.
