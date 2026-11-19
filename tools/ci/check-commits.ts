import { execFileSync } from 'node:child_process';
import { messageProblems } from './functions/message-problems.function.ts';
import { titleProblems } from './functions/title-problems.function.ts';
import type { Commit } from './interfaces/commit.interface.ts';

function commitsInRange(range: string): Array<Commit> {
  const output: string = execFileSync('git', ['log', '--no-merges', '--format=%H%x00%B%x1e', range], { encoding: 'utf8' });
  return output
    .split('\x1e')
    .map((record) => record.trim())
    .filter((record) => record !== '')
    .map((record) => {
      const [hash = '', message = '']: Array<string> = record.split('\x00');
      return { hash, message };
    });
}

function main(): number {
  const [firstArgument, secondArgument]: Array<string> = process.argv.slice(2);
  if (firstArgument === undefined) {
    console.error('[check-commits]: pass a git range, for example origin/main..HEAD, or --title "<pull request title>"');
    return 1;
  }
  if (firstArgument === '--title') {
    const problems: Array<string> = titleProblems(secondArgument ?? '');
    problems.forEach((problem) => console.error(`[check-commits]: pull request ${problem}`));
    return problems.length === 0 ? 0 : 1;
  }
  const commits: Array<Commit> = commitsInRange(firstArgument);
  const problems: Array<string> = commits.flatMap((commit) =>
    messageProblems(commit.message).map((problem) => `[check-commits]: ${commit.hash.slice(0, 7)} ${problem}`),
  );
  problems.forEach((problem) => console.error(problem));
  const failures: number = problems.length;
  console.log(`[check-commits]: ${commits.length} commit(s) checked, ${failures} problem(s)`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = main();
