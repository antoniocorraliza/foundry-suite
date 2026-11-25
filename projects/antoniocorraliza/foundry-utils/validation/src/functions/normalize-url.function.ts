import { ɵisOptionsValue, ɵisTextList, ɵparseBooleanOption, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DEFAULT_ACCEPTED_PROTOCOLS } from '../constants/accepted-protocols.constant';
import { DEFAULT_PROTOCOLS } from '../constants/default-protocols.constant';
import type { FoundryUrlOptions } from '../interfaces/foundry-url-options.interface';
import { readUrl } from './read-url.function';

/**
 * Returns the URL as the URL parser writes it, or `null` when it is not valid with those options.
 * @throws {TypeError} When the options are not valid.
 */
export function normalizeUrl(
  value: unknown,
  options?: FoundryUrlOptions & { readonly defaultProtocol?: 'https:' | 'http:' },
): string | null {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of normalizeUrl must be an object');
  const protocols: unknown = options?.['protocols'] ?? DEFAULT_ACCEPTED_PROTOCOLS;
  if (!ɵisTextList(protocols)) throw new TypeError('[foundry-utils]: the protocols option must be a list of texts');
  return readUrl(value, {
    protocols,
    allowMissingProtocol: ɵparseBooleanOption({ options, name: 'allowMissingProtocol', fallback: false }),
    defaultProtocol: ɵparseEnumOption({ options, name: 'defaultProtocol', allowedValues: DEFAULT_PROTOCOLS, fallback: 'https:' }),
  });
}
