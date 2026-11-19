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

async function messageLines(code: string, filePath: string, messageStart: string): Promise<Array<number>> {
  const [result] = await ESLINT.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.message.startsWith(messageStart)).map((message) => message.line);
}

async function ruleLines(code: string, filePath: string, ruleId: string): Promise<Array<number>> {
  const [result] = await ESLINT.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.ruleId === ruleId).map((message) => message.line);
}

describe.skipIf(WITHOUT_ESLINT)('top-level functions', () => {
  const message: string = 'Top-level functions are declared with';

  it('accepts function declarations, inner arrow functions and typed functional interceptors', async () => {
    const code: string = [
      "import type { HttpInterceptorFn } from '@angular/common/http';",
      'export function loadItems(): Array<string> {',
      '  const trim = (name: string): string => name.trim();',
      "  return [' a '].map(trim);",
      '}',
      'export const foundryProbeInterceptor: HttpInterceptorFn = (request, next) => next(request);',
      '',
    ].join('\n');
    expect(await messageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
  });

  it('rejects arrow functions and function expressions kept in top-level constants', async () => {
    const code: string = [
      'export const loadItems = (): Array<string> => [];',
      'const saveItems = function (): void {',
      '  loadItems();',
      '};',
      'saveItems();',
      '',
    ].join('\n');
    expect(await messageLines(code, 'tools/probe/probe.ts', message)).toEqual([1, 2]);
  });
});

describe.skipIf(WITHOUT_ESLINT)('interfaces and types', () => {
  it('accepts a union and a computed type', async () => {
    const code: string = [
      "import type { Circle } from '../interfaces/circle.interface.ts';",
      "import type { Square } from '../interfaces/square.interface.ts';",
      'export type Shape = Circle | Square;',
      'export type ShapeKind = Shape["kind"];',
      '',
    ].join('\n');
    expect(await ruleLines(code, 'tools/probe/types/shape.type.ts', '@typescript-eslint/consistent-type-definitions')).toEqual([]);
  });

  it('rejects an object shape declared with type', async () => {
    const code: string = ['export type Point = {', '  readonly x: number;', '};', ''].join('\n');
    expect(await ruleLines(code, 'tools/probe/types/point.type.ts', '@typescript-eslint/consistent-type-definitions')).toEqual([1]);
  });
});

describe.skipIf(WITHOUT_ESLINT)('private members', () => {
  const message: string = 'Private members use the TypeScript';

  it('accepts the private modifier', async () => {
    const code: string = ['export class ItemStore {', '  private readonly items: Array<string> = [];', '}', ''].join('\n');
    expect(await messageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
  });

  it('rejects private names with #', async () => {
    const code: string = [
      'export class ItemStore {',
      '  readonly #items: Array<string> = [];',
      '  #count(): number {',
      '    return this.#items.length;',
      '  }',
      '}',
      '',
    ].join('\n');
    expect(await messageLines(code, 'tools/probe/probe.ts', message)).toEqual([2, 3, 4]);
  });
});
