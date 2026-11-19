import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { BUNDLERS } from '../constants/bundlers.constant.ts';
import { errorNameProbeSource } from './error-name-probe-source.function.ts';
import { errorNameProblem } from './error-name-problem.function.ts';
import { printedErrorName } from './printed-error-name.function.ts';

const SPECIFIER: string = '@antoniocorraliza/foundry-utils';
const ENTRY_FILES: ReadonlyMap<string, string> = new Map([
  [SPECIFIER, fileURLToPath(new URL('../fixtures/error-classes.mjs', import.meta.url))],
]);
const WORK_DIRECTORY: string = mkdtempSync(join(tmpdir(), 'foundry-size-spec-'));

async function printedName(className: string, bundler: (typeof BUNDLERS)[number]): Promise<string> {
  const source: string = errorNameProbeSource(SPECIFIER, {
    packageFolder: 'foundry-utils',
    entry: '',
    className,
    constructorArguments: "'test'",
  });
  const outputFile: string = join(WORK_DIRECTORY, `${className}-${bundler}.mjs`);
  return printedErrorName({ bundle: { source, resolveDirectory: WORK_DIRECTORY, entryFiles: ENTRY_FILES }, bundler, outputFile });
}

afterAll(() => rmSync(WORK_DIRECTORY, { recursive: true, force: true }));

describe.each(BUNDLERS)('error name after minifying with %s', (bundler) => {
  it('keeps a name declared as a literal', async () => {
    const printed: string = await printedName('FixtureNamedError', bundler);
    expect(printed).toBe('FixtureNamedError');
    expect(errorNameProblem(SPECIFIER, 'FixtureNamedError', bundler, printed)).toBeNull();
  });

  it('catches a name taken from the minified constructor', async () => {
    const printed: string = await printedName('FixtureConstructorNamedError', bundler);
    expect(printed).not.toBe('FixtureConstructorNamedError');
    expect(errorNameProblem(SPECIFIER, 'FixtureConstructorNamedError', bundler, printed)).toContain('after minifying');
  });

  it('keeps the name of a subclass that declares its own', async () => {
    expect(await printedName('FixtureSubclassError', bundler)).toBe('FixtureSubclassError');
  });

  it('catches a subclass that inherits the name of its parent', async () => {
    const printed: string = await printedName('FixtureForgetfulSubclassError', bundler);
    expect(printed).toBe('FixtureNamedError');
    expect(errorNameProblem(SPECIFIER, 'FixtureForgetfulSubclassError', bundler, printed)).toContain('after minifying');
  });

  it('catches a class that does not declare its name', async () => {
    expect(await printedName('FixtureUnnamedError', bundler)).toBe('Error');
  });
});
