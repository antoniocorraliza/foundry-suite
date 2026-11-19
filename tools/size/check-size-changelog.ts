import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGES_SOURCE_DIRECTORY } from '../packages/constants/paths.constant.ts';
import { SIZE_REFERENCE_PATH } from './constants/size-settings.constant.ts';
import { changelogProblems } from './functions/changelog-problems.function.ts';
import { grownMeasurements } from './functions/grown-measurements.function.ts';
import { measurementSubject } from './functions/measurement-subject.function.ts';
import type { GrownMeasurement } from './interfaces/grown-measurement.interface.ts';
import type { MeasurementSubject } from './interfaces/measurement-subject.interface.ts';
import type { SizeReference } from './types/size-reference.type.ts';

function git(gitArguments: ReadonlyArray<string>): string {
  return execFileSync('git', gitArguments, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function baseReference(mergeBase: string): SizeReference | undefined {
  try {
    return JSON.parse(git(['show', `${mergeBase}:${SIZE_REFERENCE_PATH}`])) as SizeReference;
  } catch {
    return undefined;
  }
}

// A changelog that the merge base does not have is new: every line counts as added, also before it is committed.
function addedLines(mergeBase: string, changelogPath: string): Array<string> {
  try {
    git(['cat-file', '-e', `${mergeBase}:${changelogPath}`]);
  } catch {
    return readFileSync(changelogPath, 'utf8').split('\n');
  }
  return git(['diff', mergeBase, '--', changelogPath])
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'));
}

function main(): number {
  const base: string = process.argv[2] ?? 'origin/main';
  const mergeBase: string = git(['merge-base', base, 'HEAD']).trim();
  const before: SizeReference | undefined = baseReference(mergeBase);
  if (before === undefined) {
    console.log(`[size-changelog]: ${base} has no ${SIZE_REFERENCE_PATH}; nothing to compare`);
    return 0;
  }
  const after: SizeReference = JSON.parse(readFileSync(SIZE_REFERENCE_PATH, 'utf8')) as SizeReference;
  const grownByChangelog: Map<string, Array<GrownMeasurement>> = new Map();
  grownMeasurements(before, after).forEach((name) => {
    const subject: MeasurementSubject | undefined = measurementSubject(name);
    if (subject === undefined) throw new Error(`[size-changelog]: cannot tell the package of the measurement '${name}'`);
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
    problems.push(...changelogProblems({ changelogPath, grown, addedLines: addedLines(mergeBase, changelogPath) }));
  });
  problems.forEach((problem) => console.error(`[size-changelog]: ${problem}`));
  if (problems.length === 0) console.log('[size-changelog]: ok');
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = main();
