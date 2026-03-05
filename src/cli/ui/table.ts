import { theme, colors } from './colors.js';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  [key: string]: string;
}

export function table<T extends TableRow>(columns: TableColumn<T>[], rows: T[]): void {
  const colWidths = columns.map((col) => {
    const key = col.key as string;
    const headerWidth = col.header.length;
    const dataWidth = Math.max(...rows.map((row) => String(row[key] ?? '').length));
    return Math.max(headerWidth, dataWidth, col.width ?? 0);
  });

  const headerRow = columns
    .map((col, i) => {
      const text = col.header.padEnd(colWidths[i]);
      return theme.table.header(text);
    })
    .join(' │ ');

  const separator = colWidths.map((w) => '─'.repeat(w)).join('─┼─');

  console.log(`┌${separator.replace(/│/g, '┬').replace(/┼/g, '┬')}┐`);
  console.log(`│ ${headerRow} │`);
  console.log(`├${separator.replace(/│/g, '┼').replace(/┼/g, '┼')}┤`);

  for (const row of rows) {
    const rowStr = columns
      .map((col, i) => {
        const key = col.key as string;
        let text = String(row[key] ?? '');
        const align = col.align ?? 'left';
        if (align === 'right') {
          text = text.padStart(colWidths[i]);
        } else if (align === 'center') {
          text = text.padStart(Math.floor((colWidths[i] + text.length) / 2)).padEnd(colWidths[i]);
        } else {
          text = text.padEnd(colWidths[i]);
        }
        return theme.table.row(text);
      })
      .join(' │ ');
    console.log(`│ ${rowStr} │`);
  }

  console.log(`└${separator.replace(/│/g, '┴').replace(/┼/g, '┴')}┘`);
}

export function simpleTable(rows: string[][], headers?: string[]): void {
  if (rows.length === 0) return;
  
  const colWidths = rows[0].map((_, i) =>
    Math.max(...rows.map((r) => (r[i] ?? '').length), headers ? headers[i]?.length ?? 0 : 0)
  );

  if (headers) {
    const headerRow = headers.map((h, i) => theme.table.header(h.padEnd(colWidths[i]))).join(' │ ');
    const separator = colWidths.map((w) => '─'.repeat(w)).join('─┼─');
    console.log(`┌${separator.replace(/│/g, '┬')}┐`);
    console.log(`│ ${headerRow} │`);
    console.log(`├${separator.replace(/│/g, '┼')}┤`);
  }

  for (const row of rows) {
    const rowStr = row.map((cell, i) => theme.table.row(String(cell).padEnd(colWidths[i]))).join(' │ ');
    console.log(`│ ${rowStr} │`);
  }

  const separator = colWidths.map((w) => '─'.repeat(w)).join('─┼─');
  console.log(`└${separator.replace(/│/g, '┴')}┘`);
}
