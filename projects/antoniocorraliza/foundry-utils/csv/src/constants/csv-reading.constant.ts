import type { FoundryCsvDelimiter } from '../types/foundry-csv-delimiter.type';

/** Logical lines, without the empty ones, that `'auto'` looks at to choose the separator. */
export const DELIMITER_SAMPLE_LINES: number = 10;
/** Decimal comma between two digits, which breaks a tie in favour of the semicolon. */
export const DECIMAL_COMMA_PATTERN: RegExp = /\d,\d/;
/** Separators in the order that breaks a tie among the ones that read the first lines with the same number of cells. */
export const DELIMITER_TIE_ORDER: ReadonlyArray<FoundryCsvDelimiter> = [',', ';', '\t'];
