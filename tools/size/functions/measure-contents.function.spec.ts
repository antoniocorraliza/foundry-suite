import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { measureContents } from './measure-contents.function.ts';

describe('measureContents', () => {
  it('counts bytes, not characters', () => {
    expect(measureContents(['año']).raw).toBe(4);
  });

  it('adds up the files and gzips each file on its own', () => {
    const first: string = 'console.log(1);'.repeat(20);
    const second: Uint8Array = new TextEncoder().encode('export {};');
    const expectedGzip: number = gzipSync(first, { level: 6 }).byteLength + gzipSync(second, { level: 6 }).byteLength;
    expect(measureContents([first, second])).toEqual({ raw: first.length + second.byteLength, gzip: expectedGzip });
  });

  it('measures nothing as zero', () => {
    expect(measureContents([])).toEqual({ raw: 0, gzip: 0 });
  });
});
