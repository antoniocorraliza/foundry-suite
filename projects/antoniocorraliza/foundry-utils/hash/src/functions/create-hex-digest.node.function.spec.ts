import { createHash } from 'node:crypto';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { catchRejectedError } from '@foundry-test/functions/catch-rejected-error.function';
import { createHexDigest } from './create-hex-digest.function';

const NODE_ALGORITHMS: ReadonlyArray<['SHA-256' | 'SHA-512', string]> = [
  ['SHA-256', 'sha256'],
  ['SHA-512', 'sha512'],
];

function getNodeDigest(nodeAlgorithm: string, bytes: Uint8Array): string {
  return createHash(nodeAlgorithm).update(bytes).digest('hex');
}

describe('createHexDigest against node:crypto', () => {
  it.each(NODE_ALGORITHMS)('gives the %s of node:crypto for any text encoded as UTF-8', async (algorithm, nodeAlgorithm) => {
    await fc.assert(
      fc.asyncProperty(fc.string({ unit: 'binary' }), async (text) => {
        expect(await createHexDigest(algorithm, text)).toBe(getNodeDigest(nodeAlgorithm, Buffer.from(text, 'utf8')));
      }),
    );
  });

  it.each(NODE_ALGORITHMS)('gives the %s of node:crypto for the bytes of any view', async (algorithm, nodeAlgorithm) => {
    await fc.assert(
      fc.asyncProperty(fc.uint8Array(), fc.nat(), fc.nat(), async (bytes, start, length) => {
        const view: Uint8Array = bytes.subarray(Math.min(start, bytes.length), Math.min(start + length, bytes.length));
        expect(await createHexDigest(algorithm, view)).toBe(getNodeDigest(nodeAlgorithm, Uint8Array.from(view)));
      }),
    );
  });

  it('reads only the bytes of a Buffer of Node, which usually sits inside a larger shared buffer', async () => {
    const buffer: Buffer = Buffer.from('abc');
    expect(await createHexDigest('SHA-256', buffer)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('rejects with the error of the engine, not one of its own, for a view over a SharedArrayBuffer', async () => {
    const rejection: TypeError = await catchRejectedError(
      () => createHexDigest('SHA-256', new Uint8Array(new SharedArrayBuffer(4))),
      TypeError,
    );
    expect(rejection.message).not.toMatch(/^\[foundry-utils\]/);
  });
});
