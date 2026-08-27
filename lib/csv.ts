/** Minimal CSV parser: handles quoted fields containing commas/newlines, no external deps. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') { inQuotes = true; continue; }
    if (char === ',') { row.push(field.trim()); field = ''; continue; }
    if (char === '\r') continue;
    if (char === '\n') {
      row.push(field.trim());
      field = '';
      if (row.some(f => f !== '')) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  if (field !== '' || row.length > 0) {
    row.push(field.trim());
    if (row.some(f => f !== '')) rows.push(row);
  }

  return rows;
}

/** Turns parsed CSV rows (header + data) into objects keyed by lowercased header names. */
export function csvRowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const header = rows[0].map(h => h.toLowerCase());
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    header.forEach((key, i) => { obj[key] = row[i] ?? ''; });
    return obj;
  });
}
