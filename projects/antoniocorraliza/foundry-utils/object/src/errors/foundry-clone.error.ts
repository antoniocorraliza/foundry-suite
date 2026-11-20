import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import { FoundryUtilsError, ɵformatFoundryObjectPath } from '@antoniocorraliza/foundry-utils';

/** Reports a value that `deepClone` cannot copy without changing it. */
export class FoundryCloneError extends FoundryUtilsError {
  override readonly name: 'FoundryCloneError' = 'FoundryCloneError';
  /** Path of the value that cannot be copied. */
  readonly path: FoundryObjectPath;
  /** What the value is and, inside a Map or a Set, where it was. */
  readonly valueDescription: string;

  constructor(details: { readonly path: FoundryObjectPath; readonly valueDescription: string }, options?: { readonly cause?: unknown }) {
    super(
      `[foundry-utils]: cannot copy the ${details.valueDescription} at ${ɵformatFoundryObjectPath(details.path)} without changing it`,
      options,
    );
    this.path = details.path;
    this.valueDescription = details.valueDescription;
  }
}
