import {
  ɵcheckOptions,
  ɵgetOwnDataEntries,
  ɵgetOwnDataValue,
  ɵgetValueKind,
  ɵisPlainObject,
  ɵparseBooleanOption,
  ɵparseEnumOption,
} from '@antoniocorraliza/foundry-utils';
import { formatDate, formatTime, startOfDay } from '@antoniocorraliza/foundry-utils/date';
import { CSV_DECIMAL_SEPARATORS } from '../constants/csv-decimal-separators.constant';
import { CSV_DELIMITERS } from '../constants/csv-delimiters.constant';
import { EXPONENT_NOTATION_PATTERN } from '../constants/exponent-notation-pattern.constant';
import { FORMULA_ESCAPINGS } from '../constants/formula-escapings.constant';
import { FORMULA_START_PATTERN, STRICT_NUMBER_PATTERN } from '../constants/formula-patterns.constant';
import { LINE_BREAKS } from '../constants/line-breaks.constant';
import { QUOTINGS } from '../constants/quotings.constant';
import type { CsvWriteColumn } from '../interfaces/csv-write-column.interface';
import type { CsvWriteSettings } from '../interfaces/csv-write-settings.interface';
import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';
import type { CsvLineBreak } from '../types/csv-line-break.type';

function readKeyValue(key: string): (row: object) => unknown {
  if (key === '__proto__') return (row) => ɵgetOwnDataValue(row, key);
  return (row) => (row as Readonly<Record<string, unknown>>)[key];
}

function readGivenColumn(column: unknown, index: number): CsvWriteColumn {
  const header: unknown = ɵgetOwnDataValue(column, 'header');
  const value: unknown = ɵgetOwnDataValue(column, 'value');
  const format: unknown = ɵgetOwnDataValue(column, 'format') ?? null;
  if (
    typeof header !== 'string' ||
    (typeof value !== 'string' && typeof value !== 'function') ||
    (format !== null && typeof format !== 'function')
  ) {
    throw new TypeError(
      `[foundry-utils]: the column columns[${index}] of toCsv needs a text header, a key or a function as value, and a function or nothing as format`,
    );
  }
  return {
    header,
    readValue: typeof value === 'string' ? readKeyValue(value) : (value as (row: object) => unknown),
    format: format as ((value: unknown, row: object) => unknown) | null,
  };
}

function readGivenColumns(columns: unknown): ReadonlyArray<CsvWriteColumn> {
  if (!Array.isArray(columns)) throw new TypeError(`[foundry-utils]: the columns option of toCsv must be an array, got ${typeof columns}`);
  return columns.map((column, index) => readGivenColumn(column, index));
}

function createRowKeyColumn(key: string): CsvWriteColumn {
  return { header: key, readValue: (row) => ɵgetOwnDataValue(row, key), format: null };
}

function listRowKeys(rows: ReadonlyArray<unknown>): ReadonlyArray<CsvWriteColumn> {
  const keys: Set<string> = new Set<string>();
  rows.forEach((row, index) => {
    if (!ɵisPlainObject(row)) {
      throw new TypeError(`[foundry-utils]: the row rows[${index}] of toCsv must be a plain object without columns`);
    }
    ɵgetOwnDataEntries(row).forEach(([key]) => keys.add(key));
  });
  return Array.from(keys, (key) => createRowKeyColumn(key));
}

function writePositionalNumber(value: number): string {
  const text: string = String(value);
  const match: RegExpExecArray | null = EXPONENT_NOTATION_PATTERN.exec(text);
  if (match === null) return text;
  const [, sign = '', firstDigit = '', otherDigits = '', exponentText = ''] = match;
  const digits: string = `${firstDigit}${otherDigits}`;
  const exponent: number = Number(exponentText);
  if (exponent >= 0) return `${sign}${digits.padEnd(exponent + 1, '0')}`;
  return `${sign}0.${'0'.repeat(-exponent - 1)}${digits}`;
}

function writeDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return '';
  const day: string = formatDate(date);
  return startOfDay(date).getTime() === date.getTime() ? day : `${day} ${formatTime(date)}`;
}

function escapeFormula(text: string, settings: CsvWriteSettings): string {
  if (settings.formulaEscaping === 'none' || !FORMULA_START_PATTERN.test(text) || STRICT_NUMBER_PATTERN.test(text)) return text;
  return `'${text}`;
}

