import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { DiscardableValue } from '../interfaces/discardable-value.interface.ts';
import { bundleWithEsbuild } from './bundle-with-esbuild.function.ts';
import { bundleWithRollup } from './bundle-with-rollup.function.ts';
import { createDiscardableValueProbeSource } from './create-discardable-value-probe-source.function.ts';
import { findDiscardableValueProblem } from './find-discardable-value-problem.function.ts';

const SPECIFIER: string = '@antoniocorraliza/foundry-utils/csv';
const FIXTURE: string = fileURLToPath(new URL('../fixtures/discardable-values.mjs', import.meta.url));
const ENTRY_FILES: ReadonlyMap<string, string> = new Map([[SPECIFIER, FIXTURE]]);
const PURE_VALUE: DiscardableValue = {
  packageFolder: 'foundry-utils',
  entry: 'csv',
  valueName: 'pureFixtureOptions',
  keptSymbol: 'getKeptFixtureValue',
  absentText: 'droppedFixtureKey',
};
const IMPURE_VALUE: DiscardableValue = {
  ...PURE_VALUE,
  valueName: 'impureFixtureOptions',
  absentText: 'keptFixtureKey',
};

describe('findDiscardableValueProblem', () => {
  it('accepts a bundle without the text of the value', () => {
    expect(findDiscardableValueProblem(SPECIFIER, PURE_VALUE, 'esbuild', 'console.log("kept fixture function")')).toBeNull();
  });

  it('reports a bundle that keeps the text of the value', () => {
    expect(
      findDiscardableValueProblem(SPECIFIER, PURE_VALUE, 'rollup', 'Object.freeze({droppedFixtureKey:"dropped fixture options"})'),
    ).toBe(
      'pureFixtureOptions from @antoniocorraliza/foundry-utils/csv [rollup]: it stays in the bundle of getKeptFixtureValue when it is imported and not used; mark it /* @__PURE__ */',
    );
  });

  describe.each([
    ['esbuild', bundleWithEsbuild],
    ['rollup', bundleWithRollup],
  ])('on a real bundle made with %s', (bundlerName, bundle) => {
    it('finds no problem with a frozen value marked as pure', async () => {
      const code: string = await bundle({
        source: createDiscardableValueProbeSource(SPECIFIER, PURE_VALUE),
        resolveDirectory: process.cwd(),
        entryFiles: ENTRY_FILES,
      });
      expect(code).toContain('kept fixture function');
      expect(findDiscardableValueProblem(SPECIFIER, PURE_VALUE, bundlerName, code)).toBeNull();
    });

    it('reports a value that the bundle keeps', async () => {
      const code: string = await bundle({
        source: createDiscardableValueProbeSource(SPECIFIER, IMPURE_VALUE),
        resolveDirectory: process.cwd(),
        entryFiles: ENTRY_FILES,
      });
      expect(findDiscardableValueProblem(SPECIFIER, IMPURE_VALUE, bundlerName, code)).not.toBeNull();
    });
  });
});
