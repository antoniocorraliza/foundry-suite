import { describe, expect, it } from 'vitest';
import { getEntryFiles } from './get-entry-files.function.ts';

describe('getEntryFiles', () => {
  it('lists the entry points of a built manifest and skips patterns and package.json', () => {
    expect(
      getEntryFiles({
        exports: {
          './styles/*.css': './styles/*.css',
          './package.json': { default: './package.json' },
          '.': { types: './types/ui.d.ts', default: './fesm2022/ui.mjs' },
          './icon': { types: './types/ui-icon.d.ts', default: './fesm2022/ui-icon.mjs' },
        },
      }),
    ).toEqual([
      { entry: '', file: 'fesm2022/ui.mjs' },
      { entry: 'icon', file: 'fesm2022/ui-icon.mjs' },
    ]);
  });

  it('returns nothing for a manifest without exports', () => {
    expect(getEntryFiles({})).toEqual([]);
  });
});
