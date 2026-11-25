import type { ARRAY_KEY_STYLES } from '../constants/array-key-styles.constant';

/** Way that `createFormData` writes the key of each element of a list. */
export type ArrayKeyStyle = (typeof ARRAY_KEY_STYLES)[number];
