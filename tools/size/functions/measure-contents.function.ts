import { gzipSync } from 'node:zlib';
import { GZIP_LEVEL } from '../constants/size-settings.constant.ts';
import type { SizeFigures } from '../interfaces/size-figures.interface.ts';

export function measureContents(contents: ReadonlyArray<string | Uint8Array>): SizeFigures {
  let raw: number = 0;
  let gzip: number = 0;
  for (const content of contents) {
    raw += typeof content === 'string' ? Buffer.byteLength(content) : content.byteLength;
    gzip += gzipSync(content, { level: GZIP_LEVEL }).byteLength;
  }
  return { raw, gzip };
}
