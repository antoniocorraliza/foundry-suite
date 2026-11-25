import { describe, expect, it } from 'vitest';
import { ɵparseBooleanOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import { parseCsvRecords } from './parse-csv-records.function';
import { readCsvRecords } from './read-csv-records.function';

describe('parseCsvRecords', () => {
  it('returns the cells of the records that readCsvRecords reads', () => {
    const texts: ReadonlyArray<string> = ['\ufeffnombre;importe\r\nAna;"12,50"\r\n', 'a,b\r\n1,2', 'a\tb\n1\t2\n', 'a', ''];
    texts.forEach((text) => expect(parseCsvRecords(text)).toEqual(readCsvRecords(text, undefined).records.map((record) => record.cells)));
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
    const extra: FoundryCsvParseError = catchError(() => parseCsvRecords('a,b\r\n1,2,3'), FoundryCsvParseError);
    expect([extra.reason, extra.line, extra.column]).toEqual(['columnCountMismatch', 2, 3]);
    const missing: FoundryCsvParseError = catchError(() => parseCsvRecords('a,b\r\n1'), FoundryCsvParseError);
    expect([missing.reason, missing.line, missing.column]).toEqual(['columnCountMismatch', 2, 2]);
  });

  it('returns the records as they come, without filling or cutting them, when relaxColumnCount is true', () => {
    expect(parseCsvRecords('a,b\r\n1\r\n1,2,3,', { relaxColumnCount: true })).toEqual([['a', 'b'], ['1'], ['1', '2', '3', '']]);
  });

  it('ignores the duplicateHeaders option, which is not one of its own', () => {
    expect(parseCsvRecords('a,a', { duplicateHeaders: 'unknown' } as never)).toEqual([['a', 'a']]);
  });

  it('rejects a relaxColumnCount that is not a boolean as parseBooleanOption does', () => {
    expect(catchError(() => parseCsvRecords('a', { relaxColumnCount: 'yes' } as never), TypeError).message).toBe(
      catchError(() => ɵparseBooleanOption({ options: { relaxColumnCount: 'yes' }, name: 'relaxColumnCount', fallback: false }), TypeError)
        .message,
    );
  });

  it('throws a TypeError for a text that is not a string', () => {
    expect(catchThrown(() => parseCsvRecords(null as never))).toBeInstanceOf(TypeError);
  });
});
