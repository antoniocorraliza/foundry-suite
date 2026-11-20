import type { ArrayMode } from '../types/array-mode.type';
import type { CustomEquality } from '../types/custom-equality.type';
import type { FoundryObjectDifference } from './foundry-object-difference.interface';

/** What every step of the walk of `getObjectDifferences` shares. */
export interface DifferenceWalk {
  readonly arrayMode: ArrayMode;
  readonly customEquality: CustomEquality | null;
  readonly differences: Array<FoundryObjectDifference>;
  readonly visited: WeakMap<object, WeakSet<object>>;
}
