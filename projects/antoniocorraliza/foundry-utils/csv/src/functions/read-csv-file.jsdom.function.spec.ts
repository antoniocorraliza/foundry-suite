import { describe, expect, it } from 'vitest';
import { readCsvFile } from './read-csv-file.function';

describe('readCsvFile with jsdom', () => {
  it('reads a File of jsdom, which is not a Blob of Node', async () => {
    const file: File = new File(['Nombre;Ciudad\r\nNuñez;Logroño\r\n'], 'clientes.csv', { type: 'text/csv' });
    expect(Object.prototype.toString.call(file)).toBe('[object File]');
    expect(await readCsvFile(file)).toEqual({
      delimiter: ';',
      headers: ['Nombre', 'Ciudad'],
      rows: [{ Nombre: 'Nuñez', Ciudad: 'Logroño' }],
    });
  });

  it('reads a Blob of jsdom', async () => {
    expect((await readCsvFile(new Blob(['a,b\r\n1,2']))).rows).toEqual([{ a: '1', b: '2' }]);
  });
});
