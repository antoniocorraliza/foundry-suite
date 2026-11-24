import type { FoundryUrlOptions } from '../interfaces/foundry-url-options.interface';

/**
 * Returns the URL as the URL parser writes it, or `null` when it is not valid with those options.
 * @throws {TypeError} When the options are not valid.
 */
export function normalizeUrl(
  value: unknown,
  options?: FoundryUrlOptions & { readonly defaultProtocol?: 'https:' | 'http:' },
): string | null {
  throw new Error('[foundry-utils]: not implemented yet');
}
