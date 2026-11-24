import type { FoundryCsvDelimiter } from '../types/foundry-csv-delimiter.type';
import type { FoundryCsvColumn } from './foundry-csv-column.interface';

/** Options of `toCsv` and `createCsvBlob`. */
export interface FoundryCsvWriteOptions<Row> {
  /** Columns to write. By default, the union of the own keys of every row, in order of appearance. */
  readonly columns?: ReadonlyArray<FoundryCsvColumn<Row>>;
  /** Separator of the cells. By default `','`. */
  readonly delimiter?: FoundryCsvDelimiter;
  /** Decimal separator of the number cells. By default `'.'`. */
  readonly decimalSeparator?: '.' | ',';
  /** End of every line, the last one included. By default `'\r\n'`. */
  readonly lineBreak?: '\r\n' | '\n';
  /** Quotes only the cells that need them, or every cell. By default `'whenNeeded'`. */
  readonly quoting?: 'whenNeeded' | 'always';
  /** Writes the header line. By default `true`. */
  readonly includeHeader?: boolean;
  /** Puts an apostrophe in front of the texts that a spreadsheet would run as a formula. By default `'prefixApostrophe'`. */
  readonly formulaEscaping?: 'prefixApostrophe' | 'none';
}
