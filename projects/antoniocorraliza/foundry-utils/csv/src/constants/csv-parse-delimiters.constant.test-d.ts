import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';
import type { CSV_PARSE_DELIMITERS } from './csv-parse-delimiters.constant';

describe('CSV_PARSE_DELIMITERS', () => {
  it('has the same values as the public option', () => {
    expectTypeOf<(typeof CSV_PARSE_DELIMITERS)[number]>().toEqualTypeOf<NonNullable<FoundryCsvParseOptions['delimiter']>>();
  });
});
