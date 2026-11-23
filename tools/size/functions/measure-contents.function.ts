import { gzipSync } from 'node:zlib';
import { GZIP_LEVEL } from '../constants/size-settings.constant.ts';
import type { SizeFigures } from '../interfaces/size-figures.interface.ts';

export function measureContents(contents: ReadonlyArray<string | Uint8Array>): SizeFigures {
  return contents.reduce(
    (total, content) => ({
      raw: total.raw + (typeof content === 'string' ? Buffer.byteLength(content) : content.byteLength),
      gzip: total.gzip + gzipSync(content, { level: GZIP_LEVEL }).byteLength,
    }),
    { raw: 0, gzip: 0 },
  );
}
