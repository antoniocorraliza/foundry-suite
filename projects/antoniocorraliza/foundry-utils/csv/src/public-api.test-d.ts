import { describe, expectTypeOf, it } from 'vitest';
import type {
  FoundryCsvColumn,
  FoundryCsvDelimiter,
  FoundryCsvParseError,
  FoundryCsvParseOptions,
  FoundryCsvTable,
  FoundryCsvTableOptions,
  FoundryCsvWriteOptions,
  FoundryTextEncoding,
} from './public-api';
import { createCsvBlob, excelSpanishCsvOptions, parseCsv, parseCsvRecords, readCsvFile, toCsv } from './public-api';

interface Ticket {
  readonly subject: string;
  readonly amount: number;
}

describe('types of the csv entry', () => {
  it('declares the public types as the design fixes them', () => {
    expectTypeOf<FoundryCsvDelimiter>().toEqualTypeOf<',' | ';' | '\t'>();
    expectTypeOf<FoundryTextEncoding>().toEqualTypeOf<'auto' | 'utf-8' | 'utf-16le' | 'windows-1252'>();
    expectTypeOf(excelSpanishCsvOptions).toEqualTypeOf<Readonly<{ delimiter: ';'; decimalSeparator: ',' }>>();
    expectTypeOf<FoundryCsvTable>().toEqualTypeOf<{
      readonly delimiter: FoundryCsvDelimiter;
      readonly headers: ReadonlyArray<string>;
      readonly rows: ReadonlyArray<Readonly<Record<string, string>>>;
    }>();
    expectTypeOf<FoundryCsvParseOptions['delimiter']>().toEqualTypeOf<FoundryCsvDelimiter | 'auto' | undefined>();
    expectTypeOf<FoundryCsvTableOptions['duplicateHeaders']>().toEqualTypeOf<'error' | 'suffix' | undefined>();
    expectTypeOf<FoundryCsvWriteOptions<Ticket>['columns']>().toEqualTypeOf<ReadonlyArray<FoundryCsvColumn<Ticket>> | undefined>();
    expectTypeOf<FoundryCsvColumn<Ticket>['value']>().toEqualTypeOf<'subject' | 'amount' | ((row: Ticket) => unknown)>();
    expectTypeOf<NonNullable<FoundryCsvColumn<Ticket>['format']>>().toEqualTypeOf<(value: unknown, row: Ticket) => string>();
    expectTypeOf<FoundryCsvParseError['reason']>().toEqualTypeOf<
      'unclosedQuote' | 'unexpectedQuote' | 'columnCountMismatch' | 'duplicateHeader' | 'emptyHeader' | 'invalidEncoding'
    >();
  });

  it('returns a text, a Blob, a table, a list of records and a promise of a table', () => {
    expectTypeOf(toCsv<Ticket>).returns.toEqualTypeOf<string>();
    expectTypeOf(createCsvBlob<Ticket>).returns.toEqualTypeOf<Blob>();
    expectTypeOf(parseCsv).returns.toEqualTypeOf<FoundryCsvTable>();
    expectTypeOf(parseCsvRecords).returns.toEqualTypeOf<Array<Array<string>>>();
    expectTypeOf(readCsvFile).returns.toEqualTypeOf<Promise<FoundryCsvTable>>();
  });

  it('accepts only the keys of the row as the value of a column', () => {
    const tickets: Array<Ticket> = [];
    toCsv(tickets, {
      columns: [
        { header: 'Asunto', value: 'subject' },
        { header: 'Doble', value: (ticket) => ticket.amount * 2 },
      ],
    });
    // @ts-expect-error a ticket has no owner
    toCsv(tickets, { columns: [{ header: 'Dueño', value: 'owner' }] });
  });

  it('takes the options for Excel in Spanish when it writes and when it reads', () => {
    toCsv([{ a: 1 }], excelSpanishCsvOptions);
    createCsvBlob([{ a: 1 }], { ...excelSpanishCsvOptions, byteOrderMark: false });
    parseCsv('a;b', excelSpanishCsvOptions);
  });

  it('cannot be passed to map, which would give its index as the options', () => {
    const lists: Array<Array<Ticket>> = [];
    // @ts-expect-error map gives the index as the options of toCsv
    lists.map(toCsv);
    // @ts-expect-error map gives the index as the options of parseCsv
    ['a'].map(parseCsv);
  });

  it('accepts only the closed values of the options', () => {
    // @ts-expect-error the delimiters are a comma, a semicolon and a tab
    toCsv([{ a: 1 }], { delimiter: '|' });
    // @ts-expect-error the byte order mark is an option of createCsvBlob only
    toCsv([{ a: 1 }], { byteOrderMark: false });
    // @ts-expect-error UTF-16 big endian is only read through its byte order mark
    void readCsvFile(new Blob([]), { encoding: 'utf-16be' });
    // @ts-expect-error duplicateHeaders is an option of the table only
    parseCsvRecords('a', { duplicateHeaders: 'suffix' });
  });
});
