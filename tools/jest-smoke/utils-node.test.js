/** @jest-environment node */
import { describe, expect, it } from '@jest/globals';
import { readCsvFile } from '@antoniocorraliza/foundry-utils/csv';

describe('Foundry Utils under Jest with the node environment', () => {
  it('reads a CSV file with accents', async () => {
    const table = await readCsvFile(new File(['Nombre;Ciudad\r\nNuñez;Logroño\r\n'], 'clientes.csv'));
    expect(table.delimiter).toBe(';');
    expect(table.rows).toEqual([{ Nombre: 'Nuñez', Ciudad: 'Logroño' }]);
  });
});
