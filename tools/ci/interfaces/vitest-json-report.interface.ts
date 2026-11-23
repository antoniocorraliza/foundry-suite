import type { VitestJsonFile } from './vitest-json-file.interface.ts';

export interface VitestJsonReport {
  readonly testResults: ReadonlyArray<VitestJsonFile>;
}
