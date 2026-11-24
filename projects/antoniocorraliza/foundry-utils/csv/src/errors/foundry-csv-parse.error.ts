import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import { CSV_PARSE_ERROR_SENTENCES } from '../constants/csv-parse-error-sentences.constant';

/** Reports a CSV that cannot be read: its structure, its headers or its encoding. */
export class FoundryCsvParseError extends FoundryUtilsError {
  override readonly name: 'FoundryCsvParseError' = 'FoundryCsvParseError';
  /** What is wrong in the document. */
  readonly reason: 'unclosedQuote' | 'unexpectedQuote' | 'columnCountMismatch' | 'duplicateHeader' | 'emptyHeader' | 'invalidEncoding';
  /** Physical line of the error, from 1; `0` for `invalidEncoding`, which has no position. */
  readonly line: number;
  /** Cell of the row, from 1; `0` for `invalidEncoding`, which has no position. */
  readonly column: number;

  constructor(
    details: {
      readonly reason: 'unclosedQuote' | 'unexpectedQuote' | 'columnCountMismatch' | 'duplicateHeader' | 'emptyHeader' | 'invalidEncoding';
      readonly line: number;
      readonly column: number;
    },
    options?: { readonly cause?: unknown },
  ) {
    super(
      `[foundry-utils]: ${CSV_PARSE_ERROR_SENTENCES[details.reason]} (${details.reason}${details.line === 0 ? '' : ` at line ${details.line}, column ${details.column}`})`,
      options,
    );
    this.reason = details.reason;
    this.line = details.line;
    this.column = details.column;
  }
}
