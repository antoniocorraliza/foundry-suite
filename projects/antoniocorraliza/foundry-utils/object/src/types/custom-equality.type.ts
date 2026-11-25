import type { FoundryDeepEqualOptions } from '../interfaces/foundry-deep-equal-options.interface';

/** Comparison that an app passes in `customEquality`, without the `undefined` of an option that is left out. */
export type CustomEquality = NonNullable<FoundryDeepEqualOptions['customEquality']>;
