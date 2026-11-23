import type { VitestJsonFile } from '../interfaces/vitest-json-file.interface.ts';
import type { VitestJsonReport } from '../interfaces/vitest-json-report.interface.ts';

function measureFile(file: VitestJsonFile): number {
  return file.assertionResults.reduce((total, test) => total + (test.duration ?? 0), 0);
}

function formatSeconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)} s`;
}

export function createExhaustiveReport(report: VitestJsonReport, timeZone: string): Array<string> {
  const files: Array<VitestJsonFile> = [...report.testResults].sort((first, second) => measureFile(second) - measureFile(first));
  const total: number = files.reduce((sum, file) => sum + measureFile(file), 0);
  return [
    `### Exhaustive date specs: ${timeZone}`,
    '',
    '| Spec | Result | Time |',
    '| :-- | :-- | --: |',
    ...files.map((file) => `| ${file.name.split('/').pop() ?? file.name} | ${file.status} | ${formatSeconds(measureFile(file))} |`),
    `| **total** | | **${formatSeconds(total)}** |`,
    '',
  ];
}
