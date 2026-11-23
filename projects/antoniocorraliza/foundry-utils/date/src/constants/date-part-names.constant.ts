/** Lists the time parts of a parts object, from the largest to the smallest. */
export const TIME_PART_NAMES = ['hours', 'minutes', 'seconds', 'milliseconds'] as const;
/** Gives the largest value of each time part. */
export const TIME_PART_MAXIMUMS: ReadonlyArray<number> = [23, 59, 59, 999];
