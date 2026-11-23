import { basename } from 'node:path';
import type { TimedSpecFile } from '../interfaces/timed-spec-file.interface.ts';
import type { VitestJsonFile } from '../interfaces/vitest-json-file.interface.ts';
import type { VitestJsonReport } from '../interfaces/vitest-json-report.interface.ts';

function measureFile(file: VitestJsonFile): number {
  return file.assertionResults.reduce((total, test) => total + (test.duration ?? 0), 0);
}

function formatSeconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)} s`;
}

export function createExhaustiveReport(report: VitestJsonReport, timeZone: string): Array<string> {
  const timedFiles: Array<TimedSpecFile> = report.testResults
    .map((file) => ({ file, time: measureFile(file) }))
    .sort((first, second) => second.time - first.time);
  const total: number = timedFiles.reduce((sum, timedFile) => sum + timedFile.time, 0);
  return [
    `### Exhaustive date specs: ${timeZone}`,
    '',
    '| Spec | Result | Time |',
    '| :-- | :-- | --: |',
    ...timedFiles.map(({ file, time }) => `| ${basename(file.name)} | ${file.status} | ${formatSeconds(time)} |`),
    `| **total** | | **${formatSeconds(total)}** |`,
    '',
  ];
}
