import { describe, expect, it } from 'vitest';
import { listFunctionNames } from './list-function-names.function.ts';

describe('listFunctionNames', () => {
  it('lists the functions in alphabetical order, without classes or other values', () => {
    const entry: object = {
      toCsv: (): string => '',
      parseCsv: (): null => null,
      FoundryCsvParseError: class extends Error {},
      csvOptions: {},
    };
    expect(listFunctionNames(entry)).toEqual(['parseCsv', 'toCsv']);
  });
});
