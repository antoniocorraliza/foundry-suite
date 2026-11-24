import { describe, expect, it } from 'vitest';
import type { FoundryCsvTable } from '../interfaces/foundry-csv-table.interface';
import { parseCsv } from './parse-csv.function';

describe('parseCsv on Node', () => {
  it('reads 50,000 rows of 20 columns within the default time of a test', () => {
    const headers: Array<string> = Array.from({ length: 20 }, (_value, index) => `Columna ${index + 1}`);
    const line: string = headers.map((_header, index) => (index % 5 === 0 ? `"texto, ${index}"` : `${index},5`)).join(';');
    const text: string = [headers.join(';'), ...Array.from({ length: 50_000 }, () => line)].join('\r\n');
    const table: FoundryCsvTable = parseCsv(text);
    expect(table.delimiter).toBe(';');
    expect(table.rows).toHaveLength(50_000);
    expect(table.rows[49_999]?.['Columna 1']).toBe('texto, 0');
  });
});
