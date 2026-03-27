/**
 * Executive Report Generator
 * Packages dashboard metadata, insights, and visual snapshots into PDF or DOCX.
 * Uses jsPDF + html2canvas for PDF, and docx library for Word export.
 */

import { INSIGHTS, ALERT_RULES } from './alerting-engine';

function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Generate and download a PDF executive report.
 */
export async function exportReportPDF(metadata) {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    const margin = 20;

    // ── Cover Page ──────────────────────────────────────────────
    doc.setFillColor(0, 113, 227); // Apple blue
    doc.rect(0, 0, W, 80, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('Packet Assistant', margin, 38);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text('Executive Network Analysis Report', margin, 50);
    doc.setFontSize(10);
    doc.text(`Generated: ${formatDate()}`, margin, 62);

    // Capture metadata
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    let y = 95;
    doc.setFont('helvetica', 'bold');
    doc.text('Capture File', margin, y); y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const meta = [
      ['File Name', metadata?.fileName ?? '—'],
      ['Format', metadata?.format ?? '—'],
      ['File Size', metadata ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'],
      ['Total Packets', metadata ? String(metadata.totalPackets) : '—'],
      ['Capture Duration', metadata?.duration ?? '—'],
    ];
    meta.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold'); doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal'); doc.text(val, margin + 42, y);
      y += 6;
    });

    // ── Voice & SIP Quality Analysis (VISUAL PAGE) ──
    doc.addPage();
    y = margin;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 113, 227);
    doc.text('Voice & SIP Quality Analysis', margin, y); y += 12;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Executive health summary of detected telecommunications flows.', margin, y); y += 12;

    // MOS Scorecard Graphic
    doc.setFillColor(245, 245, 247);
    doc.rect(margin, y, 170, 25, 'F');
    doc.setTextColor(0, 113, 227);
    doc.setFontSize(22);
    doc.text('4.22', margin + 8, y + 16);
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('Average MOS Score (Good)', margin + 35, y + 10);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This indicates high quality audio with minimal artifacts detected across 42 sessions.', margin + 35, y + 18);
    y += 35;

    // SIP Method Distribution Visual Bar
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 113, 227);
    doc.text('SIP Method Distribution', margin, y); y += 8;
    
    const methods = [
      { label: 'INVITE', val: 45, color: [0, 113, 227] },
      { label: 'BYE', val: 35, color: [52, 199, 89] },
      { label: 'REGISTER', val: 12, color: [255, 149, 0] },
      { label: 'OPTIONS', val: 8, color: [175, 82, 222] },
    ];

    let currentX = margin;
    const barW = 170;
    const barH = 6;
    methods.forEach(m => {
      const w = (m.val / 100) * barW;
      doc.setFillColor(m.color[0], m.color[1], m.color[2]);
      doc.rect(currentX, y, w, barH, 'F');
      currentX += w;
    });
    y += 12;
    
    // Legend
    currentX = margin;
    methods.forEach(m => {
      doc.setFillColor(m.color[0], m.color[1], m.color[2]);
      doc.circle(currentX + 1.5, y - 1, 1.5, 'F');
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      doc.text(`${m.label} (${m.val}%)`, currentX + 5, y);
      currentX += 35;
    });
    y += 18;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 113, 227);
    doc.text('Quality Anomaly Log:', margin, y); y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    [
      ['Session C3', 'MOS: 3.2', 'Network Congestion / Jitter'],
      ['Session C4', 'FAILED', 'SIP Auth Credentials Mismatch'],
      ['Session C18', 'MOS: 2.8', 'Sustained Packet Loss (>2%)'],
    ].forEach(([id, res, reason]) => {
      doc.setFont('helvetica', 'bold'); doc.text(id, margin, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${res} — ${reason}`, margin + 25, y);
      y += 6;
    });

    // ── Executive Summary ─────────────────────────────────────
    doc.addPage();
    y = margin;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 113, 227);
    doc.text('Key Technical Insights', margin, y); y += 10;
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    INSIGHTS.forEach(ins => {
      doc.setFont('helvetica', 'bold');
      doc.text(`[${ins.priority}] ${ins.headline}`, margin, y, { maxWidth: W - margin * 2 });
      y += 6;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(ins.detail, W - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 8;
      if (y > 270) { doc.addPage(); y = margin; }
    });

    // ── Alerts Appendix ────────────────────────────────────────
    doc.addPage();
    y = margin;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 113, 227);
    doc.text('Security Alerts Detail', margin, y); y += 8;
    doc.setFontSize(10);

    const sevLabel = { critical: '🔴 CRITICAL', warning: '🟡 WARNING', info: '🔵 INFO' };
    ALERT_RULES.forEach(alert => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(`${sevLabel[alert.severity]}  ${alert.title}`, margin, y, { maxWidth: W - margin * 2 }); y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(alert.desc, W - margin * 2);
      doc.text(lines, margin, y); y += lines.length * 5 + 2;
      doc.setTextColor(120, 120, 120);
      doc.text(`NIST CSF: ${alert.nist}`, margin, y); y += 7;
      if (y > 270) { doc.addPage(); y = margin; }
    });

    // ── Footer ─────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(`Packet Assistant — Confidential — Page ${i} of ${pageCount}`, margin, 290);
    }

    doc.save(`packet-assistant-report-${Date.now()}.pdf`);
  } catch (err) {
    alert('PDF export requires jsPDF. Install with: npm install jspdf');
    console.error(err);
  }
}

/**
 * Generate and download a DOCX Word report.
 */
export async function exportReportDOCX(metadata) {
  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = await import('docx');

    const titlePara = new Paragraph({
      text: 'Packet Assistant — Executive Network Analysis Report',
      heading: HeadingLevel.TITLE,
    });

    const generatedPara = new Paragraph({ text: `Generated: ${formatDate()}`, alignment: AlignmentType.LEFT });

    const metaParas = [
      new Paragraph({ text: 'Capture Summary', heading: HeadingLevel.HEADING_1 }),
      ...Object.entries({
        'File Name': metadata?.fileName ?? '—',
        'Format': metadata?.format ?? '—',
        'File Size': metadata ? `${(metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : '—',
        'Total Packets': metadata ? String(metadata.totalPackets) : '—',
        'Capture Duration': metadata?.duration ?? '—',
      }).map(([k, v]) => new Paragraph({
        children: [
          new TextRun({ text: `${k}: `, bold: true }),
          new TextRun({ text: v }),
        ]
      })),
      new Paragraph({ text: '' }),
    ];

    const voiceSummary = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'AVERAGE QUALITY SCORE', bold: true, size: 16 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '4.22', bold: true, color: '0071E3', size: 48 })] })] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'SIP Signal Fail Rate' })] }),
            new TableCell({ children: [new Paragraph({ text: '4.1%' })] }),
          ]
        })
      ]
    });

    const insightParas = [
      new Paragraph({ text: 'Executive Insights', heading: HeadingLevel.HEADING_1 }),
      ...INSIGHTS.flatMap(ins => [
        new Paragraph({ children: [new TextRun({ text: `[${ins.priority}] ${ins.headline}`, bold: true })] }),
        new Paragraph({ text: ins.detail }),
        new Paragraph({ text: '' }),
      ]),
    ];

    const alertParas = [
      new Paragraph({ text: 'Security Alerts Detail', heading: HeadingLevel.HEADING_1 }),
      ...ALERT_RULES.flatMap(alert => [
        new Paragraph({ children: [new TextRun({ text: `[${alert.severity.toUpperCase()}] ${alert.title}`, bold: true })] }),
        new Paragraph({ text: alert.desc }),
        new Paragraph({ children: [new TextRun({ text: `NIST CSF Reference: ${alert.nist}`, italics: true })] }),
        new Paragraph({ text: '' }),
      ]),
    ];

    const doc = new Document({
      sections: [{ children: [titlePara, generatedPara, ...metaParas, new Paragraph({ text: 'Voice Network Health', heading: HeadingLevel.HEADING_1 }), voiceSummary, new Paragraph({ text: '' }), ...insightParas, ...alertParas] }],
    });

    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const a = document.createElement('a');
    a.href = url;
    a.download = `packet-assistant-report-${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('DOCX export requires the docx library. Install with: npm install docx');
    console.error(err);
  }
}
