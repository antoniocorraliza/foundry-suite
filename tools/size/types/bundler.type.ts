import type { BUNDLERS } from '../constants/bundlers.constant.ts';

export type Bundler = (typeof BUNDLERS)[number];
