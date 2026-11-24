import type { CsvDecimalSeparator } from '../types/csv-decimal-separator.type';
import type { CsvFormulaEscaping } from '../types/csv-formula-escaping.type';
import type { CsvQuoting } from '../types/csv-quoting.type';
import type { FoundryCsvDelimiter } from '../types/foundry-csv-delimiter.type';

/** Options of `toCsv` that decide how a cell is written. */
export interface CsvWriteSettings {
  readonly delimiter: FoundryCsvDelimiter;
  readonly decimalSeparator: CsvDecimalSeparator;
  readonly quoting: CsvQuoting;
  readonly formulaEscaping: CsvFormulaEscaping;
}
