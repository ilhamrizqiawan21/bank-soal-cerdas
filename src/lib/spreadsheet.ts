import { readSheet } from 'read-excel-file/browser';
import writeXlsxFile, { type SheetData } from 'write-excel-file/browser';

type SpreadsheetCell = string | number | boolean | Date | null;

const stringifyCell = (value: SpreadsheetCell): string => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }

  values.push(value.trim());
  return values;
};

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let line = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      line += char + nextChar;
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (line.trim()) rows.push(parseCsvLine(line));
      line = '';
      if (char === '\r' && nextChar === '\n') index += 1;
    } else {
      line += char;
    }
  }

  if (line.trim()) rows.push(parseCsvLine(line));
  return rows;
};

const rowsToRecords = (rows: SpreadsheetCell[][]): Record<string, string>[] => {
  const [headerRow, ...dataRows] = rows;
  if (!headerRow) return [];

  const headers = headerRow.map(stringifyCell);

  return dataRows
    .filter((row) => row.some((cell) => stringifyCell(cell).trim() !== ''))
    .map((row) =>
      headers.reduce<Record<string, string>>((record, header, index) => {
        if (header) record[header] = stringifyCell(row[index] ?? null);
        return record;
      }, {})
    );
};

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

export const readSpreadsheetRecords = async (file: File): Promise<Record<string, string>[]> => {
  if (file.name.toLowerCase().endsWith('.csv')) {
    return rowsToRecords(parseCsv(await readFileAsText(file)));
  }

  const rows = await readSheet(file);
  return rowsToRecords(rows as SpreadsheetCell[][]);
};

export const writeSpreadsheet = async (
  rows: Record<string, string | number | boolean | null | undefined>[],
  fileName: string,
  sheetName: string
) => {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const sheetData: SheetData = [
    headers.map((header) => ({ value: header, fontWeight: 'bold' })),
    ...rows.map((row) => headers.map((header) => row[header] ?? '')),
  ];

  await writeXlsxFile(sheetData, {
    sheet: sheetName,
  }).toFile(fileName);
};
