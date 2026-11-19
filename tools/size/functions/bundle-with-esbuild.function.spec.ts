import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { bundleWithEsbuild } from './bundle-with-esbuild.function.ts';
import { bundleWithRollup } from './bundle-with-rollup.function.ts';

const FIXTURE: string = fileURLToPath(new URL('../fixtures/two-functions.mjs', import.meta.url));
const ENTRY_FILES: ReadonlyMap<string, string> = new Map([['@antoniocorraliza/foundry-utils/date', FIXTURE]]);
const SOURCE: string = "import { keptFixtureFunction } from '@antoniocorraliza/foundry-utils/date';\nconsole.log([keptFixtureFunction]);\n";

describe.each([
  ['esbuild', bundleWithEsbuild],
  ['rollup', bundleWithRollup],
])('bundling with %s', (bundlerName, bundle) => {
  it('resolves a Foundry entry to its built file and drops what is not imported', async () => {
    const code: string = await bundle({ source: SOURCE, resolveDirectory: process.cwd(), entryFiles: ENTRY_FILES });
    expect(code).toContain('kept fixture function');
    expect(code).not.toContain('dropped fixture function');
  });

  it('minifies the output', async () => {
    const code: string = await bundle({ source: SOURCE, resolveDirectory: process.cwd(), entryFiles: ENTRY_FILES });
    expect(code).not.toContain('keptFixtureFunction');
  });

  it('stops on a Foundry entry that is not built', async () => {
    const source: string = "import { parseCsv } from '@antoniocorraliza/foundry-utils/csv';\nconsole.log([parseCsv]);\n";
    await expect(bundle({ source, resolveDirectory: process.cwd(), entryFiles: ENTRY_FILES })).rejects.toThrow(
      '@antoniocorraliza/foundry-utils/csv is not built',
    );
  });
});
