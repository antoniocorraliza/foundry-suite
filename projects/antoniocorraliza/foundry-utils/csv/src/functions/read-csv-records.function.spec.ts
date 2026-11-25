import { describe, expect, it } from 'vitest';
import { ɵcheckOptions, ɵparseBooleanOption, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { CSV_PARSE_DELIMITERS } from '../constants/csv-parse-delimiters.constant';
import { FORMULA_ESCAPINGS } from '../constants/formula-escapings.constant';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';
import { readCsvRecords } from './read-csv-records.function';

function readCells(text: string, options?: FoundryCsvParseOptions): Array<ReadonlyArray<string>> {
  return readCsvRecords(text, options).records.map((record) => record.cells);
}

describe('readCsvRecords', () => {
  describe('parser', () => {
    it('reads quoted cells with separators, line breaks and doubled quotes inside', () => {
      expect(readCells('a,b\r\n"x,y","l1\nl2"\r\n"di ""hola""",z', { delimiter: ',' })).toEqual([
        ['a', 'b'],
        ['x,y', 'l1\nl2'],
        ['di "hola"', 'z'],
      ]);
    });

    it('takes CRLF, LF and CR as line breaks', () => {
      expect(readCells('a\r\nb\nc\rd', { delimiter: ',' })).toEqual([['a'], ['b'], ['c'], ['d']]);
    });

    it('reads a last line without a line break, and opens no line after the final one', () => {
      expect(readCells('a\r\nb', { delimiter: ',' })).toEqual([['a'], ['b']]);
      expect(readCells('a\r\nb\r\n', { delimiter: ',', skipEmptyLines: false })).toEqual([['a'], ['b']]);
    });

    it('removes the byte order mark at the start, and only there', () => {
      expect(readCells('﻿a,b', { delimiter: ',' })).toEqual([['a', 'b']]);
      expect(readCells('a,﻿b', { delimiter: ',' })).toEqual([['a', '﻿b']]);
    });

    it('keeps the tabs and the line breaks of the cells', () => {
      expect(readCells('x\ty,"a\r\nb"', { delimiter: ',' })).toEqual([['x\ty', 'a\r\nb']]);
    });

    it('reads an empty cell between quotes as an empty text', () => {
      expect(readCells('"",a', { delimiter: ',' })).toEqual([['', 'a']]);
    });
  });

  describe('empty lines', () => {
    it('skips the lines without any character by default', () => {
      expect(readCells('a\r\n\r\nb\n\nc', { delimiter: ',' })).toEqual([['a'], ['b'], ['c']]);
    });

    it('reads a line with spaces, with only separators or with two quotes as a record', () => {
      expect(readCells('a,b\r\n  \r\n,\r\n""', { delimiter: ',' })).toEqual([['a', 'b'], ['  '], ['', ''], ['']]);
    });

    it('keeps the empty lines as records with one empty cell when skipEmptyLines is false', () => {
      expect(readCells('a\r\n\r\nb', { delimiter: ',', skipEmptyLines: false })).toEqual([['a'], [''], ['b']]);
      expect(readCells('\r\n', { delimiter: ',', skipEmptyLines: false })).toEqual([['']]);
    });

    it.each(['', '﻿', '\r\n\r\n', '\n'])('returns no records for %j, with the comma when the delimiter is auto', (text) => {
      expect(readCsvRecords(text, undefined)).toEqual({ delimiter: ',', records: [] });
    });

    it('returns no records and the asked delimiter for an empty text', () => {
      expect(readCsvRecords('', { delimiter: ';' })).toEqual({ delimiter: ';', records: [] });
      expect(readCsvRecords('', { delimiter: ',', skipEmptyLines: false }).records).toEqual([]);
    });
  });

  describe('quote errors', () => {
    it('reports a quote that is not closed at the line and the cell where it opens', () => {
      const error: FoundryCsvParseError = catchError(() => readCsvRecords('a,b\r\nx,"abc\r\nd', { delimiter: ',' }), FoundryCsvParseError);
      expect([error.reason, error.line, error.column]).toEqual(['unclosedQuote', 2, 2]);
    });

    it.each([
      ['ab"c', 1],
      ['x,"ab"c', 2],
      ['x, "ab"', 2],
    ])('reports an unexpected quote in %j at its cell', (text, column) => {
      const error: FoundryCsvParseError = catchError(() => readCsvRecords(text, { delimiter: ',' }), FoundryCsvParseError);
      expect([error.reason, error.line, error.column]).toEqual(['unexpectedQuote', 1, column]);
    });

    it('counts the physical lines, also the line breaks inside a quoted cell', () => {
      const unclosed: FoundryCsvParseError = catchError(
        () => readCsvRecords('"a\r\nb",c\r\nd,"e', { delimiter: ',' }),
        FoundryCsvParseError,
      );
      expect([unclosed.reason, unclosed.line, unclosed.column]).toEqual(['unclosedQuote', 3, 2]);
      const unexpected: FoundryCsvParseError = catchError(
        () => readCsvRecords('h1,h2\r\n"x\r\ny",z\r\nq,w"e', { delimiter: ',' }),
        FoundryCsvParseError,
      );
      expect([unexpected.reason, unexpected.line, unexpected.column]).toEqual(['unexpectedQuote', 4, 2]);
    });

    it('stops at the first error', () => {
      const error: FoundryCsvParseError = catchError(() => readCsvRecords('a"b,"c', { delimiter: ',' }), FoundryCsvParseError);
      expect([error.reason, error.column]).toEqual(['unexpectedQuote', 1]);
    });
  });

  describe('auto delimiter', () => {
    it.each([
      ['Apellidos, Nombre;Email\r\nGarcía, Ana;ana@x.es\r\nRuiz;ruiz@x.es', ';'],
      ['nombre;importe\r\nAna;12,50', ';'],
      ['Nombre;Total\r\nAna;1,5\r\nLuis;2\r\n', ';'],
      ['a\tb\r\nc\td', '\t'],
      ['a,b\r\nc,d', ','],
    ])('chooses the delimiter that gives the same number of cells, more than one, in every line of %j', (text, delimiter) => {
      expect(readCsvRecords(text, undefined).delimiter).toBe(delimiter);
    });

    it('reads the records with the delimiter it chooses', () => {
      expect(readCells('Apellidos, Nombre;Email\r\nGarcía, Ana;ana@x.es\r\nRuiz;ruiz@x.es')).toEqual([
        ['Apellidos, Nombre', 'Email'],
        ['García, Ana', 'ana@x.es'],
        ['Ruiz', 'ruiz@x.es'],
      ]);
    });

    it('chooses the semicolon on a tie when a line has a decimal comma, and the comma otherwise', () => {
      expect(readCsvRecords('a;b,c\r\n1;2,5', undefined).delimiter).toBe(';');
      expect(readCsvRecords('a;b,c\r\nx;y,z', undefined).delimiter).toBe(',');
    });

    it('breaks a tie only among the tied delimiters', () => {
      expect(readCsvRecords('a,b\tc\r\nd,e\tf', undefined).delimiter).toBe(',');
      expect(readCsvRecords('a;b\tc\r\nd;e\tf', undefined).delimiter).toBe(';');
    });

    it('chooses the comma when no delimiter gives the same number of cells in every line', () => {
      expect(readCsvRecords('a\r\nb', undefined).delimiter).toBe(',');
      expect(readCsvRecords('a,b\r\nc;d,e;f', undefined).delimiter).toBe(',');
    });

    it('counts the cells of each delimiter respecting the quotes and the logical lines', () => {
      expect(readCsvRecords('"a;b",c\r\n"d;e",f', undefined).delimiter).toBe(',');
      expect(readCsvRecords('"a\r\nb";c\r\nd;e', undefined).delimiter).toBe(';');
    });

    it('looks only at the first ten logical lines', () => {
      const text: string = ['a;b', ...Array.from({ length: 9 }, () => 'x;y'), 'x,y;z;w'].join('\r\n');
      expect(readCsvRecords(text, undefined).delimiter).toBe(';');
    });

    it('does not count the empty lines among the ten, also when they are kept', () => {
      const text: string = ['a;b', '', '', '', '', '', '', '', '', '', 'c;d', 'e;f'].join('\r\n');
      expect(readCsvRecords(text, undefined).delimiter).toBe(';');
      expect(readCsvRecords(text, { skipEmptyLines: false }).delimiter).toBe(';');
    });

    it('never throws while choosing: a quote that is not closed is reported by the reading, at its place', () => {
      const error: FoundryCsvParseError = catchError(() => readCsvRecords('a,"b\r\nc,d', undefined), FoundryCsvParseError);
      expect([error.reason, error.line, error.column]).toEqual(['unclosedQuote', 1, 2]);
    });

    it('uses the asked delimiter without choosing one', () => {
      expect(readCsvRecords('a,b;c', { delimiter: ';' }).delimiter).toBe(';');
      expect(readCells('a,b;c', { delimiter: ';' })).toEqual([['a,b', 'c']]);
    });
  });

  describe('trimCells', () => {
    it('keeps the spaces of the cells by default', () => {
      expect(readCells('a , b\r\n"  c  ",d', { delimiter: ',' })).toEqual([
        ['a ', ' b'],
        ['  c  ', 'd'],
      ]);
    });

    it('trims every cell, also inside quotes, when asked', () => {
      expect(readCells('a , b\r\n"  c  ",d', { delimiter: ',', trimCells: true })).toEqual([
        ['a', 'b'],
        ['c', 'd'],
      ]);
    });

    it('trims the spaces that String.prototype.trim removes', () => {
      expect(readCells(' a　,\tb ', { delimiter: ',', trimCells: true })).toEqual([['a', 'b']]);
    });
  });

  describe('escape apostrophe', () => {
    it.each([
      ["'=x", '=x'],
      ["''=x", "'=x"],
      ["''-5", "'-5"],
      ["'-5", '-5'],
      ["'+34 600 000 000", '+34 600 000 000'],
      ["'@SUM(1)", '@SUM(1)'],
      ["'\t1", '\t1'],
      ["'abc", "'abc"],
      ['-5', '-5'],
    ])('reads %j as %j, removing one apostrophe in front of a dangerous character', (cell, text) => {
      expect(readCells(`${cell},x`, { delimiter: ',' })).toEqual([[text, 'x']]);
    });

    it('removes the apostrophe of a quoted cell with a carriage return', () => {
      expect(readCells(`"'\r=1",x`, { delimiter: ',' })).toEqual([['\r=1', 'x']]);
    });

    it('keeps every apostrophe when formulaEscaping is none', () => {
      expect(readCells("'=x,''-5", { delimiter: ',', formulaEscaping: 'none' })).toEqual([["'=x", "''-5"]]);
    });

    it('trims a cell before it looks for the apostrophe', () => {
      expect(readCells(" '=x,a", { delimiter: ',', trimCells: true })).toEqual([['=x', 'a']]);
      expect(readCells(" '=x,a", { delimiter: ',' })).toEqual([[" '=x", 'a']]);
    });
  });

  describe('arguments and options', () => {
    it.each<unknown>([null, 5, new String('a,b')])('throws a TypeError for the text %j, which is not a string', (text) => {
      expect(catchThrown(() => readCsvRecords(text as string, undefined))).toBeInstanceOf(TypeError);
    });

    it('rejects options that are not an object as checkOptions does, naming a CSV reading', () => {
      expect(catchError(() => readCsvRecords('a', 5 as never), TypeError).message).toBe(
        catchError(() => ɵcheckOptions(5, 'a CSV reading'), TypeError).message,
      );
    });

    it.each<[string, unknown, () => unknown]>([
      ['delimiter', '|', () => ɵparseEnumOption({ options: { delimiter: '|' }, name: 'delimiter', allowedValues: CSV_PARSE_DELIMITERS })],
      [
        'formulaEscaping',
        'remove',
        () => ɵparseEnumOption({ options: { formulaEscaping: 'remove' }, name: 'formulaEscaping', allowedValues: FORMULA_ESCAPINGS }),
      ],
      ['trimCells', 'yes', () => ɵparseBooleanOption({ options: { trimCells: 'yes' }, name: 'trimCells', fallback: false })],
      ['skipEmptyLines', 1, () => ɵparseBooleanOption({ options: { skipEmptyLines: 1 }, name: 'skipEmptyLines', fallback: true })],
    ])('rejects the %s %j as the reader of the root does', (name, value, readOption) => {
      expect(catchError(() => readCsvRecords('a', { [name]: value } as never), TypeError).message).toBe(
        catchError(readOption, TypeError).message,
      );
    });

    it('takes a null option as a missing one', () => {
      expect(readCsvRecords('a;b', { delimiter: null, trimCells: null } as never).delimiter).toBe(';');
    });
  });
});
