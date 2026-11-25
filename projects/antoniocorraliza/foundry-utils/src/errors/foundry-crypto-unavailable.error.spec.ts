import { describe, expect, it } from 'vitest';
import { FoundryCryptoUnavailableError } from './foundry-crypto-unavailable.error';
import { FoundryUtilsError } from './foundry-utils.error';

describe('FoundryCryptoUnavailableError', () => {
  it.each(['crypto', 'crypto.getRandomValues', 'crypto.subtle'] as const)('reports %s as the missing API', (missingApi) => {
    const error: FoundryCryptoUnavailableError = new FoundryCryptoUnavailableError({ missingApi });
    expect(error).toBeInstanceOf(FoundryUtilsError);
    expect(error.name).toBe('FoundryCryptoUnavailableError');
    expect(error.missingApi).toBe(missingApi);
    expect(error.message).toMatch(/^\[foundry-utils\]: [^A-Z].*[^.]$/);
    expect(error.message).toContain(missingApi);
  });

  it('explains that a browser only has crypto.subtle in a secure context', () => {
    expect(new FoundryCryptoUnavailableError({ missingApi: 'crypto.subtle' }).message).toBe(
      '[foundry-utils]: crypto.subtle is not available in this environment; a browser only has it in a secure context (HTTPS or localhost)',
    );
  });

  it.each([
    ['crypto', '[foundry-utils]: crypto is not available in this environment'],
    ['crypto.getRandomValues', '[foundry-utils]: crypto.getRandomValues is not available in this environment'],
  ] as const)('keeps the message of %s as it was', (missingApi, message) => {
    expect(new FoundryCryptoUnavailableError({ missingApi }).message).toBe(message);
  });

  it('keeps the cause', () => {
    const original: Error = new Error('[test]: original');
    expect(new FoundryCryptoUnavailableError({ missingApi: 'crypto' }, { cause: original }).cause).toBe(original);
  });
});
