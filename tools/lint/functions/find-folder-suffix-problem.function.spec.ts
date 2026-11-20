import { describe, expect, it } from 'vitest';
import { findFolderSuffixProblem } from './find-folder-suffix-problem.function.ts';

describe('findFolderSuffixProblem', () => {
  it.each([
    'core/storage/src/interfaces/foundry-storage-key.interface.ts',
    'core/storage/src/types/foundry-storage-area.type.ts',
    'core/storage/src/services/foundry-storage.service.spec.ts',
    'utils/src/errors/foundry-utils.error.ts',
    'utils/csv/src/errors/foundry-csv-parse.error.spec.ts',
    'utils/case/src/types/foundry-camel-case.type.test-d.ts',
    'utils/object/src/functions/deep-clone.jsdom.function.spec.ts',
    'ui/select/src/components/foundry-select/foundry-select.component.html',
    'tools/ci/check-commits.ts',
    'README.md',
  ])('accepts %s', (path) => {
    expect(findFolderSuffixProblem(path)).toBeNull();
  });

  it('reports a file without the suffix of its folder', () => {
    expect(findFolderSuffixProblem('tools/ci/interfaces/commit.ts')).toBe(
      'tools/ci/interfaces/commit.ts: a file in interfaces/ must end in .interface.ts',
    );
  });

  it('keeps types and interfaces in separate folders', () => {
    expect(findFolderSuffixProblem('tools/ci/interfaces/audit-severity.type.ts')).toBe(
      'tools/ci/interfaces/audit-severity.type.ts: a file in interfaces/ must end in .interface.ts',
    );
    expect(findFolderSuffixProblem('tools/ci/types/commit.interface.ts')).toBe(
      'tools/ci/types/commit.interface.ts: a file in types/ must end in .type.ts',
    );
  });

  it('keeps error classes in errors/', () => {
    expect(findFolderSuffixProblem('utils/csv/src/errors/foundry-csv-parse-error.ts')).toBe(
      'utils/csv/src/errors/foundry-csv-parse-error.ts: a file in errors/ must end in .error.ts',
    );
    expect(findFolderSuffixProblem('utils/csv/src/functions/foundry-csv-parse.error.ts')).toBe(
      'utils/csv/src/functions/foundry-csv-parse.error.ts: a file in functions/ must end in .function.ts',
    );
    expect(findFolderSuffixProblem('utils/csv/src/foundry-csv-parse.error.ts')).toBe(
      'utils/csv/src/foundry-csv-parse.error.ts: a file with this suffix belongs in a errors/ folder',
    );
  });

  it('reports a suffix outside its folder', () => {
    expect(findFolderSuffixProblem('core/storage/src/foundry-storage.service.ts')).toBe(
      'core/storage/src/foundry-storage.service.ts: a file with this suffix belongs in a services/ folder',
    );
  });

  it('uses the nearest folder that has a kind', () => {
    expect(findFolderSuffixProblem('ui/src/services/components/x/x.component.ts')).toBeNull();
  });
});
