import type { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';

/** First words of the message of each reason of a CSV that cannot be read. */
export const CSV_PARSE_ERROR_SENTENCES: Readonly<Record<FoundryCsvParseError['reason'], string>> = {
  unclosedQuote: 'a quoted cell is never closed',
  unexpectedQuote: 'a quote is out of place',
  columnCountMismatch: 'a row has another number of cells than the first line',
  duplicateHeader: 'a header is repeated',
  emptyHeader: 'a header is empty',
  invalidEncoding: 'the bytes of the file are not valid in its encoding',
};
