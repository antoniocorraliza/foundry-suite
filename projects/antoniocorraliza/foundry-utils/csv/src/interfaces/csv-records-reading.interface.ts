import type { FoundryCsvDelimiter } from '../types/foundry-csv-delimiter.type';
import type { CsvRecord } from './csv-record.interface';

/** Records of a CSV text and the separator used to read them. */
export interface CsvRecordsReading {
  readonly delimiter: FoundryCsvDelimiter;
  readonly records: ReadonlyArray<CsvRecord>;
}
