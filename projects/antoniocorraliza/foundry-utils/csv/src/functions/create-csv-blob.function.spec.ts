import { describe, expect, it } from 'vitest';
import { ɵparseBooleanOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { excelSpanishCsvOptions } from '../constants/excel-spanish-csv-options.constant';
import { createCsvBlob } from './create-csv-blob.function';

type BlobOptions = NonNullable<Parameters<typeof createCsvBlob<{ a: number }>>[1]>;

async function readBlobBytes(blob: Blob): Promise<Array<number>> {
  return Array.from(new Uint8Array(await blob.arrayBuffer()));
}

describe('createCsvBlob', () => {
  it('starts with the UTF-8 byte order mark and has the CSV type, from the rows alone', async () => {
    const blob: Blob = createCsvBlob([{ a: 1 }]);
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(await readBlobBytes(blob)).toEqual([0xef, 0xbb, 0xbf, 0x61, 0x0d, 0x0a, 0x31, 0x0d, 0x0a]);
  });

  it('writes the text in UTF-8', async () => {
    expect(await readBlobBytes(createCsvBlob([{ a: 'Nuñez' }], { byteOrderMark: false }))).toEqual([
      0x61, 0x0d, 0x0a, 0x4e, 0x75, 0xc3, 0xb1, 0x65, 0x7a, 0x0d, 0x0a,
    ]);
  });

  it('writes no byte order mark when byteOrderMark is false', async () => {
    const blob: Blob = createCsvBlob([{ a: 1 }], { byteOrderMark: false });
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(await readBlobBytes(blob)).toEqual([0x61, 0x0d, 0x0a, 0x31, 0x0d, 0x0a]);
  });

  it('returns a valid Blob without rows or columns: only the byte order mark, or nothing', async () => {
    expect(await readBlobBytes(createCsvBlob([]))).toEqual([0xef, 0xbb, 0xbf]);
    expect(createCsvBlob([], { byteOrderMark: false }).size).toBe(0);
  });

  it('writes the text that toCsv writes, here with the options for Excel in Spanish', async () => {
    const blob: Blob = createCsvBlob([{ Asunto: 'Luz', Importe: 12.5 }], excelSpanishCsvOptions);
    const text: string = new TextDecoder('utf-8', { ignoreBOM: true }).decode(await blob.arrayBuffer());
    expect(text).toBe('﻿Asunto;Importe\r\nLuz;12,5\r\n');
  });

  it('throws the errors of toCsv at once, before returning a Blob', () => {
    expect(catchThrown(() => createCsvBlob([{ a: {} }]))).toBeInstanceOf(TypeError);
    expect(catchThrown(() => createCsvBlob([{ a: 1 }], { delimiter: '|' } as never))).toBeInstanceOf(TypeError);
  });

  it('rejects a byteOrderMark that is not a boolean as parseBooleanOption does', () => {
    expect(catchError(() => createCsvBlob([{ a: 1 }], { byteOrderMark: 'false' } as never), TypeError).message).toBe(
      catchError(() => ɵparseBooleanOption({ options: { byteOrderMark: 'false' }, name: 'byteOrderMark', fallback: true }), TypeError)
        .message,
    );
  });

  it('leaves its rows and options unchanged', () => {
    const rows: FrozenSnapshot<Array<{ a: number }>> = freezeAndSnapshot([{ a: 1 }]);
    const options: FrozenSnapshot<BlobOptions> = freezeAndSnapshot<BlobOptions>({
      byteOrderMark: false,
      columns: [{ header: 'a', value: 'a' }],
    });
    createCsvBlob(rows.value, options.value);
    expect(rows.listChanges()).toEqual([]);
    expect(options.listChanges()).toEqual([]);
  });
});
