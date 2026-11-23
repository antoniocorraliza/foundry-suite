import { appendFileSync, readFileSync } from 'node:fs';
import { createExhaustiveReport } from './functions/create-exhaustive-report.function.ts';
import type { VitestJsonReport } from './interfaces/vitest-json-report.interface.ts';

// The time of each exhaustive spec goes to the job summary; the tests themselves decide whether the job fails.
function main(): number {
  const [file, timeZone] = process.argv.slice(2);
  if (file === undefined || timeZone === undefined) {
    console.error('[exhaustive-report]: usage: node tools/ci/exhaustive-report.ts <Vitest JSON report> <time zone>');
    return 1;
  }
  const lines: Array<string> = createExhaustiveReport(JSON.parse(readFileSync(file, 'utf8')) as VitestJsonReport, timeZone);
  const summaryPath: string | undefined = process.env['GITHUB_STEP_SUMMARY'];
  if (summaryPath === undefined || summaryPath === '') console.log(lines.join('\n'));
  else appendFileSync(summaryPath, `${lines.join('\n')}\n`);
  return 0;
}

process.exitCode = main();
