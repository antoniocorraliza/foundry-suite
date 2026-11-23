import type { VitestJsonFile } from './vitest-json-file.interface.ts';

export interface TimedSpecFile {
  readonly file: VitestJsonFile;
  readonly time: number;
}
