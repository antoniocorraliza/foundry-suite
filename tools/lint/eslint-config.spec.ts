import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const ESLINT: ESLint = new ESLint();

async function missingJsdocLines(code: string, filePath: string): Promise<Array<number>> {
  const [result] = await ESLINT.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.ruleId === 'jsdoc/require-jsdoc').map((message) => message.line);
}

describe('jsdoc on the name of error classes', () => {
  const errorClass: string = [
    '/**',
    ' * Reports a failure inside Utils.',
    ' */',
    'export class FoundryUtilsError extends Error {',
    "  override readonly name: string = 'FoundryUtilsError';",
    "  readonly path: string = '';",
    '}',
    '',
  ].join('\n');

  it('does not ask for a JSDoc on override readonly name in errors/', async () => {
    const lines: Array<number> = await missingJsdocLines(
      errorClass,
      'projects/antoniocorraliza/foundry-utils/src/errors/foundry-utils.error.ts',
    );
    expect(lines).not.toContain(5);
  });

  it('still asks for it on the other public members of an error class', async () => {
    const lines: Array<number> = await missingJsdocLines(
      errorClass,
      'projects/antoniocorraliza/foundry-utils/src/errors/foundry-utils.error.ts',
    );
    expect(lines).toEqual([6]);
  });

  it('still asks for it on a property called name outside errors/', async () => {
    const code: string = [
      '/**',
      ' * Holds a named value.',
      ' */',
      'export class FoundryNamedValue extends FoundryValue {',
      "  override readonly name: string = 'value';",
      '}',
      '',
    ].join('\n');
    expect(await missingJsdocLines(code, 'projects/antoniocorraliza/foundry-utils/src/functions/foundry-named-value.function.ts')).toEqual([
      5,
    ]);
  });
});
