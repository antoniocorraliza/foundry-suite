import type { FoundryUrlOptions } from '../interfaces/foundry-url-options.interface';

/** Tells whether a value is a URL with an accepted protocol and a host with a dot, `localhost` or an IP address. */
export function isUrl(value: unknown, options?: FoundryUrlOptions): boolean {
  throw new Error('[foundry-utils]: not implemented yet');
}
