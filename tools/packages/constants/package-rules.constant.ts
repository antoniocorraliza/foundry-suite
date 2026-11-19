import type { PackageRule } from '../interfaces/package-rule.type.ts';

// The rules are described in tools/packages/README.md.
export const PACKAGE_RULES: ReadonlyArray<PackageRule> = [
  'exports',
  'license',
  'tslib',
  'any',
  'dependencies',
  'peers',
  'manifest',
  'notices',
];
