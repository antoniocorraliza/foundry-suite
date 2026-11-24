import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';
import { parseCsvRecords } from './parse-csv-records.function';

function catchRecordsError(text: string, options?: FoundryCsvParseOptions): FoundryCsvParseError {
  const thrown: unknown = catchThrown(() => parseCsvRecords(text, options));
  expect(thrown).toBeInstanceOf(FoundryCsvParseError);
  return thrown as FoundryCsvParseError;
}

describe('parseCsvRecords', () => {
  it('reads the records with the shared reader of this entry', () => {
    expect(parseCsvRecords('﻿nombre;importe\r\nAna;"12,50"\r\n')).toEqual([
      ['nombre', 'importe'],
      ['Ana', '12,50'],
    ]);
    expect(catchRecordsError('a,"b').reason).toBe('unclosedQuote');
  });

  it('does not take the first line as headers: an empty or repeated one is a cell like any other', () => {
    expect(parseCsvRecords('a,a,\r\n1,2,3')).toEqual([
      ['a', 'a', ''],
      ['1', '2', '3'],
    ]);
  });

  it('returns new arrays that are not frozen', () => {
    const records: Array<Array<string>> = parseCsvRecords('a,b');
    expect(Object.isFrozen(records)).toBe(false);
    expect(Object.isFrozen(records[0])).toBe(false);
  });

  it('returns an empty list for an empty text', () => {
    expect(parseCsvRecords('')).toEqual([]);
  });

  it('throws columnCountMismatch when a record has another number of cells than the first one', () => {
    const extra: FoundryCsvParseError = catchRecordsError('a,b\r\n1,2,3');
    expect([extra.reason, extra.line, extra.column]).toEqual(['columnCountMismatch', 2, 3]);
    const missing: FoundryCsvParseError = catchRecordsError('a,b\r\n1');
    expect([missing.reason, missing.line, missing.column]).toEqual(['columnCountMismatch', 2, 2]);
  });

  it('returns the records as they come, without filling or cutting them, when relaxColumnCount is true', () => {
    expect(parseCsvRecords('a,b\r\n1\r\n1,2,3,', { relaxColumnCount: true })).toEqual([['a', 'b'], ['1'], ['1', '2', '3', '']]);
  });

  it('ignores the duplicateHeaders option, which is not one of its own', () => {
    expect(parseCsvRecords('a,a', { duplicateHeaders: 'unknown' } as never)).toEqual([['a', 'a']]);
  });

  it('throws a TypeError for an invalid relaxColumnCount, and for a text that is not a string', () => {
    expect(catchThrown(() => parseCsvRecords('a', { relaxColumnCount: 'yes' } as never))).toBeInstanceOf(TypeError);
    expect(catchThrown(() => parseCsvRecords(null as never))).toBeInstanceOf(TypeError);
  });
});
