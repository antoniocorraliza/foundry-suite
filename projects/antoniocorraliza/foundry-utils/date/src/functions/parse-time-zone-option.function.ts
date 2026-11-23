import { ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { TIME_ZONE_MODES } from '../constants/time-zone-modes.constant';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';

/**
 * Returns the `timeZone` option of a function whose only option it is, `'local'` by default.
 * @throws {TypeError} When the options are not an object or the time zone is unknown.
 */
export function parseTimeZoneOption(options: unknown, functionName: string): FoundryTimeZoneMode {
  if (!ɵisOptionsValue(options)) throw new TypeError(`[foundry-utils]: the options of ${functionName} must be an object`);
  return ɵparseEnumOption({ options, name: 'timeZone', allowedValues: TIME_ZONE_MODES, fallback: 'local' });
}
