import type { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

// The Angular 22 install of CI has no ESLint: the lint, and this configuration, only run with Angular 21.
const WITHOUT_ESLINT: boolean = process.env['FOUNDRY_EXPECTED_ANGULAR_MAJOR'] === '22';
let ESLINT: ESLint;

beforeAll(async () => {
  if (WITHOUT_ESLINT) return;
  const { ESLint: ESLintClass } = await import('eslint');
  ESLINT = new ESLintClass();
});

async function missingJsdocLines(code: string, filePath: string): Promise<Array<number>> {
  const [result] = await ESLINT.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.ruleId === 'jsdoc/require-jsdoc').map((message) => message.line);
}

describe.skipIf(WITHOUT_ESLINT)('jsdoc on the name of error classes', () => {
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

async function lifecycleHookLines(code: string): Promise<Array<number>> {
  const [result] = await ESLINT.lintText(code, { filePath: 'tools/size/app/components/probe/probe.component.ts' });
  return (result?.messages ?? [])
    .filter((message) => message.message.startsWith('Lifecycle hooks only call'))
    .map((message) => message.line);
}

describe.skipIf(WITHOUT_ESLINT)('code in lifecycle hooks', () => {
  it('accepts hooks that only call methods of the class', async () => {
    const code: string = [
      'export class ProbeComponent {',
      '  ngOnInit(): void {',
      '    this.loadItems();',
      '    this.selectFirst(1);',
      '  }',
      '  ngOnDestroy(): void {',
      '    this.stop();',
      '  }',
      '  loadItems(): void {',
      '    const items: Array<string> = [];',
      '    this.items = items;',
      '  }',
      '}',
      '',
    ].join('\n');
    expect(await lifecycleHookLines(code)).toEqual([]);
  });

  it('rejects any other statement in a hook', async () => {
    const code: string = [
      'export class ProbeComponent {',
      '  ngOnInit(): void {',
      '    this.httpClientSE.get("/items").subscribe((items) => this.items.set(items));',
      '    const first: string = this.items[0];',
      '    if (first) this.select(first);',
      '  }',
      '  ngOnChanges(): void {',
      '    this.subscription.unsubscribe();',
      '  }',
      '}',
      '',
    ].join('\n');
    expect(await lifecycleHookLines(code)).toEqual([3, 4, 5, 8]);
  });
});
