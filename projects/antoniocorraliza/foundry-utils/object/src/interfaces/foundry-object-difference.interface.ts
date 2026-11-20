import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';

/** One difference found by `getObjectDifferences`. */
export interface FoundryObjectDifference {
  /** Path of the value that differs. */
  readonly path: FoundryObjectPath;
  /** Whether the value was added, removed or changed. */
  readonly kind: 'added' | 'removed' | 'changed';
  /** The value before; `undefined` when it was added. */
  readonly previous: unknown;
  /** The value after; `undefined` when it was removed. */
  readonly current: unknown;
}
