import type { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

// The Angular 22 install of CI has no ESLint: the lint, and this configuration, only run with Angular 21.
const IS_ESLINT_MISSING: boolean = process.env['FOUNDRY_EXPECTED_ANGULAR_MAJOR'] === '22';
let eslint: ESLint;

// Loading the configuration and its plugins takes seconds on a busy machine: it happens here, not in the first test.
beforeAll(async () => {
  if (IS_ESLINT_MISSING) return;
  const { ESLint: ESLintClass } = await import('eslint');
  eslint = new ESLintClass();
  await eslint.lintText('', { filePath: 'projects/antoniocorraliza/foundry-utils/src/public-api.ts' });
}, 60_000);

async function findMissingJsdocLines(code: string, filePath: string): Promise<Array<number>> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.ruleId === 'jsdoc/require-jsdoc').map((message) => message.line);
}

describe.skipIf(IS_ESLINT_MISSING)('jsdoc on the name of error classes', () => {
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
    const lines: Array<number> = await findMissingJsdocLines(
      errorClass,
      'projects/antoniocorraliza/foundry-utils/src/errors/foundry-utils.error.ts',
    );
    expect(lines).not.toContain(5);
  });

  it('still asks for it on the other public members of an error class', async () => {
    const lines: Array<number> = await findMissingJsdocLines(
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
    expect(
      await findMissingJsdocLines(code, 'projects/antoniocorraliza/foundry-utils/src/functions/foundry-named-value.function.ts'),
    ).toEqual([5]);
  });
});

async function findLifecycleHookLines(code: string): Promise<Array<number>> {
  const [result] = await eslint.lintText(code, { filePath: 'tools/size/app/components/probe/probe.component.ts' });
  return (result?.messages ?? [])
    .filter((message) => message.message.startsWith('Lifecycle hooks only call'))
    .map((message) => message.line);
}

describe.skipIf(IS_ESLINT_MISSING)('code in lifecycle hooks', () => {
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
    expect(await findLifecycleHookLines(code)).toEqual([]);
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
    expect(await findLifecycleHookLines(code)).toEqual([3, 4, 5, 8]);
  });
});

async function findMessageLines(code: string, filePath: string, messageStart: string): Promise<Array<number>> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.message.startsWith(messageStart)).map((message) => message.line);
}

async function findRuleLines(code: string, filePath: string, ruleId: string): Promise<Array<number>> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).filter((message) => message.ruleId === ruleId).map((message) => message.line);
}

