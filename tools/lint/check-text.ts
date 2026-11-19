import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { CHECKED_FILE, LOCKFILE, SKIPPED_FILES, SPEC_FILE, TYPESCRIPT_FILE } from './constants/file-patterns.constant.ts';
import { folderSuffixProblem } from './functions/folder-suffix-problem.function.ts';
import { signatureProblems } from './functions/signature-problems.function.ts';
import { testTitleProblems } from './functions/test-title-problems.function.ts';
import { textProblems } from './functions/text-problems.function.ts';

// The index still lists a deleted file until the deletion is committed.
function repositoryFiles(): Array<string> {
  const output: string = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' });
  return output
    .split('\n')
    .filter((path) => CHECKED_FILE.test(path) && !LOCKFILE.test(path) && !SKIPPED_FILES.has(path) && existsSync(path));
}

function main(): number {
  const problems: Array<string> = [];
  for (const path of repositoryFiles()) {
    const text: string = readFileSync(path, 'utf8');
    problems.push(...textProblems(path, text));
    const folderProblem: string | undefined = folderSuffixProblem(path);
    if (folderProblem !== undefined) problems.push(folderProblem);
    if (TYPESCRIPT_FILE.test(path)) problems.push(...signatureProblems(path, text));
    if (SPEC_FILE.test(path)) problems.push(...testTitleProblems(path, text));
  }
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) console.error(`[check-text]: ${problems.length} problem(s), see CONTRIBUTING.md`);
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = main();
