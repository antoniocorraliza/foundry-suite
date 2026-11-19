import type { GrownMeasurement } from './grown-measurement.interface.ts';

export interface ChangelogCheck {
  readonly changelogPath: string;
  readonly grown: ReadonlyArray<GrownMeasurement>;
  readonly addedLines: ReadonlyArray<string>;
}
