import type { UrlSettings } from '../interfaces/url-settings.interface';

/** Reads a URL with options that are already checked, and returns it as the URL parser writes it, or `null` when it is not valid. */
export function readUrl(value: unknown, settings: UrlSettings): string | null {
  throw new Error('[foundry-utils]: not implemented yet');
}
