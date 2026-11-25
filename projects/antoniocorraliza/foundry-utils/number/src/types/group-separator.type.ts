import type { GROUP_SEPARATORS } from '../constants/group-separators.constant';

/** Group separator that `parseDecimal` reads. */
export type GroupSeparator = (typeof GROUP_SEPARATORS)[number];
