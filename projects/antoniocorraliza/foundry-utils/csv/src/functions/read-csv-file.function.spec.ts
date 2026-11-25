import { afterEach, describe, expect, it, vi } from 'vitest';
import { catchRejectedError } from '@foundry-test/functions/catch-rejected-error.function';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import { createObjectWithFakeTag } from '@foundry-test/functions/create-object-with-fake-tag.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { FoundryCsvTable } from '../interfaces/foundry-csv-table.interface';
import type { FoundryCsvTableOptions } from '../interfaces/foundry-csv-table-options.interface';
import type { FoundryTextEncoding } from '../types/foundry-text-encoding.type';
import { decodeCsvBytes } from './decode-csv-bytes.function';
import { parseCsv } from './parse-csv.function';
import { readCsvFile } from './read-csv-file.function';

describe('readCsvFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads a File as parseCsv reads its text', async () => {
    const file: File = new File(['Nombre;Total\r\nAna;1,5\r\nLuis;2\r\n'], 'totales.csv', { type: 'text/csv' });
    expect(await readCsvFile(file)).toEqual({
      delimiter: ';',
      headers: ['Nombre', 'Total'],
      rows: [
        { Nombre: 'Ana', Total: '1,5' },
        { Nombre: 'Luis', Total: '2' },
      ],
    });
  });

  it('reads a Blob too', async () => {
    expect((await readCsvFile(new Blob(['a,b\r\n1,2']))).rows).toEqual([{ a: '1', b: '2' }]);
  });

  it('reads the table that parseCsv reads from the text that decodeCsvBytes decodes', async () => {
    const files: ReadonlyArray<Uint8Array<ArrayBuffer>> = [
      new Uint8Array([0x4e, 0x6f, 0x6d, 0x62, 0x72, 0x65, 0x0d, 0x0a, 0x4e, 0x75, 0xf1, 0x65, 0x7a]),
      new Uint8Array([0xff, 0xfe, 0x61, 0x00, 0x0d, 0x00, 0x0a, 0x00, 0xf1, 0x00]),
      new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0x3b, 0x62, 0x0a, 0x31, 0x3b, 0x32]),
    ];
    const tables: Array<FoundryCsvTable> = await Promise.all(files.map((bytes) => readCsvFile(new Blob([bytes]))));
    expect(tables).toEqual(files.map((bytes) => parseCsv(decodeCsvBytes(bytes, 'auto'))));
  });

  it('rejects zero bytes without a byte order mark with invalidEncoding', async () => {
    const rejection: FoundryCsvParseError = await catchRejectedError(
      () => readCsvFile(new Blob([new Uint8Array([0x4e, 0x00, 0xf1, 0x00])])),
      FoundryCsvParseError,
    );
    expect(rejection.reason).toBe('invalidEncoding');
  });

  it('reads with the asked encoding', async () => {
    const utf8WithMark: Blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0x0d, 0x0a, 0x31])]);
    expect((await readCsvFile(utf8WithMark, { encoding: 'windows-1252' })).headers).toEqual(['ï»¿a']);
  });

  it('passes the options of parseCsv on', async () => {
    const file: File = new File([' a , a \r\n1,2'], 'a.csv');
    expect(await readCsvFile(file, { trimCells: true, duplicateHeaders: 'suffix' })).toEqual({
      delimiter: ',',
      headers: ['a', 'a_2'],
      rows: [{ a: '1', a_2: '2' }],
    });
  });

  it.each([[[]], [[0xef, 0xbb, 0xbf]]])('reads the file with the bytes %j as a table without headers or rows', async (values) => {
    expect(await readCsvFile(new Blob([new Uint8Array(values)]))).toEqual({ delimiter: ',', headers: [], rows: [] });
  });

  it.each<unknown>([null, 'a.csv', {}, new Uint8Array([0x61])])(
    'returns a promise rejected with a TypeError for %j, which is not a Blob, instead of throwing',
    async (file) => {
      expect(await catchRejection(() => readCsvFile(file as Blob))).toBeInstanceOf(TypeError);
    },
  );

  it.each<unknown>([5, 'x', null, { encoding: 'latin1' }, { delimiter: '|' }])(
    'returns a promise rejected with a TypeError for the options %j, instead of throwing',
    async (options) => {
      expect(await catchRejection(() => readCsvFile(new Blob(['a']), options as never))).toBeInstanceOf(TypeError);
    },
  );

  it('returns a promise rejected with a FoundryCsvParseError for a document that is not well formed', async () => {
    const rejection: FoundryCsvParseError = await catchRejectedError(() => readCsvFile(new Blob(['a,"b'])), FoundryCsvParseError);
    expect(rejection.reason).toBe('unclosedQuote');
  });

  it('rejects with a TypeError that names TextDecoder when the environment lacks it', async () => {
    vi.stubGlobal('TextDecoder', undefined);
    const rejection: TypeError = await catchRejectedError(() => readCsvFile(new Blob(['a'])), TypeError);
    expect(rejection.message).toMatch(/^\[foundry-utils\]: /);
    expect(rejection.message).toContain('TextDecoder');
  });

  it('takes an object by its Blob tag, and rejects with a TypeError that names arrayBuffer when it lacks it', async () => {
    const rejection: TypeError = await catchRejectedError(() => readCsvFile(createObjectWithFakeTag('Blob') as Blob), TypeError);
    expect(rejection.message).toContain('arrayBuffer');
  });

  it('leaves its options unchanged', async () => {
    const options: FrozenSnapshot<FoundryCsvTableOptions & { readonly encoding?: FoundryTextEncoding }> = freezeAndSnapshot<
      FoundryCsvTableOptions & { readonly encoding?: FoundryTextEncoding }
    >({ encoding: 'utf-8', trimCells: true });
    await readCsvFile(new Blob(['a\r\n1']), options.value);
    expect(options.listChanges()).toEqual([]);
  });
});
