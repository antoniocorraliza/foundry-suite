import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { BUNDLERS } from '../constants/bundlers.constant.ts';
import { createErrorNameProbeSource } from './create-error-name-probe-source.function.ts';
import { findErrorNameProblem } from './find-error-name-problem.function.ts';
import { readPrintedErrorName } from './read-printed-error-name.function.ts';

const SPECIFIER: string = '@antoniocorraliza/foundry-utils';
const ENTRY_FILES: ReadonlyMap<string, string> = new Map([
  [SPECIFIER, fileURLToPath(new URL('../fixtures/error-classes.mjs', import.meta.url))],
]);
const WORK_DIRECTORY: string = mkdtempSync(join(tmpdir(), 'foundry-size-spec-'));

async function readPrintedName(className: string, bundler: (typeof BUNDLERS)[number]): Promise<string> {
  const source: string = createErrorNameProbeSource(SPECIFIER, {
    packageFolder: 'foundry-utils',
    entry: '',
    className,
    constructorArguments: "'test'",
  });
  const outputFile: string = join(WORK_DIRECTORY, `${className}-${bundler}.mjs`);
  return readPrintedErrorName({ bundle: { source, resolveDirectory: WORK_DIRECTORY, entryFiles: ENTRY_FILES }, bundler, outputFile });
}

afterAll(() => rmSync(WORK_DIRECTORY, { recursive: true, force: true }));

describe.each(BUNDLERS)('error name after minifying with %s', (bundler) => {
  it('keeps a name declared as a literal', async () => {
    const printed: string = await readPrintedName('FixtureNamedError', bundler);
    expect(printed).toBe('FixtureNamedError');
    expect(findErrorNameProblem(SPECIFIER, 'FixtureNamedError', bundler, printed)).toBeNull();
  });

  it('catches a name taken from the minified constructor', async () => {
    const printed: string = await readPrintedName('FixtureConstructorNamedError', bundler);
    expect(printed).not.toBe('FixtureConstructorNamedError');
    expect(findErrorNameProblem(SPECIFIER, 'FixtureConstructorNamedError', bundler, printed)).toContain('after minifying');
  });

  it('keeps the name of a subclass that declares its own', async () => {
    expect(await readPrintedName('FixtureSubclassError', bundler)).toBe('FixtureSubclassError');
  });

  it('catches a subclass that inherits the name of its parent', async () => {
    const printed: string = await readPrintedName('FixtureForgetfulSubclassError', bundler);
    expect(printed).toBe('FixtureNamedError');
    expect(findErrorNameProblem(SPECIFIER, 'FixtureForgetfulSubclassError', bundler, printed)).toContain('after minifying');
  });

  it('catches a class that does not declare its name', async () => {
    expect(await readPrintedName('FixtureUnnamedError', bundler)).toBe('Error');
  });
});
