import type { VitestJsonTest } from './vitest-json-test.interface.ts';

export interface VitestJsonFile {
  readonly name: string;
  readonly status: string;
  readonly assertionResults: ReadonlyArray<VitestJsonTest>;
}
