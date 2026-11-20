import { ɵisOptionsValue } from '@antoniocorraliza/foundry-utils';
import type { EmptyValuesCleaning } from '../interfaces/empty-values-cleaning.interface';

function readFlag(options: Readonly<Record<string, unknown>> | undefined, name: string): boolean {
  const flag: unknown = options?.[name] ?? false;
  if (typeof flag !== 'boolean') throw new TypeError(`[foundry-utils]: the ${name} option of removeEmptyValues must be a boolean`);
  return flag;
}

/**
 * Reads the options of `removeEmptyValues`.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function readCleaning(options: unknown): EmptyValuesCleaning {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of removeEmptyValues must be an object');
  return {
    removeEmptyStrings: readFlag(options, 'removeEmptyStrings'),
    removeEmptyCollections: readFlag(options, 'removeEmptyCollections'),
    removeEmptyArrayItems: readFlag(options, 'removeEmptyArrayItems'),
  };
}
