import type { BuiltEntry } from './built-entry.interface.ts';

export interface BuiltPackages {
  readonly entries: ReadonlyArray<BuiltEntry>;
  readonly files: ReadonlySet<string>;
}
