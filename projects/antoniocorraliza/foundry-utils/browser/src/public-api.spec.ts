import { describe, expect, it } from 'vitest';
import * as entry from './public-api';

describe('public API of the browser entry', () => {
  it('exports exactly these values', () => {
    expect(Object.keys(entry).sort()).toEqual(['FoundryBrowserApiUnavailableError', 'downloadBlob']);
  });

  it('can be imported on Node, without a document', async () => {
    expect(typeof document).toBe('undefined');
    await expect(import('./public-api')).resolves.toBeDefined();
  });
});
