/** Serves as the base class of the errors thrown by Foundry Utils. */
export class FoundryUtilsError extends Error {
  override readonly name: string = 'FoundryUtilsError';

  constructor(message: string, options?: { readonly cause?: unknown }) {
    super(message, options);
  }
}
