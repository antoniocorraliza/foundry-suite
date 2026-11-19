import { execFileSync } from 'node:child_process';
import { ATTRIBUTION, COMMIT_SCOPES, COMMIT_TITLE, MAXIMUM_TITLE_LENGTH } from './constants/commit-rules.constant.ts';
import type { Commit } from './interfaces/commit.interface.ts';

function titleProblems(title: string): Array<string> {
  const problems: Array<string> = [];
  if (title.length > MAXIMUM_TITLE_LENGTH) {
    problems.push(`title is ${title.length} characters long, the maximum is ${MAXIMUM_TITLE_LENGTH}`);
  }
  if (!COMMIT_TITLE.test(title)) {
    problems.push(`title must be "type(scope): lowercase description" without a final period; scopes: ${COMMIT_SCOPES.join(', ')}`);
  }
  return problems;
}

function messageProblems(message: string): Array<string> {
  const [title = '', lineAfterTitle]: Array<string> = message.trimEnd().split('\n');
  const problems: Array<string> = titleProblems(title);
  if (lineAfterTitle !== undefined && lineAfterTitle !== '') problems.push('the body must be separated from the title by a blank line');
  if (ATTRIBUTION.test(message)) problems.push('the message credits a tool or an assistant');
  return problems;
}

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

// Usage: node tools/ci/check-commits.ts <git range>   or   node tools/ci/check-commits.ts --title "<pull request title>"
function main(): number {
  const [firstArgument, secondArgument]: Array<string> = process.argv.slice(2);
  if (firstArgument === undefined) {
    console.error('[check-commits]: pass a git range, for example origin/main..HEAD, or --title "<pull request title>"');
    return 1;
  }
  if (firstArgument === '--title') {
    const problems: Array<string> = titleProblems(secondArgument ?? '');
    for (const problem of problems) console.error(`[check-commits]: pull request ${problem}`);
    return problems.length === 0 ? 0 : 1;
  }
  let failures: number = 0;
  const commits: Array<Commit> = commitsInRange(firstArgument);
  for (const commit of commits) {
    for (const problem of messageProblems(commit.message)) {
      console.error(`[check-commits]: ${commit.hash.slice(0, 7)} ${problem}`);
      failures++;
    }
  }
  console.log(`[check-commits]: ${commits.length} commit(s) checked, ${failures} problem(s)`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = main();
