import { ɵformatObjectPath } from '../functions/format-object-path.function';
import type { FoundryObjectPath } from '../types/foundry-object-path.type';
import { FoundryUtilsError } from './foundry-utils.error';

/** Reports a cycle that a function walking an object cannot represent in its result. */
export class FoundryCircularReferenceError extends FoundryUtilsError {
  override readonly name: 'FoundryCircularReferenceError' = 'FoundryCircularReferenceError';
  /** Path of the property that points back to one of its ancestors. */
  readonly path: FoundryObjectPath;

  constructor(details: { readonly path: FoundryObjectPath }, options?: { readonly cause?: unknown }) {
    super(`[foundry-utils]: the value at ${ɵformatObjectPath(details.path)} points back to one of its ancestors`, options);
    this.path = details.path;
  }
}
