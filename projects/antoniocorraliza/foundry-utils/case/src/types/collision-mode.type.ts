import type { COLLISION_MODES } from '../constants/collision-modes.constant';

/** Names what the key conversion does with two keys that convert to the same key. */
export type CollisionMode = (typeof COLLISION_MODES)[number];
