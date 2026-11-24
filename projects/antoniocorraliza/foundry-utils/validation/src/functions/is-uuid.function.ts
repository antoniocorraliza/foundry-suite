import { ɵreadIntegerOption } from '@antoniocorraliza/foundry-utils';
import { UUID_PATTERN } from '../constants/validation-patterns.constant';

/** Tells whether a value is a UUID of any version from 1 to 8 with the standard variant, or of the given version. */
export function isUuid(value: unknown, options?: { readonly version?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 }): boolean {
  if (typeof value !== 'string') return false;
  const version: string | undefined = UUID_PATTERN.exec(value)?.[1];
  if (version === undefined) return false;
  const expectedVersion: number | null = ɵreadIntegerOption({ options, name: 'version', minimum: 1, maximum: 8, fallback: null });
  return expectedVersion === null || Number(version) === expectedVersion;
}
