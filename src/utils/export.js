/**
 * Export filtered samples as CSV.
 */
export function exportCSV(samples) {
  const headers = ['Name', 'Path', 'Format', 'Duration', 'Size', 'BPM', 'Key', 'Tags', 'Favorite'];
  const rows = samples.map((s) => [
    escapeCsv(s.name),
    escapeCsv(s.path),
    s.format,
    s.duration?.toFixed(3) || '',
    s.size || '',
    s.bpm || '',
    s.key || '',
    escapeCsv(s.tags.join(', ')),
    s.favorite ? 'Yes' : 'No',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const bom = '\uFEFF';
  downloadFile(`samplevault-export-${Date.now()}.csv`, bom + csv, 'text/csv;charset=utf-8');
}

/**
 * Export filtered samples as JSON.
 */
export function exportJSON(samples) {
  const data = samples.map((s) => ({
    name: s.name,
    path: s.path,
    format: s.format,
    duration: s.duration,
    size: s.size,
    bpm: s.bpm,
    key: s.key,
    tags: s.tags,
    favorite: s.favorite,
  }));

  const json = JSON.stringify(data, null, 2);
  downloadFile(`samplevault-export-${Date.now()}.json`, json, 'application/json');
}

function escapeCsv(val) {
  if (!val) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
