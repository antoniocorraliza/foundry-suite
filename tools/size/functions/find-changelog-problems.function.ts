import type { ChangelogCheck } from '../interfaces/changelog-check.interface.ts';

export function findChangelogProblems(check: ChangelogCheck): Array<string> {
  const { changelogPath, grown, addedLines } = check;
  return grown
    .filter((measurement) => !addedLines.some((line) => measurement.mentions.some((mention) => line.includes(mention))))
    .map((measurement) => `${measurement.name} grew: add a line to ${changelogPath} that names ${measurement.mentions.join(' or ')}`);
}
