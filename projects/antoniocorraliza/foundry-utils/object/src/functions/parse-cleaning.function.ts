import type { EmptyValuesCleaning } from '../interfaces/empty-values-cleaning.interface';

function parseFlag(options: Readonly<Record<string, unknown>> | undefined, name: string): boolean {
  const flag: unknown = options?.[name] ?? false;
  if (typeof flag !== 'boolean') throw new TypeError(`[foundry-utils]: the ${name} option of removeEmptyValues must be a boolean`);
  return flag;
}

/**
 * Parses the options of `removeEmptyValues`.
 * @throws {TypeError} When an option is not a boolean.
 */
export function parseCleaning(options: Readonly<Record<string, unknown>> | undefined): EmptyValuesCleaning {
  return {
    removeEmptyStrings: parseFlag(options, 'removeEmptyStrings'),
    removeEmptyCollections: parseFlag(options, 'removeEmptyCollections'),
    removeEmptyArrayItems: parseFlag(options, 'removeEmptyArrayItems'),
  };
}
