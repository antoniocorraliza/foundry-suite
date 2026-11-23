import { ɵparseBooleanOption } from '@antoniocorraliza/foundry-utils';
import type { EmptyValuesCleaning } from '../interfaces/empty-values-cleaning.interface';

/**
 * Parses the options of `removeEmptyValues`.
 * @throws {TypeError} When an option is not a boolean.
 */
export function parseCleaning(options: Readonly<Record<string, unknown>> | undefined): EmptyValuesCleaning {
  return {
    removeEmptyStrings: ɵparseBooleanOption({ options, name: 'removeEmptyStrings', fallback: false }),
    removeEmptyCollections: ɵparseBooleanOption({ options, name: 'removeEmptyCollections', fallback: false }),
    removeEmptyArrayItems: ɵparseBooleanOption({ options, name: 'removeEmptyArrayItems', fallback: false }),
  };
}
