import { describe, expect, it } from 'vitest';
import { findTitleProblems } from './find-title-problems.function.ts';

describe('findTitleProblems', () => {
  it.each([
    'feat(utils): add parseDate',
    'fix: keep the session on refresh',
    'refactor(core)!: rename the storage port',
    'chore(deps): bump vitest to 5.1.2',
  ])('accepts "%s"', (title) => {
    expect(findTitleProblems(title)).toEqual([]);
  });

  it.each([
    'Feat(utils): add parseDate',
    'feat(utils): Add parseDate',
    'feat(utils): add parseDate.',
    'feat(storage): add a key',
    'update stuff',
    'feat(utils):add parseDate',
  ])('rejects "%s"', (title) => {
    expect(findTitleProblems(title)).toHaveLength(1);
  });

  it('rejects a title longer than 72 characters', () => {
    const title: string = `feat(utils): ${'a'.repeat(60)}`;
    expect(findTitleProblems(title)).toEqual([`title is ${title.length} characters long, the maximum is 72`]);
  });
});
