import type { DUPLICATE_HEADER_MODES } from '../constants/duplicate-header-modes.constant';

/** Handling of a repeated header. */
export type DuplicateHeaderMode = (typeof DUPLICATE_HEADER_MODES)[number];
