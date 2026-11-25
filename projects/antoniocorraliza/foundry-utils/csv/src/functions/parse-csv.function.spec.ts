import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { excelSpanishCsvOptions } from '../constants/excel-spanish-csv-options.constant';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { FoundryCsvTable } from '../interfaces/foundry-csv-table.interface';
import type { FoundryCsvTableOptions } from '../interfaces/foundry-csv-table-options.interface';
import { parseCsv } from './parse-csv.function';

describe('parseCsv', () => {
  it('reads the records with the shared reader of this entry', () => {
    expect(parseCsv('﻿nombre;importe\r\nAna;12,50')).toEqual({
      delimiter: ';',
      headers: ['nombre', 'importe'],
      rows: [{ nombre: 'Ana', importe: '12,50' }],
    });
  });

  it('reads back a cell with a comma, a line break and quotes without moving the other columns', () => {
    expect(parseCsv('nombre,nota,ciudad\r\nAna,"uno, ""dos""\r\ntres",Logroño\r\nLuis,x,Soria\r\n').rows).toEqual([
      { nombre: 'Ana', nota: 'uno, "dos"\r\ntres', ciudad: 'Logroño' },
      { nombre: 'Luis', nota: 'x', ciudad: 'Soria' },
    ]);
  });

  describe('headers and rows', () => {
    it('reads the headers with the rules of the cells: quotes and the escape apostrophe', () => {
      expect(parseCsv('"Importe, €",\'=x\r\n1,2').headers).toEqual(['Importe, €', '=x']);
    });

    it('keeps the order of the file in the headers, while the keys of a row follow the order of JavaScript', () => {
      const table: FoundryCsvTable = parseCsv('b,1\r\nx,y');
      expect(table.headers).toEqual(['b', '1']);
      expect(Object.keys(table.rows[0] ?? {})).toEqual(['1', 'b']);
    });

    it('returns new arrays and rows that are not frozen, with the prototype of a plain object', () => {
      const table: FoundryCsvTable = parseCsv('a\r\n1');
      expect(Object.isFrozen(table.rows)).toBe(false);
      expect(Object.isFrozen(table.rows[0])).toBe(false);
      expect(Object.getPrototypeOf(table.rows[0])).toBe(Object.prototype);
      expect(Array.isArray(table.headers)).toBe(true);
    });

    it('writes a header __proto__ as an own property, without changing the prototype of the row', () => {
      const row: Readonly<Record<string, string>> | undefined = parseCsv('__proto__,b\r\nx,1').rows[0];
      expect(Object.getOwnPropertyDescriptor(row, '__proto__')?.value).toBe('x');
      expect(Object.getPrototypeOf(row)).toBe(Object.prototype);
      expect((row as Record<string, unknown>)['isAdmin']).toBeUndefined();
    });

    it.each(['', '﻿', '\r\n\r\n'])('returns a table without headers or rows for %j', (text) => {
      expect(parseCsv(text)).toEqual({ delimiter: ',', headers: [], rows: [] });
      expect(parseCsv(text, { delimiter: ';' })).toEqual({ delimiter: ';', headers: [], rows: [] });
    });

    it('reads an empty first line as an empty header when skipEmptyLines is false', () => {
      const error: FoundryCsvParseError = catchError(() => parseCsv('\r\n', { skipEmptyLines: false }), FoundryCsvParseError);
      expect([error.reason, error.line, error.column]).toEqual(['emptyHeader', 1, 1]);
    });

    it('works with the options for Excel in Spanish, whose decimal separator it ignores', () => {
      expect(parseCsv('a;b\r\n1,5;2', excelSpanishCsvOptions)).toEqual({
        delimiter: ';',
        headers: ['a', 'b'],
        rows: [{ a: '1,5', b: '2' }],
      });
    });
  });

  describe('number of cells', () => {
    it('throws columnCountMismatch at the first extra cell instead of moving the columns', () => {
      const error: FoundryCsvParseError = catchError(
        () => parseCsv('Nombre,Importe,Fecha\r\nAna,12.5,2026-01-01,extra'),
        FoundryCsvParseError,
      );
      expect([error.reason, error.line, error.column]).toEqual(['columnCountMismatch', 2, 4]);
      expect(error.message).toMatch(/^\[foundry-utils\]: /);
      expect(error.message).toContain('line 2');
      expect(error.message).toContain('column 4');
    });

    it('throws columnCountMismatch at the first missing cell', () => {
      const error: FoundryCsvParseError = catchError(() => parseCsv('Nombre,Importe,Fecha\r\nLuis,7'), FoundryCsvParseError);
      expect([error.reason, error.line, error.column]).toEqual(['columnCountMismatch', 2, 3]);
    });

    it('reports the physical line of the extra cell, and the line where a row with missing cells ends', () => {
      const extra: FoundryCsvParseError = catchError(
        () => parseCsv('Nombre,Importe,Fecha\r\n"Ana\r\nMaria",12.5,2026-01-01,extra'),
        FoundryCsvParseError,
      );
      expect([extra.line, extra.column]).toEqual([3, 4]);
      const missing: FoundryCsvParseError = catchError(() => parseCsv('a,b,c\r\n1,"x\r\ny"'), FoundryCsvParseError);
      expect([missing.line, missing.column]).toEqual([3, 3]);
    });

    it('fills the missing cells and drops the extra empty ones when relaxColumnCount is true', () => {
      expect(parseCsv('A;B;C\n1;2\n4;5;6;\n', { delimiter: ';', relaxColumnCount: true }).rows).toEqual([
        { A: '1', B: '2', C: '' },
        { A: '4', B: '5', C: '6' },
      ]);
    });

    it('still throws for an extra cell with content when relaxColumnCount is true, at that cell', () => {
      const error: FoundryCsvParseError = catchError(
        () => parseCsv('A;B;C\n1;2\n4;5;6;7\n', { delimiter: ';', relaxColumnCount: true }),
        FoundryCsvParseError,
      );
      expect([error.reason, error.line, error.column]).toEqual(['columnCountMismatch', 3, 4]);
      const later: FoundryCsvParseError = catchError(
        () => parseCsv('Nombre,Importe,Fecha\r\nAna,12.5,2026-01-01,,x', { relaxColumnCount: true }),
        FoundryCsvParseError,
      );
      expect([later.line, later.column]).toEqual([2, 5]);
    });

    it('measures an extra cell as empty after trimming it, when trimCells is true', () => {
      expect(catchError(() => parseCsv('a,b\r\n1,2,  ', { relaxColumnCount: true }), FoundryCsvParseError).column).toBe(3);
      expect(parseCsv('a,b\r\n1,2,  ', { relaxColumnCount: true, trimCells: true }).rows).toEqual([{ a: '1', b: '2' }]);
    });
  });

  describe('empty and repeated headers', () => {
    it.each(['', '  ', '\t'])('throws emptyHeader for the header %j, with or without trimCells and suffixes', (header) => {
      [{}, { trimCells: true }, { duplicateHeaders: 'suffix' as const }].forEach((options) => {
        const error: FoundryCsvParseError = catchError(
          () => parseCsv(`a,${header}\r\n1,2`, { delimiter: ',', ...options }),
          FoundryCsvParseError,
        );
        expect([error.reason, error.line, error.column]).toEqual(['emptyHeader', 1, 2]);
      });
    });

    it('throws emptyHeader at the first column too', () => {
      expect(catchError(() => parseCsv(',b\r\n1,2'), FoundryCsvParseError).column).toBe(1);
    });

    it('throws duplicateHeader at the second time a header appears', () => {
      const error: FoundryCsvParseError = catchError(() => parseCsv('Importe,Fecha,Importe\r\n1,2,3'), FoundryCsvParseError);
      expect([error.reason, error.line, error.column]).toEqual(['duplicateHeader', 1, 3]);
    });

    it('tells upper case from lower case in the headers', () => {
      expect(parseCsv('Importe,importe\r\n1,2').headers).toEqual(['Importe', 'importe']);
    });

    it('compares the headers after trimming them when trimCells is true', () => {
      expect(parseCsv('Importe,Importe \r\n1,2').headers).toEqual(['Importe', 'Importe ']);
      expect(catchError(() => parseCsv('Importe,Importe \r\n1,2', { trimCells: true }), FoundryCsvParseError).reason).toBe(
        'duplicateHeader',
      );
    });

    it('renames a repeated header with the next free suffix and never takes the name of a real header', () => {
      expect(parseCsv('Importe,Importe\r\n1,2', { duplicateHeaders: 'suffix' }).headers).toEqual(['Importe', 'Importe_2']);
      expect(parseCsv('a,a,a\r\n1,2,3', { duplicateHeaders: 'suffix' }).headers).toEqual(['a', 'a_2', 'a_3']);
      expect(parseCsv('Importe,Importe,Importe_2\r\n1,2,3', { duplicateHeaders: 'suffix' })).toEqual({
        delimiter: ',',
        headers: ['Importe', 'Importe_3', 'Importe_2'],
        rows: [{ Importe: '1', Importe_3: '2', Importe_2: '3' }],
      });
    });
  });

  describe('trimCells', () => {
    it('keeps the spaces of a header without trimCells, so its key keeps them', () => {
      const table: FoundryCsvTable = parseCsv(' Importe ,b\r\n1,2');
      expect(table.headers).toEqual([' Importe ', 'b']);
      expect(table.rows[0]?.['Importe']).toBeUndefined();
      expect(table.rows[0]?.[' Importe ']).toBe('1');
    });

    it('trims the headers and the cells when asked', () => {
      expect(parseCsv(' Importe , b \r\n 1 ,2', { trimCells: true }).rows).toEqual([{ Importe: '1', b: '2' }]);
    });
  });

  describe('arguments and options', () => {
    it.each<[string, unknown]>([
      ['duplicateHeaders', 'rename'],
      ['relaxColumnCount', 'yes'],
      ['delimiter', '|'],
    ])('throws a TypeError that names the option %s for the value %j', (name, value) => {
      const thrown: unknown = catchThrown(() => parseCsv('a', { [name]: value } as never));
      expect(thrown).toBeInstanceOf(TypeError);
      expect((thrown as TypeError).message).toContain(name);
    });

    it.each<unknown>([null, 5])('throws a TypeError for the text %j, which is not a string', (text) => {
      expect(catchThrown(() => parseCsv(text as string))).toBeInstanceOf(TypeError);
    });

    it('throws a TypeError when map passes its index as the options', () => {
      expect(catchThrown(() => ['a,b\r\n1,2'].map(parseCsv as never))).toBeInstanceOf(TypeError);
    });

    it('leaves its options unchanged', () => {
      const options: FrozenSnapshot<FoundryCsvTableOptions> = freezeAndSnapshot<FoundryCsvTableOptions>({
        delimiter: ',',
        duplicateHeaders: 'suffix',
        trimCells: true,
      });
      parseCsv('a,a\r\n1,2', options.value);
      expect(options.listChanges()).toEqual([]);
    });
  });
});
