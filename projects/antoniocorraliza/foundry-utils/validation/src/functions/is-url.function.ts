import { ɵgetOwnDataValue, ɵisTextList, ɵreadBooleanOption } from '@antoniocorraliza/foundry-utils';
import { PROTOCOLS_ACCEPTED_BY_DEFAULT } from '../constants/protocols-accepted-by-default.constant';
import type { FoundryUrlOptions } from '../interfaces/foundry-url-options.interface';
import { readUrl } from './read-url.function';

/** Tells whether a value is a URL with an accepted protocol and a host with a dot, `localhost` or an IP address. */
export function isUrl(value: unknown, options?: FoundryUrlOptions): boolean {
  const protocols: unknown = ɵgetOwnDataValue(options, 'protocols');
  return (
    readUrl(value, {
      protocols: ɵisTextList(protocols) ? protocols : PROTOCOLS_ACCEPTED_BY_DEFAULT,
      allowMissingProtocol: ɵreadBooleanOption({ options, name: 'allowMissingProtocol', fallback: false }),
      defaultProtocol: 'https:',
    }) !== null
  );
}