describe.skipIf(IS_ESLINT_MISSING)('top-level functions', () => {
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
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
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
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([1, 2]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('interfaces and types', () => {
  it('accepts a union and a computed type', async () => {
    const code: string = [
      "import type { Circle } from '../interfaces/circle.interface.ts';",
      "import type { Square } from '../interfaces/square.interface.ts';",
      'export type Shape = Circle | Square;',
      'export type ShapeKind = Shape["kind"];',
      '',
    ].join('\n');
    expect(await findRuleLines(code, 'tools/probe/types/shape.type.ts', '@typescript-eslint/consistent-type-definitions')).toEqual([]);
  });

  it('rejects an object shape declared with type', async () => {
    const code: string = ['export type Point = {', '  readonly x: number;', '};', ''].join('\n');
    expect(await findRuleLines(code, 'tools/probe/types/point.type.ts', '@typescript-eslint/consistent-type-definitions')).toEqual([1]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('private members', () => {
  const message: string = 'Private members use the TypeScript';

  it('accepts the private modifier', async () => {
    const code: string = ['export class ItemStore {', '  private readonly items: Array<string> = [];', '}', ''].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
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
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([2, 3, 4]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('names of booleans', () => {
  const message: string = 'Booleans start with is, has or can';

  it('accepts booleans that start with is, has or can', async () => {
    const code: string = [
      'export const IS_READY: boolean = true;',
      'export function toggle(isVisible: boolean, hasError: boolean | null): boolean {',
      '  const canSubmit: boolean = isVisible && hasError !== true;',
      '  return canSubmit;',
      '}',
      'export class PanelState {',
      '  readonly isOpen: WritableSignal<boolean> = signal(false);',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
  });

  it('rejects any other name for variables, parameters, properties and boolean signals', async () => {
    const code: string = [
      'export const READY: boolean = true;',
      'export function toggle(visible: boolean, error: boolean | null): boolean {',
      '  const submit: boolean = visible && error !== true;',
      '  return submit;',
      '}',
      'export class PanelState {',
      '  readonly open: WritableSignal<boolean> = signal(false);',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([1, 2, 2, 3, 7]);
  });

  it('rejects them in interfaces', async () => {
    const code: string = ['export interface PanelOptions {', '  readonly modal: boolean;', '  readonly isOpen: boolean;', '}', ''].join(
      '\n',
    );
    expect(await findMessageLines(code, 'tools/probe/interfaces/panel-options.interface.ts', message)).toEqual([2]);
  });

  it('leaves the public API of the libraries to their designs and checks the internal code', async () => {
    const code: string = [
      'export class FoundryPanelComponent {',
      '  readonly disabled: Signal<boolean> = computed(() => false);',
      '  protected readonly open: WritableSignal<boolean> = signal(false);',
      '  private visible: boolean = false;',
      '  toggle(force: boolean): void {',
      '    const expanded: boolean = force || this.open();',
      '    this.visible = expanded;',
      '  }',
      '}',
      '',
    ].join('\n');
    const path: string = 'projects/antoniocorraliza/foundry-ui/panel/src/components/foundry-panel/foundry-panel.component.ts';
    expect(await findMessageLines(code, path, message)).toEqual([3, 4, 6]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('names of observables', () => {
  it('accepts observables that end in Observable', async () => {
    const code: string = [
      'export function changes(sourceObservable: Observable<string>): Observable<string> {',
      '  const trimmedObservable: Observable<string> = sourceObservable.pipe(map((value) => value.trim()));',
      '  return trimmedObservable;',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', 'Observables end in')).toEqual([]);
  });

  it('rejects other names and the $ suffix', async () => {
    const code: string = [
      'export function changes(source: Observable<string>): Observable<string> {',
      '  const trimmed$: Observable<string> | null = source.pipe(map((value) => value.trim()));',
      '  return trimmed$ ?? source;',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', 'Observables end in')).toEqual([1, 2, 2, 3]);
  });

  it('leaves public observables of the libraries to their designs', async () => {
    const code: string = [
      'export class FoundrySessionService {',
      '  readonly events: Observable<string> = EMPTY;',
      '  private readonly refreshes: Observable<string> = EMPTY;',
      '}',
      '',
    ].join('\n');
    const path: string = 'projects/antoniocorraliza/foundry-core/security/src/services/foundry-session.service.ts';
    expect(await findMessageLines(code, path, 'Observables end in')).toEqual([3]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('loops over lists', () => {
  const message: string = 'Lists are walked with array methods';

  it('accepts a for loop with an index', async () => {
    const code: string = [
      'export function getTotal(first: ReadonlyArray<number>, second: ReadonlyArray<number>): number {',
      '  let total: number = 0;',
      '  for (let index: number = 0; index < first.length; index++) total += (first[index] ?? 0) * (second[index] ?? 0);',
      '  return total;',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
  });

  it('accepts array methods, and loops that await or stop early', async () => {
    const code: string = [
      'export async function process(items: ReadonlyArray<string>): Promise<string | null> {',
      '  items.forEach((item) => console.log(item));',
      '  for (const item of items) await save(item);',
      '  for await (const line of lines()) console.log(line);',
      '  for (const item of items) {',
      "    if (item === '') break;",
      '  }',
      '  for (const item of items) {',
      '    if (item.length > 3) return item;',
      '  }',
      '  return null;',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
  });

  it('rejects for...of and for...in loops that only walk the list', async () => {
    const code: string = [
      'export function totals(items: ReadonlyArray<number>, counts: Readonly<Record<string, number>>): number {',
      '  let total: number = 0;',
      '  for (const item of items) total += item;',
      '  for (const name in counts) total += counts[name] ?? 0;',
      '  return total;',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([3, 4]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('null for missing values', () => {
  const message: string = 'Internal code uses null';

  it('accepts null, and undefined that comes from the language and is only compared', async () => {
    const code: string = [
      'export function firstName(names: ReadonlyArray<string>, fallback?: string): string | null {',
      '  const first: string | undefined = names[0];',
      '  if (first === undefined) return fallback ?? null;',
      '  return first;',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
  });

  it('rejects undefined as a value and in return types', async () => {
    const code: string = [
      'export function firstName(names: ReadonlyArray<string>): string | undefined {',
      '  if (names.length === 0) return undefined;',
      '  const first: string | null = names[0] ?? undefined ?? null;',
      '  return first ?? undefined;',
      '}',
      'export interface NameReader {',
      '  read(): Promise<string | undefined>;',
      '  readonly next: () => string | undefined;',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([1, 2, 3, 4, 7, 8]);
  });

  it('leaves undefined in the public API of the libraries to their designs', async () => {
    const code: string = [
      'export function message(body: unknown): string | undefined {',
      "  return typeof body === 'string' ? body : undefined;",
      '}',
      'function title(body: unknown): string | undefined {',
      "  return typeof body === 'string' ? body : null;",
      '}',
      '',
    ].join('\n');
    const path: string = 'projects/antoniocorraliza/foundry-core/http-client/src/functions/message.function.ts';
    expect(await findMessageLines(code, path, message)).toEqual([2, 4]);
  });

  it('lets tests use undefined', async () => {
    const code: string = ["it('returns nothing', () => {", '  expect(read()).toBe(undefined);', '});', ''].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.spec.ts', message)).toEqual([]);
  });
});

const ANGULAR_MESSAGES: ReadonlyArray<string> = [
  'Inputs and outputs are declared with',
  'Pass the DestroyRef',
  'Subscriptions end with',
  'The errors of an Observable',
  'Services do not subscribe',
  'Outputs are declared with output()',
];

async function findAngularLines(code: string, filePath: string): Promise<Array<string>> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? [])
    .filter(
      (message) => message.ruleId?.startsWith('@angular-eslint/') || ANGULAR_MESSAGES.some((start) => message.message.startsWith(start)),
    )
    .map((message) => `${message.line} ${message.ruleId === 'no-restricted-syntax' ? message.message.split(' ')[0] : message.ruleId}`);
}

describe.skipIf(IS_ESLINT_MISSING)('angular in the libraries', () => {
  const componentPath: string = 'projects/antoniocorraliza/foundry-ui/panel/src/components/foundry-panel/foundry-panel.component.ts';
  const servicePath: string = 'projects/antoniocorraliza/foundry-ui/panel/src/services/foundry-panel.service.ts';

  it('accepts a component written as the guide asks', async () => {
    const code: string = [
      '@Component({',
      "  selector: 'foundry-panel',",
      "  templateUrl: './foundry-panel.component.html',",
      "  styleUrl: './foundry-panel.component.scss',",
      "  host: { '[class.isOpen]': 'isOpen()', '(keydown.escape)': 'onEscape()' },",
      '})',
      'export class FoundryPanelComponent {',
      '  private readonly destroyRef: DestroyRef = inject(DestroyRef);',
      '  private readonly foundryPanelSE: FoundryPanelService = inject(FoundryPanelService);',
      "  readonly label: InputSignal<string> = input('');",
      '  readonly closed: OutputEmitterRef<void> = output();',
      '  protected readonly isOpen: WritableSignal<boolean> = signal(false);',
      '  protected readonly items: WritableSignal<Array<string>> = signal([]);',
      '  private loadItems(): void {',
      '    this.foundryPanelSE',
      '      .load()',
      '      .pipe(',
      '        catchError(() => of([])),',
      '        takeUntilDestroyed(this.destroyRef),',
      '      )',
      '      .subscribe((items) => this.items.set(items));',
      '  }',
      '  protected onEscape(): void {',
      '    this.closed.emit();',
      '  }',
      '}',
      '',
    ].join('\n');
    expect(await findAngularLines(code, componentPath)).toEqual([]);
  });

  it('rejects decorators, inline templates and styles, host decorators, toSignal and the other ways to end or fail', async () => {
    const code: string = [
      '@Component({',
      "  selector: 'foundry-panel',",
      "  template: '<p>{{ label }}</p>',",
      "  styleUrls: ['./foundry-panel.component.scss'],",
      '})',
      'export class FoundryPanelComponent {',
      "  @Input() label: string = '';",
      '  @Output() closed: EventEmitter<void> = new EventEmitter();',
      "  @HostBinding('class.isOpen') protected isOpen: boolean = false;",
      "  @HostListener('keydown.escape') protected onEscape(): void {",
      '    this.closed.emit();',
      '  }',
      '  protected readonly items: Signal<Array<string>> = toSignal(this.foundryPanelSE.load(), { initialValue: [] });',
      '  private loadItems(): void {',
      '    this.foundryPanelSE',
      '      .load()',
      '      .pipe(takeUntil(this.destroyed), takeUntilDestroyed())',
      '      .subscribe({ next: (items) => this.list.set(items), error: () => this.list.set([]) });',
      '    this.foundryPanelSE.load().subscribe(',
      '      (items) => this.list.set(items),',
      '      () => this.list.set([]),',
      '    );',
      '  }',
      '}',
      '',
    ].join('\n');
    expect(await findAngularLines(code, componentPath)).toEqual([
      '3 @angular-eslint/component-max-inline-declarations',
      '4 @angular-eslint/consistent-component-styles',
      '7 Inputs',
      '8 Inputs',
      '9 @angular-eslint/prefer-host-metadata-property',
      '10 @angular-eslint/prefer-host-metadata-property',
      '17 Subscriptions',
      '17 Pass',
      '18 The',
      '19 The',
    ]);
  });

  it('accepts toSignal in components and services', async () => {
    const component: string = [
      'export class FoundryPanelComponent {',
      '  protected readonly items: Signal<Array<string>> = toSignal(this.foundryPanelSE.load(), { initialValue: [] });',
      '}',
      '',
    ].join('\n');
    const service: string = [
      "@Injectable({ providedIn: 'root' })",
      'export class FoundryPanelService {',
      '  readonly items: Signal<Array<string>> = toSignal(this.load(), { initialValue: [] });',
      '}',
      '',
    ].join('\n');
    expect(await findAngularLines(component, componentPath)).toEqual([]);
    expect(await findAngularLines(service, servicePath)).toEqual([]);
  });

  it('rejects subscribe in a service unless a directive gives the reason', async () => {
    const code: string = [
      "@Injectable({ providedIn: 'root' })",
      'export class FoundryPanelService {',
      '  private start(): void {',
      '    this.load().subscribe((items) => this.items.set(items));',
      '  }',
      '  private keepRefreshing(): void {',
      '    // eslint-disable-next-line no-restricted-syntax -- the refresh must finish even when nobody waits for it',
      '    this.refreshObservable.subscribe();',
      '  }',
      '}',
      '',
    ].join('\n');
    expect(await findAngularLines(code, servicePath)).toEqual(['4 Services']);
  });

  it('rejects outputFromObservable', async () => {
    const code: string = [
      'export class FoundryPanelComponent {',
      '  readonly closed: OutputRef<void> = outputFromObservable(this.closedSubject);',
      '}',
      '',
    ].join('\n');
    expect(await findAngularLines(code, componentPath)).toEqual(['2 Outputs']);
  });

  it('lets the tests of the libraries declare inline fixture components', async () => {
    const code: string = [
      "@Component({ selector: 'foundry-host', template: '<foundry-panel />' })",
      'class HostComponent {}',
      "it('renders', () => TestBed.createComponent(HostComponent));",
      '',
    ].join('\n');
    expect(await findAngularLines(code, componentPath.replace('.component.ts', '.component.spec.ts'))).toEqual([]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('subjects', () => {
  it('accepts a private subject that ends in Subject, exposed with asObservable()', async () => {
    const code: string = [
      'export class ItemStore {',
      '  private readonly itemsSubject: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);',
      '  readonly itemsObservable: Observable<Array<string>> = this.itemsSubject.asObservable();',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', 'Subjects')).toEqual([]);
  });

  it('rejects other names and subjects that are not private, also in the libraries', async () => {
    const code: string = [
      'export class FoundryItemStore {',
      '  private readonly items: Subject<string> = new Subject<string>();',
      '  readonly changesSubject: ReplaySubject<string> = new ReplaySubject<string>(1);',
      '}',
      '',
    ].join('\n');
    const path: string = 'projects/antoniocorraliza/foundry-core/broadcast/src/services/foundry-item-store.service.ts';
    expect(await findMessageLines(code, 'tools/probe/probe.ts', 'Subjects')).toEqual([2, 3]);
    expect(await findMessageLines(code, path, 'Subjects')).toEqual([2, 3]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('protected members of the libraries', () => {
  it('asks for named object types like private members', async () => {
    const code: string = [
      'export class FoundryPanelComponent {',
      '  readonly position: { readonly top: number } = { top: 0 };',
      '  protected readonly size: { readonly width: number } = { width: 0 };',
      '}',
      '',
    ].join('\n');
    const path: string = 'projects/antoniocorraliza/foundry-ui/panel/src/components/foundry-panel/foundry-panel.component.ts';
    expect(await findMessageLines(code, path, 'Object types get a name')).toEqual([3]);
  });
});

describe.skipIf(IS_ESLINT_MISSING)('function names', () => {
  const message: string = 'Functions start with a verb';
  const ruleId: string = '@typescript-eslint/naming-convention';

  it('accepts functions, methods and function constants that start with a verb of the list', async () => {
    const code: string = [
      "import type { HttpInterceptorFn } from '@angular/common/http';",
      'export function getEntryFiles(): Array<string> {',
      '  const runWorker = (): void => {};',
      '  runWorker();',
      '  return [];',
      '}',
      'function main(): void {}',
      'export const foundryProbeInterceptor: HttpInterceptorFn = (request, next) => next(request);',
      'export class ProbeComponent {',
      '  private readonly onPointerEnter = (): void => {};',
      '  ngOnInit(): void {}',
      '  protected onSave(): void {}',
      '}',
      'export interface Snapshot {',
      '  listChanges(): Array<string>;',
      '}',
      'const plugin: object = { setup(): void {}, renderChunk: (code: string): string => code };',
      'main();',
      '',
    ].join('\n');
    expect(await findRuleLines(code, 'tools/probe/probe.ts', ruleId)).toEqual([]);
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([]);
  });

  it('rejects functions, methods and interface methods that start with a noun', async () => {
    const code: string = [
      'export function entryFiles(): Array<string> {',
      '  return [];',
      '}',
      'export class Probe {',
      '  label(): string {',
      "    return '';",
      '  }',
      '}',
      'export interface Snapshot {',
      '  changes(): Array<string>;',
      '}',
      '',
    ].join('\n');
    expect(await findRuleLines(code, 'tools/probe/probe.ts', ruleId)).toEqual([1, 5, 10]);
  });

  it('rejects function constants and function properties that start with a noun', async () => {
    const code: string = [
      'export function runAll(): void {',
      '  const worker = (): void => {};',
      '  worker();',
      '}',
      'export class Probe {',
      '  private readonly pointerEnter = (): void => {};',
      '}',
      '',
    ].join('\n');
    expect(await findMessageLines(code, 'tools/probe/probe.ts', message)).toEqual([2, 6]);
  });

  it('checks the internal functions with the private prefix and lets deepClone keep its design name', async () => {
    const path: string = 'projects/antoniocorraliza/foundry-utils/src/functions/probe.function.ts';
    const code: string = [
      '/**',
      ' * Returns the kind.',
      ' */',
      'export function \u0275getKind(): string {',
      "  return '';",
      '}',
      '/**',
      ' * Returns the kind.',
      ' */',
      'export function \u0275valueKind(): string {',
      "  return '';",
      '}',
      '/**',
      ' * Returns a copy.',
      ' */',
      'export function deepClone<T>(value: T): T {',
      '  return value;',
      '}',
      '',
    ].join('\n');
    expect(await findRuleLines(code, path, ruleId)).toEqual([10]);
  });

  it('checks the functions of the tests too', async () => {
    const code: string = ['function tarballOf(): string {', "  return '';", '}', 'tarballOf();', ''].join('\n');
    expect(await findRuleLines(code, 'tools/probe/probe.spec.ts', ruleId)).toEqual([1]);
  });
});
