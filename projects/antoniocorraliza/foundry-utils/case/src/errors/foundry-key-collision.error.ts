import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';

/** Reports two keys of the same object that convert to the same key. */
export class FoundryKeyCollisionError extends FoundryUtilsError {
  override readonly name: 'FoundryKeyCollisionError' = 'FoundryKeyCollisionError';
  /** Path of the object that holds both keys. */
  readonly path: FoundryObjectPath;
  /** The two original keys, in the order of the object. */
  readonly originalKeys: readonly [string, string];
  /** The key that both convert to. */
  readonly convertedKey: string;

  constructor(
    details: { readonly path: FoundryObjectPath; readonly originalKeys: readonly [string, string]; readonly convertedKey: string },
    options?: { readonly cause?: unknown },
  ) {
    super('', options);
    this.path = details.path;
    this.originalKeys = details.originalKeys;
    this.convertedKey = details.convertedKey;
    throw new Error('[foundry-utils]: not implemented');
  }
}
