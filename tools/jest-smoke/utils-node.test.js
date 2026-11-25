/** @jest-environment node */
import { describe, expect, it } from '@jest/globals';
import { readCsvFile } from '@antoniocorraliza/foundry-utils/csv';
import { sha256 } from '@antoniocorraliza/foundry-utils/hash';

describe('Foundry Utils under Jest with the node environment', () => {
  it('reads a CSV file with accents', async () => {
    const table = await readCsvFile(new File(['Nombre;Ciudad\r\nNuñez;Logroño\r\n'], 'clientes.csv'));
    expect(table.delimiter).toBe(';');
    expect(table.rows).toEqual([{ Nombre: 'Nuñez', Ciudad: 'Logroño' }]);
  });

  it('computes a hash, which needs the crypto.subtle of Node', async () => {
    expect(await sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});
