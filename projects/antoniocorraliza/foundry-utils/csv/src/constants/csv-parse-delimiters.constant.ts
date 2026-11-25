import { CSV_DELIMITERS } from './csv-delimiters.constant';

/** Values of the `delimiter` option of the functions that read a CSV. */
export const CSV_PARSE_DELIMITERS = ['auto', ...CSV_DELIMITERS] as const;
