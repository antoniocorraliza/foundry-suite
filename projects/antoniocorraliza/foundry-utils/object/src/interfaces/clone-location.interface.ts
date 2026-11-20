import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';

/** Where the check of `deepClone` is: the path, and the place inside a Map or a Set that the path cannot name. */
export interface CloneLocation {
  readonly path: FoundryObjectPath;
  readonly place: string | null;
}
