import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';

/** Reports that an API of the browser that a function needs is missing, as on a server. */
export class FoundryBrowserApiUnavailableError extends FoundryUtilsError {
  override readonly name: 'FoundryBrowserApiUnavailableError' = 'FoundryBrowserApiUnavailableError';
  /** The API that is missing. */
  readonly missingApi: 'document' | 'URL.createObjectURL' | 'URL.revokeObjectURL';

  constructor(
    details: { readonly missingApi: 'document' | 'URL.createObjectURL' | 'URL.revokeObjectURL' },
    options?: { readonly cause?: unknown },
  ) {
    super(`[foundry-utils]: ${details.missingApi} is not available in this environment`, options);
    this.missingApi = details.missingApi;
  }
}
