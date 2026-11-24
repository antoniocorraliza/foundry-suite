import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCsvTableOptions } from '../interfaces/foundry-csv-table-options.interface';
import type { DUPLICATE_HEADER_MODES } from './duplicate-header-modes.constant';

describe('DUPLICATE_HEADER_MODES', () => {
  it('has the same values as the public option', () => {
    expectTypeOf<(typeof DUPLICATE_HEADER_MODES)[number]>().toEqualTypeOf<NonNullable<FoundryCsvTableOptions['duplicateHeaders']>>();
  });
});
