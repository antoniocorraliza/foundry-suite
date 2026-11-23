import { describe, expect, it } from 'vitest';
import * as entry from './public-api';

describe('public API of the case entry', () => {
  it('exports exactly these names', () => {
    expect(Object.keys(entry).sort()).toEqual([
      'FoundryKeyCollisionError',
      'toCamelCase',
      'toCamelCaseKeys',
      'toSnakeCase',
      'toSnakeCaseKeys',
    ]);
  });
});

const SAMPLES: Readonly<Record<string, ReadonlyArray<unknown>>> = {
  toCamelCase: ['user_id'],
  toSnakeCase: ['userId'],
  toCamelCaseKeys: [{ a_b: { c_d: [{ e_f: 1 }] } }],
  toSnakeCaseKeys: [{ aB: { cD: [{ eF: 1 }] } }],
};

const FUNCTION_NAMES: Array<string> = Object.entries(entry)
  .filter(([, value]) => typeof value === 'function' && !/^[A-Z]/.test(value.name))
  .map(([name]) => name);

describe('functions of the case entry used as loose references', () => {
  it('has a sample call for every exported function', () => {
    expect(FUNCTION_NAMES.filter((name) => !(name in SAMPLES))).toEqual([]);
  });

  it.each(FUNCTION_NAMES)('%s gives the same result as a loose reference and inside map', (name) => {
    const loose: ((...values: ReadonlyArray<unknown>) => unknown) | undefined = (
      entry as unknown as Record<string, (...values: ReadonlyArray<unknown>) => unknown>
    )[name];
    const sample: ReadonlyArray<unknown> = SAMPLES[name] ?? [];
    const direct: unknown = loose?.(...sample);
    expect([sample].map((values) => loose?.(...values))).toEqual([direct]);
  });
});
