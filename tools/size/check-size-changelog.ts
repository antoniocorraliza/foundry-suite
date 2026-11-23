import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGES_SOURCE_DIRECTORY } from '../packages/constants/package-directories.constant.ts';
import { SIZE_REFERENCE_PATH } from './constants/size-settings.constant.ts';
import { findChangelogProblems } from './functions/find-changelog-problems.function.ts';
import { findGrownMeasurements } from './functions/find-grown-measurements.function.ts';
import { parseMeasurementSubject } from './functions/parse-measurement-subject.function.ts';
import type { GrownMeasurement } from './interfaces/grown-measurement.interface.ts';
import type { MeasurementSubject } from './interfaces/measurement-subject.interface.ts';
import type { SizeReference } from './types/size-reference.type.ts';

function runGit(gitArguments: ReadonlyArray<string>): string {
  return execFileSync('git', gitArguments, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function readBaseReference(mergeBase: string): SizeReference | null {
  try {
    return JSON.parse(runGit(['show', `${mergeBase}:${SIZE_REFERENCE_PATH}`])) as SizeReference;
  } catch {
    return null;
  }
}

// A changelog that the merge base does not have is new: every line counts as added, also before it is committed.
function readAddedLines(mergeBase: string, changelogPath: string): Array<string> {
  try {
    runGit(['cat-file', '-e', `${mergeBase}:${changelogPath}`]);
  } catch {
    return readFileSync(changelogPath, 'utf8').split('\n');
  }
  return runGit(['diff', mergeBase, '--', changelogPath])
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'));
}

function main(): number {
  const base: string = process.argv[2] ?? 'origin/main';
  const mergeBase: string = runGit(['merge-base', base, 'HEAD']).trim();
  const before: SizeReference | null = readBaseReference(mergeBase);
  if (before === null) {
    console.log(`[size-changelog]: ${base} has no ${SIZE_REFERENCE_PATH}; nothing to compare`);
    return 0;
  }
  const after: SizeReference = JSON.parse(readFileSync(SIZE_REFERENCE_PATH, 'utf8')) as SizeReference;
  const grownByChangelog: Map<string, Array<GrownMeasurement>> = new Map();
  findGrownMeasurements(before, after).forEach((name) => {
    const subject: MeasurementSubject | null = parseMeasurementSubject(name);
    if (subject === null) throw new Error(`[size-changelog]: cannot tell the package of the measurement '${name}'`);
    const changelogPath: string = join(PACKAGES_SOURCE_DIRECTORY, subject.packageFolder, 'CHANGELOG.md');
    grownByChangelog.set(changelogPath, [...(grownByChangelog.get(changelogPath) ?? []), { name, mentions: [subject.specifier] }]);
  });
  const problems: Array<string> = [];
  grownByChangelog.forEach((grown, changelogPath) => {
    console.log(`[size-changelog]: grew since ${base}: ${grown.map((measurement) => measurement.name).join(', ')}`);
    if (!existsSync(changelogPath)) {
      console.log(`[size-changelog]: ${changelogPath} does not exist yet, so no line is required`);
      return;
    }
    problems.push(...findChangelogProblems({ changelogPath, grown, addedLines: readAddedLines(mergeBase, changelogPath) }));
  });
  problems.forEach((problem) => console.error(`[size-changelog]: ${problem}`));
  if (problems.length === 0) console.log('[size-changelog]: ok');
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = main();
