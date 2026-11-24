import type { CSV_PARSE_DELIMITERS } from '../constants/csv-parse-delimiters.constant';

/** Separator of the cells that a CSV is read with, or `'auto'`. */
export type CsvParseDelimiter = (typeof CSV_PARSE_DELIMITERS)[number];
