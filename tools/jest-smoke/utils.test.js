import { describe, expect, it } from '@jest/globals';
import { runInNewContext } from 'node:vm';
import { FoundryCryptoUnavailableError, FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import { downloadBlob, FoundryBrowserApiUnavailableError } from '@antoniocorraliza/foundry-utils/browser';
import { FoundryKeyCollisionError, toCamelCaseKeys } from '@antoniocorraliza/foundry-utils/case';
import { readCsvFile } from '@antoniocorraliza/foundry-utils/csv';
import { createFormData } from '@antoniocorraliza/foundry-utils/form-data';
import { sha256 } from '@antoniocorraliza/foundry-utils/hash';
import { deepClone, isPlainObject } from '@antoniocorraliza/foundry-utils/object';
import { createUuidV4 } from '@antoniocorraliza/foundry-utils/random';

describe('Foundry Utils under Jest with jsdom', () => {
  it('keeps a jsdom file by reference in a deep clone', () => {
    const doc = new File(['x'], 'a.txt');
    expect(deepClone({ doc }).doc).toBe(doc);
  });

  it('tells plain objects from other objects in any context', () => {
    expect(isPlainObject(new File(['x'], 'a.txt'))).toBe(false);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(JSON.parse('{"a":1}'))).toBe(true);
    expect(isPlainObject(runInNewContext('({ a: 1 })'))).toBe(true);
  });

  it('converts keys and throws its named errors', () => {
    expect(toCamelCaseKeys({ user_id: 1, items: [{ created_at: 'x' }] })).toEqual({ userId: 1, items: [{ createdAt: 'x' }] });
    const convertCollidingKeys = () => toCamelCaseKeys({ user_id: 1, userId: 2 });
    expect(convertCollidingKeys).toThrow(FoundryKeyCollisionError);
    expect(convertCollidingKeys).toThrow(FoundryUtilsError);
  });

  it('rejects reading a CSV file with a TypeError that names what jsdom lacks', async () => {
    const reading = readCsvFile(new File(['Nombre\nNuñez\n'], 'a.csv'));
    await expect(reading).rejects.toThrow(TypeError);
    await expect(reading).rejects.toThrow(/TextDecoder/);
    await expect(reading).rejects.toThrow(/arrayBuffer/);
  });

  it('throws its named error when a download needs URL.createObjectURL', () => {
    let thrown = null;
    try {
      downloadBlob(new Blob(['a']), 'a.csv');
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(FoundryBrowserApiUnavailableError);
    expect(thrown.missingApi).toBe('URL.createObjectURL');
    expect(document.querySelector('a')).toBeNull();
  });

  it('sends a jsdom file in a form with its own name, and not as a text', () => {
    const doc = new File(['%PDF'], 'factura.pdf', { type: 'application/pdf' });
    const body = createFormData({ subject: 'Hola', priority: 2, doc });
    expect(body.get('priority')).toBe('2');
    expect(typeof body.get('doc')).not.toBe('string');
    expect(body.get('doc').name).toBe('factura.pdf');
    expect(body.get('doc').type).toBe('application/pdf');
  });

  it('creates a version 4 UUID with the crypto of jsdom', () => {
    expect(createUuidV4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('rejects a hash with its named error, because the crypto of jsdom has no subtle', async () => {
    const hashing = sha256('abc');
    await expect(hashing).rejects.toThrow(FoundryCryptoUnavailableError);
    await expect(hashing).rejects.toMatchObject({ missingApi: 'crypto.subtle' });
  });
});
