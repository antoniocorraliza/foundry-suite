import type { CollisionMode } from '../types/collision-mode.type';

/** The key conversion and the collision mode that the walk of `convertKeys` passes down. */
export interface KeyConversion {
  readonly convertKey: (key: string) => string;
  readonly mode: CollisionMode;
}
