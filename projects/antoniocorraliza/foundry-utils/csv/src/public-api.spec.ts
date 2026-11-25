import { describe, expect, it } from 'vitest';
import { ɵcheckOptions } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { isPromiseLike } from '@foundry-test/functions/is-promise-like.function';
import { listFunctionNames } from '@foundry-test/functions/list-function-names.function';
import type { CallWithOptions } from '@foundry-test/types/call-with-options.type';
import type { LooseFunction } from '@foundry-test/types/loose-function.type';
import * as entry from './public-api';

const SAMPLE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [
  ['createCsvBlob', [[{ a: 1 }]]],
  ['parseCsv', ['a\r\n1']],
  ['parseCsvRecords', ['a\r\n1']],
  ['toCsv', [[{ a: 1 }]]],
];

const PROMISE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [['readCsvFile', [new Blob(['a\r\n1'])]]];

const WRONG_FIRST_ARGUMENTS: ReadonlyArray<[keyof typeof entry, unknown]> = [
  ['toCsv', null],
  ['createCsvBlob', 'a,b'],
  ['parseCsv', 5],
  ['parseCsvRecords', null],
];

const OPTION_USERS: ReadonlyArray<[keyof typeof entry, CallWithOptions]> = [
  ['toCsv', (options) => entry.toCsv([{ a: 1 }], options as never)],
  ['createCsvBlob', (options) => entry.createCsvBlob([{ a: 1 }], options as never)],
  ['parseCsv', (options) => entry.parseCsv('a\r\n1', options as never)],
  ['parseCsvRecords', (options) => entry.parseCsvRecords('a\r\n1', options as never)],
];

describe('public API of the csv entry', () => {
  it('exports exactly these values', () => {
    expect(Object.keys(entry).sort()).toEqual([
      'FoundryCsvParseError',
      'createCsvBlob',
      'excelSpanishCsvOptions',
      'parseCsv',
      'parseCsvRecords',
      'readCsvFile',
      'toCsv',
    ]);
  });

  it('has a sample call for each export', () => {
    expect([...SAMPLE_CALLS, ...PROMISE_CALLS].map(([name]) => name).sort()).toEqual(listFunctionNames(entry));
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    expect(isPromiseLike((entry[name] as LooseFunction)(...values))).toBe(false);
  });

  it.each(PROMISE_CALLS)('returns a promise from %s', async (name, values) => {
    const result: unknown = (entry[name] as LooseFunction)(...values);
    expect(isPromiseLike(result)).toBe(true);
    expect(await result).toEqual({ delimiter: ',', headers: ['a'], rows: [{ a: '1' }] });
  });

  it.each(OPTION_USERS)(
    'throws a TypeError through %s for options that are not an object, naming that function',
    (name, callWithOptions) => {
      expect(catchError(() => callWithOptions(5), TypeError).message).toBe(catchError(() => ɵcheckOptions(5, name), TypeError).message);
    },
  );

  it.each(WRONG_FIRST_ARGUMENTS)('throws a TypeError through %s for a first argument of the wrong type', (name, value) => {
    expect(catchThrown(() => (entry[name] as LooseFunction)(value))).toBeInstanceOf(TypeError);
  });
});
