import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';
import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';
import type { FORMULA_ESCAPINGS } from './formula-escapings.constant';

describe('FORMULA_ESCAPINGS', () => {
  it('has the same values as the public option of reading and of writing', () => {
    expectTypeOf<(typeof FORMULA_ESCAPINGS)[number]>().toEqualTypeOf<NonNullable<FoundryCsvParseOptions['formulaEscaping']>>();
    expectTypeOf<(typeof FORMULA_ESCAPINGS)[number]>().toEqualTypeOf<NonNullable<FoundryCsvWriteOptions<object>['formulaEscaping']>>();
  });
});
