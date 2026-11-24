import { describe, expect, it } from 'vitest';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import { FoundryBrowserApiUnavailableError } from './foundry-browser-api-unavailable.error';

describe('FoundryBrowserApiUnavailableError', () => {
  it.each(['document', 'URL.createObjectURL', 'URL.revokeObjectURL'] as const)('reports %s as the missing API', (missingApi) => {
    const error: FoundryBrowserApiUnavailableError = new FoundryBrowserApiUnavailableError({ missingApi });
    expect(error).toBeInstanceOf(FoundryUtilsError);
    expect(error.name).toBe('FoundryBrowserApiUnavailableError');
    expect(error.missingApi).toBe(missingApi);
    expect(error.message).toBe(`[foundry-utils]: ${missingApi} is not available in this environment`);
  });

  it('keeps the cause', () => {
    const original: Error = new Error('[test]: original');
    expect(new FoundryBrowserApiUnavailableError({ missingApi: 'document' }, { cause: original }).cause).toBe(original);
  });
});
