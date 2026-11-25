import { FoundryUtilsError } from './foundry-utils.error';

/** Reports that Web Crypto, or the part of it that a function needs, is missing. */
export class FoundryCryptoUnavailableError extends FoundryUtilsError {
  override readonly name: 'FoundryCryptoUnavailableError' = 'FoundryCryptoUnavailableError';
  /** The API that is missing. `crypto.subtle` also needs a secure context. */
  readonly missingApi: 'crypto' | 'crypto.getRandomValues' | 'crypto.subtle';

  constructor(
    details: { readonly missingApi: 'crypto' | 'crypto.getRandomValues' | 'crypto.subtle' },
    options?: { readonly cause?: unknown },
  ) {
    const secureContextNote: string =
      details.missingApi === 'crypto.subtle' ? '; a browser only has it in a secure context (HTTPS or localhost)' : '';
    super(`[foundry-utils]: ${details.missingApi} is not available in this environment${secureContextNote}`, options);
    this.missingApi = details.missingApi;
  }
}
