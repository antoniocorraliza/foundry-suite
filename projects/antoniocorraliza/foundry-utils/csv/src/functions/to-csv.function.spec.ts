import fc from 'fast-check';
import { describe, expect, inject, it, vi } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import type { FoundryCsvColumn } from '../interfaces/foundry-csv-column.interface';
import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';
import { parseCsv } from './parse-csv.function';
import { toCsv } from './to-csv.function';

const timeZone: string = inject('expectedTimeZone');

const CELL_CHARACTERS: ReadonlyArray<string> = ['a', 'ñ', ',', ';', '\t', '"', '\r', '\n', ' ', "'", '=', '+', '-', '@', '1', '.', ' '];

class Person {
  readonly firstName: string;
  readonly lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

describe('toCsv', () => {
  describe('shape of the text', () => {
    it('ends every line with CRLF, the last one included, and quotes only the cells that need it', () => {
      expect(
        toCsv([
          { name: 'Ana', note: 'a,b' },
          { name: 'Luis', note: 'dice "hola"' },
        ]),
      ).toBe('name,note\r\nAna,"a,b"\r\nLuis,"dice ""hola"""\r\n');
    });

    it.each([
      ['a,b', '"a,b"'],
      ['a"b', '"a""b"'],
      ['a\rb', '"a\rb"'],
      ['a\nb', '"a\nb"'],
      [' a', '" a"'],
      ['a ', '"a "'],
      ['a;b', 'a;b'],
      ['a\tb', 'a\tb'],
      [' a ', ' a '],
    ])('writes the text %j as %j in a cell', (text, cell) => {
      expect(toCsv([{ a: text, b: 'x' }])).toBe(`a,b\r\n${cell},x\r\n`);
    });

    it('quotes a cell that holds the chosen delimiter, and not one that holds another', () => {
      expect(toCsv([{ a: 'x;y', b: 'x,y' }], { delimiter: ';' })).toBe('a;b\r\n"x;y";x,y\r\n');
      expect(toCsv([{ a: 'x\ty', b: 'x,y' }], { delimiter: '\t' })).toBe('a\tb\r\n"x\ty"\tx,y\r\n');
    });

    it('quotes every cell, the headers and the empty ones included, when quoting is always', () => {
      expect(toCsv([{ a: 1, b: '' }], { quoting: 'always' })).toBe('"a","b"\r\n"1",""\r\n');
    });

    it('writes no header line when includeHeader is false', () => {
      expect(toCsv([{ a: 1 }, { a: 2 }], { includeHeader: false })).toBe('1\r\n2\r\n');
    });

    it('ends the lines with LF when asked, and keeps a CRLF inside a quoted cell', () => {
      expect(toCsv([{ a: 'x\r\ny', b: 1 }], { lineBreak: '\n' })).toBe('a,b\n"x\r\ny",1\n');
    });
  });

  describe('default columns', () => {
    it('writes the union of the keys of every row, also a key that only the second row has', () => {
      expect(toCsv([{ a: 1 }, { a: 2, b: 3 }])).toBe('a,b\r\n1,\r\n2,3\r\n');
    });

    it('writes the keys in the order of Object.keys, with the integer keys first', () => {
      expect(toCsv([{ b: 1, 2: 'x', a: 3 }])).toBe('2,b,a\r\nx,1,3\r\n');
    });

    it.each<[string, unknown]>([
      ['a Map', new Map([['a', 1]])],
      ['null', null],
      ['a class instance', new Person('Ana', 'Ruiz')],
      ['an array', [1, 2]],
      ['a number', 5],
    ])('throws a TypeError that names the row when a row is %s and there are no columns', (_description, row) => {
      const thrown: TypeError = catchError(() => toCsv([{ a: 1 }, row as object]), TypeError);
      expect(thrown.message).toMatch(/^\[foundry-utils\]: /);
      expect(thrown.message).toContain('rows[1]');
    });

    it('ignores symbol keys, accessors and keys that are not enumerable, and never runs a getter', () => {
      const getter: () => string = vi.fn(() => 'secret');
      const row: Record<string | symbol, unknown> = { a: 1, [Symbol('hidden')]: 2 };
      Object.defineProperty(row, 'computed', { get: getter, enumerable: true });
      Object.defineProperty(row, 'hidden', { value: 3, enumerable: false });
      expect(toCsv([row])).toBe('a\r\n1\r\n');
      expect(getter).not.toHaveBeenCalled();
    });

    it('writes a header __proto__ as one more column', () => {
      const row: Record<string, unknown> = JSON.parse('{"__proto__":"x","b":1}') as Record<string, unknown>;
      expect(toCsv([row])).toBe('__proto__,b\r\nx,1\r\n');
    });
  });

  describe('rows without cells', () => {
    it('writes only the header line when there are columns and no rows', () => {
      const columns: ReadonlyArray<FoundryCsvColumn<{ subject: string; amount: number }>> = [
        { header: 'Asunto', value: 'subject' },
        { header: 'Importe', value: 'amount' },
      ];
      expect(toCsv([], { columns })).toBe('Asunto,Importe\r\n');
    });

    it('writes an empty text when no column is known', () => {
      expect(toCsv([])).toBe('');
      expect(toCsv([{}, {}])).toBe('');
    });

    it('writes an empty text without header line and without rows', () => {
      expect(toCsv([], { includeHeader: false, columns: [{ header: 'a', value: () => 1 }] })).toBe('');
    });

    it('writes an empty cell of a single column as two quotes, so that its line is not empty', () => {
      expect(toCsv([{ a: '' }, { a: 'x' }])).toBe('a\r\n""\r\nx\r\n');
      expect(toCsv([{ a: null }])).toBe('a\r\n""\r\n');
      expect(toCsv([{ a: '' }], { includeHeader: false })).toBe('""\r\n');
    });

    it('leaves empty cells without quotes when the row has more than one column', () => {
      expect(toCsv([{ a: '', b: null }])).toBe('a,b\r\n,\r\n');
    });

    it('keeps every row of a single column when parseCsv reads it back', () => {
      expect(parseCsv(toCsv([{ a: '' }, { a: 'x' }])).rows).toEqual([{ a: '' }, { a: 'x' }]);
    });
  });

  describe('values', () => {
    it('writes texts as they are, also a calendar day and a local date and time', () => {
      expect(toCsv([{ a: 'Nuñez', b: '2026-09-06', c: '2026-11-14T09:30' }])).toBe('a,b,c\r\nNuñez,2026-09-06,2026-11-14T09:30\r\n');
    });

    it('writes numbers without group separators and with the decimal separator of the options', () => {
      expect(toCsv([{ a: 1234567.5, b: -12.5 }])).toBe('a,b\r\n1234567.5,-12.5\r\n');
      expect(toCsv([{ a: 1234567.5, b: -12.5 }], { delimiter: ';', decimalSeparator: ',' })).toBe('a;b\r\n1234567,5;-12,5\r\n');
    });

    it('quotes a number with a decimal comma when the delimiter is also a comma', () => {
      expect(toCsv([{ a: 12.5, b: 1 }], { decimalSeparator: ',' })).toBe('a,b\r\n"12,5",1\r\n');
    });

    it.each([
      [1e21, '1000000000000000000000'],
      [1.5e-7, '0.00000015'],
      [-1.5e-7, '-0.00000015'],
      [1e-7, '0.0000001'],
      [-0, '0'],
      [123456789012345680000, '123456789012345680000'],
    ])('writes the number %d in positional notation as %s', (value, cell) => {
      expect(toCsv([{ a: value, b: 'x' }])).toBe(`a,b\r\n${cell},x\r\n`);
    });

    it('writes a positional number with a decimal comma when asked', () => {
      expect(toCsv([{ a: 1.5e-7, b: 'x' }], { delimiter: ';', decimalSeparator: ',' })).toBe('a;b\r\n0,00000015;x\r\n');
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, null, undefined])('writes %s as an empty cell', (value) => {
      expect(toCsv([{ a: value, b: 'x' }])).toBe('a,b\r\n,x\r\n');
    });

    it('writes booleans as true and false', () => {
      expect(toCsv([{ a: true, b: false }])).toBe('a,b\r\ntrue,false\r\n');
    });

    it('writes the digits of a bigint with its sign', () => {
      expect(toCsv([{ a: -5n, b: 12345678901234567890n }])).toBe('a,b\r\n-5,12345678901234567890\r\n');
    });

    it('writes a date at midnight as its local day, without time', () => {
      expect(toCsv([{ a: new Date(2026, 0, 15), b: 'x' }])).toBe('a,b\r\n2026-01-15,x\r\n');
    });

    it('writes a date at the first instant of its local day without time, even when that is not midnight', () => {
      const cell: string = timeZone === 'America/Santiago' ? '2026-09-06' : '2026-09-06 01:00:00';
      expect(toCsv([{ vence: new Date(2026, 8, 6, 1, 0), b: 'x' }])).toBe(`vence,b\r\n${cell},x\r\n`);
    });

    it('writes any other date with its local time to the second, without milliseconds', () => {
      expect(toCsv([{ a: new Date(2026, 2, 1, 10, 30, 15, 999), b: 'x' }])).toBe('a,b\r\n2026-03-01 10:30:15,x\r\n');
    });

    it('writes an invalid date as an empty cell', () => {
      expect(toCsv([{ a: new Date(Number.NaN), b: 'x' }])).toBe('a,b\r\n,x\r\n');
    });

    it('throws a RangeError that names the row and the column for a date outside the years 1 to 9999', () => {
      const thrown: RangeError = catchError(() => toCsv([{ a: 1 }, { a: 2, Vence: new Date(Date.UTC(10000, 0, 1, 12)) }]), RangeError);
      expect(thrown.message).toContain('rows[1]');
      expect(thrown.message).toContain('Vence');
    });

    it.each<[string, unknown]>([
      ['an object', {}],
      ['an array', [1]],
      ['a Map', new Map()],
      ['a String object', new String('x')],
      ['a Blob', new Blob(['x'])],
      ['a symbol', Symbol('x')],
      ['a function', () => 1],
    ])('throws a TypeError that names the row and the column for %s, instead of writing [object Object]', (_description, value) => {
      const thrown: TypeError = catchError(() => toCsv([{ Importe: 1 }, { Importe: 2 }, { Importe: 3 }, { Importe: value }]), TypeError);
      expect(thrown.message).toMatch(/^\[foundry-utils\]: /);
      expect(thrown.message).toContain('rows[3]');
      expect(thrown.message).toContain('Importe');
    });
  });

  describe('formula escaping', () => {
    it.each([
      ['=1+1', "'=1+1"],
      ['+34 600 000 000', "'+34 600 000 000"],
      ['-2+3+cmd|', "'-2+3+cmd|"],
      ['@SUM(1)', "'@SUM(1)"],
      ['\t=1+1', "'\t=1+1"],
    ])('puts an apostrophe in front of %j, which starts with a dangerous character and is not a number', (text, cell) => {
      expect(toCsv([{ a: text, b: 'x' }])).toBe(`a,b\r\n${cell},x\r\n`);
    });

    it('puts an apostrophe in front of a text that starts with a carriage return, and quotes it', () => {
      expect(toCsv([{ a: '\r=1', b: 'x' }])).toBe(`a,b\r\n"'\r=1",x\r\n`);
    });

    it.each([
      ["'=x", "''=x"],
      ["''-5", "'''-5"],
      ["'@a", "''@a"],
    ])('adds one more apostrophe to %j, which starts with apostrophes and a dangerous character', (text, cell) => {
      expect(toCsv([{ a: text, b: 'x' }])).toBe(`a,b\r\n${cell},x\r\n`);
    });

    it.each(['-12.50', '+1', '-5', '.5', '-0.5', '+34600000000'])(
      'writes the text %j, which is a number, without an apostrophe',
      (text) => {
        expect(toCsv([{ a: text, b: 'x' }])).toBe(`a,b\r\n${text},x\r\n`);
      },
    );

    it.each(["'abc", 'a=b', 'abc-'])('writes the text %j as it is', (text) => {
      expect(toCsv([{ a: text, b: 'x' }])).toBe(`a,b\r\n${text},x\r\n`);
    });

    it('never escapes numbers and bigints, and escapes the other dangerous texts, also in the headers', () => {
      expect(toCsv([{ number: -5, bigint: -5n, text: '-12.50', phone: '+34 600 000 000' }])).toBe(
        "number,bigint,text,phone\r\n-5,-5,-12.50,'+34 600 000 000\r\n",
      );
      expect(toCsv([{ x: 1 }], { columns: [{ header: '=1+1', value: 'x' }] })).toBe("'=1+1\r\n1\r\n");
    });

    it('escapes the text that a format returns', () => {
      expect(
        toCsv([{ x: 1, y: 2 }], {
          columns: [
            { header: 'a', value: 'x', format: () => '=x' },
            { header: 'b', value: 'y' },
          ],
        }),
      ).toBe("a,b\r\n'=x,2\r\n");
    });

    it('quotes and escapes a HYPERLINK formula', () => {
      expect(toCsv([{ a: '=HYPERLINK("http://x","y")', b: 'x' }])).toBe(`a,b\r\n"'=HYPERLINK(""http://x"",""y"")",x\r\n`);
    });

    it('writes every text as it is when formulaEscaping is none', () => {
      expect(toCsv([{ '=h': '=1+1', b: "'=x" }], { formulaEscaping: 'none' })).toBe("=h,b\r\n=1+1,'=x\r\n");
    });
  });

  describe('columns', () => {
    it('reads a key of the row with normal access, so a getter of a class gives its value', () => {
      expect(toCsv([new Person('Ana', 'Ruiz')], { columns: [{ header: 'Nombre', value: 'fullName' }] })).toBe('Nombre\r\nAna Ruiz\r\n');
    });

    it('computes a cell with the function of the column', () => {
      expect(toCsv([{ a: 2 }], { columns: [{ header: 'Doble', value: (row) => row.a * 2 }] })).toBe('Doble\r\n4\r\n');
    });

    it('calls format with the value and the row, also when the value is null or undefined', () => {
      const format: (value: unknown, row: { a: number | null }) => string = vi.fn((value: unknown) => `<${String(value)}>`);
      const rows: Array<{ a: number | null }> = [{ a: null }, { a: 1 }];
      expect(toCsv(rows, { columns: [{ header: 'a', value: 'a', format }] })).toBe('a\r\n<null>\r\n<1>\r\n');
      expect(format).toHaveBeenNthCalledWith(1, null, rows[0]);
      expect(format).toHaveBeenNthCalledWith(2, 1, rows[1]);
    });

    it('reads the key __proto__ as an own property', () => {
      const rows: Array<Record<string, unknown>> = [JSON.parse('{"__proto__":"x","b":1}') as Record<string, unknown>, { b: 2 }];
      const columns: ReadonlyArray<FoundryCsvColumn<Record<string, unknown>>> = [
        { header: 'p', value: '__proto__' },
        { header: 'b', value: 'b' },
      ];
      expect(toCsv(rows, { columns })).toBe('p,b\r\nx,1\r\n,2\r\n');
    });

    it('writes repeated and empty headers as they are', () => {
      expect(
        toCsv([{ x: 1, y: 2 }], {
          columns: [
            { header: 'a', value: 'x' },
            { header: 'a', value: 'y' },
          ],
        }),
      ).toBe('a,a\r\n1,2\r\n');
      expect(
        toCsv([{ x: 1, y: 2 }], {
          columns: [
            { header: '', value: 'x' },
            { header: 'b', value: 'y' },
          ],
        }),
      ).toBe(',b\r\n1,2\r\n');
    });

    it.each<[string, unknown, string]>([
      ['a text', 'a', 'columns'],
      ['a list with null', [{ header: 'a', value: 'a' }, null], 'columns[1]'],
      [
        'a header that is not a text',
        [
          { header: 'a', value: 'a' },
          { header: 1, value: 'a' },
        ],
        'columns[1]',
      ],
      [
        'a value that is neither a key nor a function',
        [
          { header: 'a', value: 'a' },
          { header: 'b', value: 5 },
        ],
        'columns[1]',
      ],
      [
        'a format that is not a function',
        [
          { header: 'a', value: 'a' },
          { header: 'b', value: 'a', format: 'x' },
        ],
        'columns[1]',
      ],
    ])('throws a TypeError that names the column for %s, also without rows', (_description, columns, name) => {
      [[{ a: 1 }], []].forEach((rows) => {
        const thrown: TypeError = catchError(() => toCsv(rows, { columns } as never), TypeError);
        expect(thrown.message).toContain(name);
      });
    });

    it('never runs a getter of a column', () => {
      const getter: () => string = vi.fn(() => 'a');
      const column: object = Object.defineProperty({ value: 'a' }, 'header', { get: getter, enumerable: true });
      expect(catchThrown(() => toCsv([{ a: 1 }], { columns: [column] } as never))).toBeInstanceOf(TypeError);
      expect(getter).not.toHaveBeenCalled();
    });

    it('throws a TypeError that names the row and the column when a format does not return a text', () => {
      const thrown: TypeError = catchError(
        () => toCsv([{ a: 1 }, { a: 2 }], { columns: [{ header: 'Importe', value: 'a', format: (value) => value as string }] }),
        TypeError,
      );
      expect(thrown.message).toContain('rows[0]');
      expect(thrown.message).toContain('Importe');
    });

    it('lets the error of a value or a format of the application through as it is', () => {
      const failure: Error = new Error('[app]: broken column');
      const throwFailure = (): never => {
        throw failure;
      };
      expect(catchThrown(() => toCsv([{ a: 1 }], { columns: [{ header: 'a', value: throwFailure }] }))).toBe(failure);
      expect(catchThrown(() => toCsv([{ a: 1 }], { columns: [{ header: 'a', value: 'a', format: throwFailure }] }))).toBe(failure);
    });

    it.each([5, null, 'row'])('throws a TypeError that names the row when the row %j is not an object', (row) => {
      const thrown: TypeError = catchError(
        () => toCsv([{ a: 1 }, row as never], { columns: [{ header: 'a', value: () => 1 }] }),
        TypeError,
      );
      expect(thrown.message).toContain('rows[1]');
    });
  });

  describe('arguments and options', () => {
    it.each<unknown>([null, undefined, 'a,b', { length: 1, 0: { a: 1 } }])(
      'throws a TypeError for the rows %j, which are not an array',
      (rows) => {
        expect(catchThrown(() => toCsv(rows as never))).toBeInstanceOf(TypeError);
      },
    );

    it.each<unknown>([5, 'x', true, null, []])('throws a TypeError for the options %j, which are not an object', (options) => {
      expect(catchThrown(() => toCsv([{ a: 1 }], options as never))).toBeInstanceOf(TypeError);
    });

    it.each<[string, unknown]>([
      ['delimiter', '|'],
      ['decimalSeparator', ';'],
      ['lineBreak', '\r'],
      ['quoting', 'never'],
      ['includeHeader', 'yes'],
      ['formulaEscaping', 'escape'],
    ])('throws a TypeError that names the option %s for the value %j', (name, value) => {
      const thrown: TypeError = catchError(() => toCsv([{ a: 1 }], { [name]: value } as never), TypeError);
      expect(thrown.message).toContain(name);
    });

    it('takes a null option as a missing one and ignores the names it does not know', () => {
      expect(toCsv([{ a: 1, b: 2 }], { delimiter: null, unknown: true } as never)).toBe('a,b\r\n1,2\r\n');
    });

    it('throws a TypeError when map passes its index as the options', () => {
      expect(catchThrown(() => [[{ a: 1 }]].map(toCsv as never))).toBeInstanceOf(TypeError);
    });

    it('leaves its rows, columns and options unchanged', () => {
      const rows: FrozenSnapshot<Array<{ a: number; when: Date }>> = freezeAndSnapshot([{ a: 1, when: new Date(2026, 0, 1, 10) }]);
      const options: FrozenSnapshot<FoundryCsvWriteOptions<{ a: number; when: Date }>> = freezeAndSnapshot<
        FoundryCsvWriteOptions<{ a: number; when: Date }>
      >({
        delimiter: ';',
        columns: [
          { header: 'a', value: 'a' },
          { header: 'when', value: 'when' },
        ],
      });
      toCsv(rows.value, options.value);
      expect(rows.listChanges()).toEqual([]);
      expect(options.listChanges()).toEqual([]);
    });
  });

  it('reads back the same texts with parseCsv for any rows', () => {
    const header: fc.Arbitrary<string> = fc.oneof(
      fc.constantFrom('__proto__', 'Importe', '=1+1', "'-5", 'Apellidos, Nombre'),
      fc.string({ unit: fc.constantFrom(...CELL_CHARACTERS), minLength: 1, maxLength: 6 }).filter((text) => text.trim() !== ''),
    );
    const cell: fc.Arbitrary<string> = fc.oneof(
      fc.constantFrom('', '-5', "'-5", '=x', "'=x", '12,50', '+34 600 000 000'),
      fc.string({ unit: fc.constantFrom(...CELL_CHARACTERS), maxLength: 8 }),
    );
    const table: fc.Arbitrary<[Array<string>, Array<Array<string>>]> = fc
      .uniqueArray(header, { minLength: 1, maxLength: 4 })
      .chain((headers) =>
        fc.tuple(fc.constant(headers), fc.array(fc.array(cell, { minLength: headers.length, maxLength: headers.length }))),
      );
    fc.assert(
      fc.property(table, fc.constantFrom<',' | ';' | '\t'>(',', ';', '\t'), ([headers, cells], delimiter) => {
        const rows: Array<Record<string, string>> = cells.map((rowCells) => {
          const row: Record<string, string> = {};
          headers.forEach((name, index) => Object.defineProperty(row, name, { value: rowCells[index], enumerable: true }));
          return row;
        });
        const columns: Array<FoundryCsvColumn<Record<string, string>>> = headers.map((name) => ({ header: name, value: name }));
        const read: ReadonlyArray<Readonly<Record<string, string>>> = parseCsv(toCsv(rows, { columns, delimiter }), { delimiter }).rows;
        expect(read.map((row) => headers.map((name) => Object.getOwnPropertyDescriptor(row, name)?.value))).toEqual(cells);
      }),
    );
  });
});
