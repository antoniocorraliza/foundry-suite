import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryBrowserApiUnavailableError } from './public-api';
import { downloadBlob } from './public-api';

describe('types of the browser entry', () => {
  it('declares downloadBlob and the missing APIs as the design fixes them', () => {
    expectTypeOf(downloadBlob).toEqualTypeOf<(blob: Blob, fileName: string) => void>();
    expectTypeOf<FoundryBrowserApiUnavailableError['missingApi']>().toEqualTypeOf<
      'document' | 'URL.createObjectURL' | 'URL.revokeObjectURL'
    >();
  });
});
