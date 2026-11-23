import type { ARRAY_MODES } from '../constants/array-modes.constant';

/** Way in which `getObjectDifferences` compares arrays. */
export type ArrayMode = (typeof ARRAY_MODES)[number];
