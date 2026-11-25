import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import {
  CHECKED_FILE,
  LIBRARY_COMPONENT_STYLE_FILE,
  LIBRARY_DEFINITION_FILE,
  LIBRARY_TEMPLATE_FILE,
  LIBRARY_TYPESCRIPT_FILE,
  LOCKFILE,
  SPEC_FILE,
  TYPESCRIPT_FILE,
} from './constants/file-patterns.constant.ts';
import { SKIPPED_FILES } from './constants/skipped-files.constant.ts';
import { findClassNameProblems } from './functions/find-class-name-problems.function.ts';
import { findDecoratorSuffixProblems } from './functions/find-decorator-suffix-problems.function.ts';
import { findFileNameProblems } from './functions/find-file-name-problems.function.ts';
import { findFolderSuffixProblem } from './functions/find-folder-suffix-problem.function.ts';
import { findFunctionOrderProblems } from './functions/find-function-order-problems.function.ts';
import { findLibraryCommentProblems } from './functions/find-library-comment-problems.function.ts';
import { findOverloadSpacingProblems } from './functions/find-overload-spacing-problems.function.ts';
import { findRepeatedSpecHelpers } from './functions/find-repeated-spec-helpers.function.ts';
import { findSignatureProblems } from './functions/find-signature-problems.function.ts';
import { findTemplateJsdocProblems } from './functions/find-template-jsdoc-problems.function.ts';
import { findTestTitleProblems } from './functions/find-test-title-problems.function.ts';
import { findTextProblems } from './functions/find-text-problems.function.ts';
import { findThrowsProblems } from './functions/find-throws-problems.function.ts';

// The index still lists a deleted file until the deletion is committed.
function listRepositoryFiles(): Array<string> {
  const output: string = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' });
  return output
    .split('\n')
    .filter((path) => CHECKED_FILE.test(path) && !LOCKFILE.test(path) && !SKIPPED_FILES.has(path) && existsSync(path));
}

function main(): number {
  const problems: Array<string> = [];
  const specTexts: Map<string, string> = new Map<string, string>();
  listRepositoryFiles().forEach((path) => {
    const text: string = readFileSync(path, 'utf8');
    problems.push(...findTextProblems(path, text));
    const folderProblem: string | null = findFolderSuffixProblem(path);
    if (folderProblem !== null) problems.push(folderProblem);
    if (TYPESCRIPT_FILE.test(path)) problems.push(...findSignatureProblems(path, text), ...findOverloadSpacingProblems(path, text));
    if (SPEC_FILE.test(path)) problems.push(...findTestTitleProblems(path, text));
    if (SPEC_FILE.test(path)) specTexts.set(path, text);
    if (TYPESCRIPT_FILE.test(path) && !SPEC_FILE.test(path)) {
      problems.push(
        ...findDecoratorSuffixProblems(path, text),
        ...findFileNameProblems(path, text),
        ...findFunctionOrderProblems(path, text),
      );
    }
    if (LIBRARY_TEMPLATE_FILE.test(path) || LIBRARY_COMPONENT_STYLE_FILE.test(path)) problems.push(...findClassNameProblems(path, text));
    if (LIBRARY_TYPESCRIPT_FILE.test(path)) problems.push(...findLibraryCommentProblems(path, text));
    if (LIBRARY_TYPESCRIPT_FILE.test(path) && !SPEC_FILE.test(path)) problems.push(...findThrowsProblems(path, text));
    if (LIBRARY_DEFINITION_FILE.test(path)) problems.push(...findTemplateJsdocProblems(path, text));
  });
  problems.push(...findRepeatedSpecHelpers(specTexts));
  problems.forEach((problem) => console.error(problem));
  if (problems.length > 0) console.error(`[check-text]: ${problems.length} problem(s), see CONTRIBUTING.md`);
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = main();
