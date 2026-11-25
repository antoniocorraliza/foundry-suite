import { ɵisOptionsValue, ɵparseBooleanOption, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { BYTE_ORDER_MARK } from '../constants/byte-order-mark.constant';
import { CSV_DELIMITERS } from '../constants/csv-delimiters.constant';
import { CSV_PARSE_DELIMITERS } from '../constants/csv-parse-delimiters.constant';
import { DECIMAL_COMMA_PATTERN, DELIMITER_SAMPLE_LINES } from '../constants/csv-reading.constant';
import { FORMULA_ESCAPINGS } from '../constants/formula-escapings.constant';
import { ESCAPED_FORMULA_PATTERN } from '../constants/formula-patterns.constant';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { CsvCursor } from '../interfaces/csv-cursor.interface';
import type { CsvRecord } from '../interfaces/csv-record.interface';
import type { CsvRecordsReading } from '../interfaces/csv-records-reading.interface';
import type { CsvTextSplit } from '../interfaces/csv-text-split.interface';
import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';
import type { CsvFormulaEscaping } from '../types/csv-formula-escaping.type';
import type { CsvParseDelimiter } from '../types/csv-parse-delimiter.type';
import type { FoundryCsvDelimiter } from '../types/foundry-csv-delimiter.type';

function isLineBreak(character: string | undefined): boolean {
  return character === '\r' || character === '\n';
}

function moveCursorPastLineBreak(text: string, cursor: CsvCursor): void {
  cursor.position += text.startsWith('\r\n', cursor.position) ? 2 : 1;
  cursor.line += 1;
}

function getLineBreakCount(segment: string): number {
  return segment.match(/\r\n|\r|\n/g)?.length ?? 0;
}

function readQuotedCell(text: string, cursor: CsvCursor, column: number): string {
  const startLine: number = cursor.line;
  let cell: string = '';
  let isClosed: boolean = false;
  cursor.position += 1;
  while (!isClosed) {
    const quote: number = text.indexOf('"', cursor.position);
    if (quote === -1) throw new FoundryCsvParseError({ reason: 'unclosedQuote', line: startLine, column });
    const segment: string = text.slice(cursor.position, quote);
    cell += segment;
    cursor.line += getLineBreakCount(segment);
    cursor.position = quote + 1;
    isClosed = text[cursor.position] !== '"';
    if (!isClosed) {
      cell += '"';
      cursor.position += 1;
    }
  }
  return cell;
}

function readPlainCell(text: string, cursor: CsvCursor, delimiter: FoundryCsvDelimiter, column: number): string {
  const start: number = cursor.position;
  while (cursor.position < text.length) {
    const character: string = text.charAt(cursor.position);
    if (character === delimiter || isLineBreak(character)) break;
    if (character === '"') throw new FoundryCsvParseError({ reason: 'unexpectedQuote', line: cursor.line, column });
    cursor.position += 1;
  }
  return text.slice(start, cursor.position);
}

function readRecord(text: string, cursor: CsvCursor, delimiter: FoundryCsvDelimiter): CsvRecord {
  const cells: Array<string> = [];
  const cellLines: Array<number> = [];
  let hasNextCell: boolean = true;
  while (hasNextCell) {
    const column: number = cells.length + 1;
    cellLines.push(cursor.line);
    if (text[cursor.position] === '"') {
      cells.push(readQuotedCell(text, cursor, column));
      const next: string | undefined = text[cursor.position];
      if (next !== undefined && next !== delimiter && !isLineBreak(next)) {
        throw new FoundryCsvParseError({ reason: 'unexpectedQuote', line: cursor.line, column });
      }
    } else {
      cells.push(readPlainCell(text, cursor, delimiter, column));
    }
    hasNextCell = text[cursor.position] === delimiter;
    if (hasNextCell) cursor.position += 1;
  }
  const endLine: number = cursor.line;
  if (cursor.position < text.length) moveCursorPastLineBreak(text, cursor);
  return { cells, cellLines, endLine };
}

function splitCsvText(text: string, delimiter: FoundryCsvDelimiter, isKeepingEmptyLines: boolean, maximum: number): CsvTextSplit {
  const records: Array<CsvRecord> = [];
  const cursor: CsvCursor = { position: text.startsWith(BYTE_ORDER_MARK) ? 1 : 0, line: 1 };
  let filledRecords: number = 0;
  while (cursor.position < text.length && filledRecords < maximum) {
    if (isLineBreak(text[cursor.position])) {
      if (isKeepingEmptyLines) records.push({ cells: [''], cellLines: [cursor.line], endLine: cursor.line });
      moveCursorPastLineBreak(text, cursor);
    } else {
      records.push(readRecord(text, cursor, delimiter));
      filledRecords += 1;
    }
  }
  return { records, end: cursor.position };
}

function findSampleEnd(text: string, delimiter: FoundryCsvDelimiter): number | null {
  try {
    const sample: CsvTextSplit = splitCsvText(text, delimiter, false, DELIMITER_SAMPLE_LINES);
    const cellCount: number = sample.records[0]?.cells.length ?? 0;
    return cellCount > 1 && sample.records.every((record) => record.cells.length === cellCount) ? sample.end : null;
  } catch {
    return null;
  }
}

function findAutoDelimiter(text: string): FoundryCsvDelimiter {
  const sampleEnds: ReadonlyMap<FoundryCsvDelimiter, number | null> = new Map(
    CSV_DELIMITERS.map((delimiter) => [delimiter, findSampleEnd(text, delimiter)]),
  );
  const semicolonEnd: number | null = sampleEnds.get(';') ?? null;
  if (semicolonEnd !== null && DECIMAL_COMMA_PATTERN.test(text.slice(0, semicolonEnd))) return ';';
  return CSV_DELIMITERS.find((delimiter) => (sampleEnds.get(delimiter) ?? null) !== null) ?? ',';
}

function readCellText(cell: string, isTrimmed: boolean, formulaEscaping: CsvFormulaEscaping): string {
  const text: string = isTrimmed ? cell.trim() : cell;
  return formulaEscaping === 'prefixApostrophe' && ESCAPED_FORMULA_PATTERN.test(text) ? text.slice(1) : text;
}

/**
 * Splits a CSV text into records, choosing the separator with `'auto'`, trimming and removing the escape apostrophe as asked.
 * @throws {TypeError} When the text or an option are not valid.
 * @throws {FoundryCsvParseError} When a quote is not closed or is out of place.
 */
export function readCsvRecords(text: string, options: FoundryCsvParseOptions | undefined): CsvRecordsReading {
  if (typeof text !== 'string') throw new TypeError(`[foundry-utils]: the CSV text must be a string, got ${typeof text}`);
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of a CSV reading must be an object');
  const askedDelimiter: CsvParseDelimiter = ɵparseEnumOption({
    options,
    name: 'delimiter',
    allowedValues: CSV_PARSE_DELIMITERS,
    fallback: 'auto',
  });
  const formulaEscaping: CsvFormulaEscaping = ɵparseEnumOption({
    options,
    name: 'formulaEscaping',
    allowedValues: FORMULA_ESCAPINGS,
    fallback: 'prefixApostrophe',
  });
  const isTrimmed: boolean = ɵparseBooleanOption({ options, name: 'trimCells', fallback: false });
  const isKeepingEmptyLines: boolean = !ɵparseBooleanOption({ options, name: 'skipEmptyLines', fallback: true });
  const delimiter: FoundryCsvDelimiter = askedDelimiter === 'auto' ? findAutoDelimiter(text) : askedDelimiter;
  const split: CsvTextSplit = splitCsvText(text, delimiter, isKeepingEmptyLines, Number.POSITIVE_INFINITY);
  const records: Array<CsvRecord> = split.records.map((record) => ({
    ...record,
    cells: record.cells.map((cell) => readCellText(cell, isTrimmed, formulaEscaping)),
  }));
  return { delimiter, records };
}
