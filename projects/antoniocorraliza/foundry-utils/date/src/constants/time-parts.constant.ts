/** Time parts of a parts object, from the largest to the smallest, with their largest value. */
export const TIME_PARTS = [
  { name: 'hours', maximum: 23 },
  { name: 'minutes', maximum: 59 },
  { name: 'seconds', maximum: 59 },
  { name: 'milliseconds', maximum: 999 },
] as const;