function writeValue(value: unknown, settings: CsvWriteSettings, location: string): string {
  if (typeof value === 'string') return escapeFormula(value, settings);
  if (typeof value === 'number') return Number.isFinite(value) ? writePositionalNumber(value).replace('.', settings.decimalSeparator) : '';
  if (typeof value === 'bigint' || typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return '';
  if (ɵgetValueKind(value) !== 'date') {
    throw new TypeError(`[foundry-utils]: the cell ${location} holds a value that a CSV cannot write; give its column a format`);
  }
  try {
    return writeDate(value as Date);
  } catch (error) {
    throw new RangeError(`[foundry-utils]: the date of the cell ${location} is outside the years 1 to 9999`, { cause: error });
  }
}

function writeCell(row: object, column: CsvWriteColumn, settings: CsvWriteSettings, location: string): string {
  const value: unknown = column.readValue(row);
  const format: ((value: unknown, row: object) => unknown) | null = column.format;
  if (format === null) return writeValue(value, settings, location);
  const formatted: unknown = format(value, row);
  if (typeof formatted !== 'string') throw new TypeError(`[foundry-utils]: the format of the cell ${location} did not return a text`);
  return escapeFormula(formatted, settings);
}

function addQuotesWhenNeeded(text: string, settings: CsvWriteSettings, isAlone: boolean): string {
  const isQuoted: boolean =
    settings.quoting === 'always' ||
    (isAlone && text === '') ||
    /["\r\n]/.test(text) ||
    text.includes(settings.delimiter) ||
    text.startsWith(' ') ||
    text.endsWith(' ');
  return isQuoted ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeLine(texts: ReadonlyArray<string>, settings: CsvWriteSettings, lineBreak: CsvLineBreak): string {
  return `${texts.map((text) => addQuotesWhenNeeded(text, settings, texts.length === 1)).join(settings.delimiter)}${lineBreak}`;
}

function writeRow(row: unknown, index: number, columns: ReadonlyArray<CsvWriteColumn>, settings: CsvWriteSettings): Array<string> {
  if (typeof row !== 'object' || row === null) throw new TypeError(`[foundry-utils]: the row rows[${index}] of toCsv is not an object`);
  return columns.map((column) => writeCell(row, column, settings, `rows[${index}] of column ${column.header}`));
}

/**
 * Writes rows as a CSV text, with a line break after every line.
 * @throws {TypeError} When the rows, a column or an option are not valid, or a cell holds a value that a CSV cannot write.
 * @throws {RangeError} When a date is outside the years 1 to 9999.
 */
export function toCsv<Row extends object>(rows: ReadonlyArray<Row>, options?: FoundryCsvWriteOptions<Row>): string {
  if (!Array.isArray(rows)) throw new TypeError(`[foundry-utils]: the rows of toCsv must be an array, got ${typeof rows}`);
  ɵcheckOptions(options, 'toCsv');
  const settings: CsvWriteSettings = {
    delimiter: ɵparseEnumOption({ options, name: 'delimiter', allowedValues: CSV_DELIMITERS, fallback: ',' }),
    decimalSeparator: ɵparseEnumOption({ options, name: 'decimalSeparator', allowedValues: CSV_DECIMAL_SEPARATORS, fallback: '.' }),
    quoting: ɵparseEnumOption({ options, name: 'quoting', allowedValues: QUOTINGS, fallback: 'whenNeeded' }),
    formulaEscaping: ɵparseEnumOption({ options, name: 'formulaEscaping', allowedValues: FORMULA_ESCAPINGS, fallback: 'prefixApostrophe' }),
  };
  const lineBreak: CsvLineBreak = ɵparseEnumOption({ options, name: 'lineBreak', allowedValues: LINE_BREAKS, fallback: '\r\n' });
  const hasHeaderLine: boolean = ɵparseBooleanOption({ options, name: 'includeHeader', fallback: true });
  const givenColumns: unknown = options?.['columns'] ?? null;
  const columns: ReadonlyArray<CsvWriteColumn> = givenColumns === null ? listRowKeys(rows) : readGivenColumns(givenColumns);
  if (columns.length === 0) return '';
  const headerLine: string = hasHeaderLine
    ? writeLine(
        columns.map((column) => escapeFormula(column.header, settings)),
        settings,
        lineBreak,
      )
    : '';
  return `${headerLine}${rows.map((row, index) => writeLine(writeRow(row, index, columns, settings), settings, lineBreak)).join('')}`;
}
