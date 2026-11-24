import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import * as entry from './public-api';

type LooseFunction = (...values: Array<unknown>) => unknown;

const SAMPLE_CALLS: ReadonlyArray<[string, LooseFunction, ReadonlyArray<unknown>]> = [
  ['toCsv', entry.toCsv as LooseFunction, [[{ a: 1 }]]],
  ['createCsvBlob', entry.createCsvBlob as LooseFunction, [[{ a: 1 }]]],
  ['parseCsv', entry.parseCsv as LooseFunction, ['a\r\n1']],
  ['parseCsvRecords', entry.parseCsvRecords as LooseFunction, ['a\r\n1']],
];

const WRONG_FIRST_ARGUMENTS: ReadonlyArray<[string, LooseFunction, unknown]> = [
  ['toCsv', entry.toCsv as LooseFunction, null],
  ['createCsvBlob', entry.createCsvBlob as LooseFunction, 'a,b'],
  ['parseCsv', entry.parseCsv as LooseFunction, 5],
  ['parseCsvRecords', entry.parseCsvRecords as LooseFunction, null],
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

  it.each(SAMPLE_CALLS)('works through %s as a loose reference, without this, and returns no promise', (_name, looseFunction, values) => {
    let result: unknown = null;
    expect(() => {
      result = looseFunction.call(undefined, ...values);
    }).not.toThrow();
    expect(result).not.toBeInstanceOf(Promise);
  });

  it('works through readCsvFile as a loose reference, and returns a promise', async () => {
    const looseFunction: LooseFunction = entry.readCsvFile as LooseFunction;
    const result: unknown = looseFunction.call(undefined, new Blob(['a\r\n1']));
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({ delimiter: ',', headers: ['a'], rows: [{ a: '1' }] });
  });

  it.each(WRONG_FIRST_ARGUMENTS)('throws a TypeError through %s for a first argument of the wrong type', (_name, looseFunction, value) => {
    expect(catchThrown(() => looseFunction(value))).toBeInstanceOf(TypeError);
  });
});
