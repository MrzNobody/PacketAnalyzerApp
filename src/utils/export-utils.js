/**
 * export-utils.js
 * Client-side CSV and PNG export utilities
 */

/**
 * Export any array of objects to a CSV file download.
 */
export function exportCSV(data, filename = 'packet-assistant-export.csv') {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h] ?? '';
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Capture a DOM element as a PNG via Canvas and download it.
 */
export async function exportPNG(elementId, filename = 'packet-assistant-chart.png') {
  // html2canvas is loaded lazily — will be installed in Phase 5
  try {
    const { default: html2canvas } = await import('html2canvas');
    const el = document.getElementById(elementId);
    if (!el) { alert(`Element #${elementId} not found.`); return; }
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch {
    alert('PNG export requires html2canvas. Install with: npm install html2canvas');
  }
}
