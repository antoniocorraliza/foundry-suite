import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCsvDelimiter } from '../types/foundry-csv-delimiter.type';
import type { CSV_DELIMITERS } from './csv-delimiters.constant';

describe('CSV_DELIMITERS', () => {
  it('has the same values as the public type', () => {
    expectTypeOf<(typeof CSV_DELIMITERS)[number]>().toEqualTypeOf<FoundryCsvDelimiter>();
  });
});
