import type { FoundryDeepEqualOptions } from '../interfaces/foundry-deep-equal-options.interface';

/** The comparison that an app passes in `customEquality`. */
export type CustomEquality = NonNullable<FoundryDeepEqualOptions['customEquality']>;
