import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import * as entry from './public-api';

type LooseFunction = (...values: Array<unknown>) => unknown;

const NEVER_THROWING: ReadonlyArray<[string, LooseFunction]> = [
  ['isEmail', entry.isEmail as LooseFunction],
  ['isUrl', entry.isUrl as LooseFunction],
  ['isPhoneNumber', entry.isPhoneNumber as LooseFunction],
  ['isUuid', entry.isUuid as LooseFunction],
  ['isDniOrNie', entry.isDniOrNie as LooseFunction],
  ['isStrongPassword', entry.isStrongPassword as LooseFunction],
  ['isNumeric', entry.isNumeric as LooseFunction],
  ['isValidJson', entry.isValidJson as LooseFunction],
  ['hasValue', entry.hasValue as LooseFunction],
  ['normalizePhoneNumber', entry.normalizePhoneNumber as LooseFunction],
  ['normalizeDniOrNie', entry.normalizeDniOrNie as LooseFunction],
];

const SAMPLE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [
  ['createControlValidator', [entry.isEmail, 'email']],
  ['hasValue', ['a']],
  ['isDniOrNie', ['12345678Z']],
  ['isEmail', ['ana@empresa.es']],
  ['isNumeric', ['12']],
  ['isPhoneNumber', ['600000000']],
  ['isStrongPassword', ['Password1']],
  ['isUrl', ['https://empresa.es']],
  ['isUuid', ['0190f3a1-7c2e-7a3b-8f1d-2b3c4d5e6f70']],
  ['isValidJson', ['{}']],
  ['normalizeDniOrNie', ['12345678Z']],
  ['normalizePhoneNumber', ['600000000']],
  ['normalizeUrl', ['https://empresa.es']],
];

describe('public API of the validation entry', () => {
  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual([
      'createControlValidator',
      'hasValue',
      'isDniOrNie',
      'isEmail',
      'isNumeric',
      'isPhoneNumber',
      'isStrongPassword',
      'isUrl',
      'isUuid',
      'isValidJson',
      'normalizeDniOrNie',
      'normalizePhoneNumber',
      'normalizeUrl',
    ]);
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    const looseFunction: LooseFunction = entry[name] as LooseFunction;
    const result: unknown = looseFunction(...values);
    expect(result instanceof Promise || typeof (result as { then?: unknown } | null)?.then === 'function').toBe(false);
  });

  it.each(SAMPLE_CALLS)('works through %s as a loose reference, without this', (name, values) => {
    const looseFunction: LooseFunction = entry[name] as LooseFunction;
    expect(() => looseFunction.call(undefined, ...values)).not.toThrow();
  });

  it.each(NEVER_THROWING)('never throws through %s, whatever its arguments are', (_name, check) => {
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (value, options) => {
        expect(() => check(value, options)).not.toThrow();
      }),
    );
  });

  it.each<unknown>([5, 'https:', true, null, [], () => ({})])(
    'throws a TypeError through normalizeUrl for the options %j, which are not an object',
    (options) => {
      expect(catchThrown(() => entry.normalizeUrl('https://empresa.es', options as never))).toBeInstanceOf(TypeError);
    },
  );
});
