import type { TEST_BROWSERS } from '../constants/test-browsers.constant.ts';

export type TestBrowser = (typeof TEST_BROWSERS)[number];
