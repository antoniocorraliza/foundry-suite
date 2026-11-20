import { describe, expect, it } from 'vitest';
import * as root from './public-api';

describe('public API of the root entry', () => {
  it('exports only the shared errors, besides internal names', () => {
    const publicNames: Array<string> = Object.keys(root)
      .filter((name) => !name.startsWith('ɵ'))
      .sort();
    expect(publicNames).toEqual(['FoundryCircularReferenceError', 'FoundryCryptoUnavailableError', 'FoundryUtilsError']);
  });
});
