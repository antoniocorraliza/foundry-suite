import type { SpawnSyncReturns } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { TYPESCRIPT_CONSUMER_CHECKS } from './constants/typescript-consumer-checks.constant.ts';
import { findTypescriptConsumerProblem } from './functions/find-typescript-consumer-problem.function.ts';
import type { TypescriptConsumerCheck } from './interfaces/typescript-consumer-check.interface.ts';

function compile(appDirectory: string, check: TypescriptConsumerCheck): string | null {
  const compiler: string = join('node_modules', check.compiler, 'bin', 'tsc');
  const result: SpawnSyncReturns<string> = spawnSync(process.execPath, [compiler, '-p', check.project], {
    cwd: appDirectory,
    encoding: 'utf8',
  });
  return findTypescriptConsumerProblem(check, result.status ?? 1, `${result.stdout}${result.stderr}`);
}

function main(): number {
  const appDirectory: string = join('tools', 'typescript-smoke');
  if (!existsSync(join(appDirectory, 'node_modules', '@antoniocorraliza', 'foundry-utils'))) {
    console.error('[check-typescript-consumers]: foundry-utils is not installed in the app, run `npm run test:typescript`');
    return 1;
  }
  const problems: Array<string> = [];
  TYPESCRIPT_CONSUMER_CHECKS.forEach((check) => {
    const problem: string | null = compile(appDirectory, check);
    const expectation: string = check.expectedError === null ? 'compiles' : `fails with ${check.expectedError}`;
    console.log(`  ${problem === null ? 'ok  ' : 'FAIL'} ${check.compiler} ${check.project}: ${expectation}`);
    if (problem !== null) problems.push(problem);
  });
  problems.forEach((problem) => console.error(`[check-typescript-consumers]: ${problem}`));
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = main();
