import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import { FoundryUtilsError, ɵformatFoundryObjectPath } from '@antoniocorraliza/foundry-utils';

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
    super(
      `[foundry-utils]: the keys ${details.originalKeys[0]} and ${details.originalKeys[1]} of the object at ${ɵformatFoundryObjectPath(details.path)} both convert to ${details.convertedKey}`,
      options,
    );
    this.path = details.path;
    this.originalKeys = details.originalKeys;
    this.convertedKey = details.convertedKey;
  }
}
