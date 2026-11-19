# Contributing

## Before opening a pull request

Use the Node version in `.nvmrc`, with npm 11.16 or later: older versions ignore `allowScripts` and run every install script.

```bash
npm ci
npm run lint             # ESLint, Prettier, text rules and type-check
npm test
npm run build
npm run check:packages
npm run size             # size of each entry: see tools/size/README.md
```

`npm run format` fixes the formatting. CI runs the same checks: see `tools/ci/README.md`.

## Style guide

It applies to the whole repository: libraries, `tools/`, `.github/`, configuration and READMEs. Each rule says what checks it: a tool inside `npm run lint` (fast CI level) or the pull request review.

### 1. Formatting

Prettier: 140 columns, single quotes, semicolons, trailing commas and a final newline. Lockfiles are not formatted. A decorator goes right above the class or member it decorates, without a blank line in between: Prettier removes it.

Checked by: `prettier --check`.

### 2. Comments only where the code cannot speak

Write a comment only if, without it, someone could change the code and break it: a quirk of a tool, a limit outside the code, a reason that cannot be read from it. Try a better name or a smaller function first. No comments that describe the code, give examples of its output, point to other files or give instructions for future work. One line, in English, next to the line it explains.

Test: delete it. If nobody could break anything for lack of it, leave it deleted.

This applies to `tools/` and the configuration:

```ts
// Yes
// ng-packagr 21 adds tslib to dependencies even when nothing imports it.

// No
// TestBed on Node (jsdom) without zone.js.
// The rules are described in tools/packages/README.md.
```

In the libraries (`projects/`, spec files included) there are no comments other than JSDoc. The reason for a decision that the code does not show is protected by a test that fails if someone changes it, and it is explained in the pull request. Templates and style sheets have no comments either. Only these are allowed, because they are not explanations:

- the class section markers (`// ACTIONS`...);
- `/* @__PURE__ */`;
- `// eslint-disable-next-line` and `// @ts-expect-error`, only when they are needed, with the reason in the directive itself: `// eslint-disable-next-line no-console -- the warning is the output`, `// @ts-expect-error the second argument is missing on purpose`.

Checked by: review in `tools/`; in `projects/`, `tools/lint/check-text.ts` rejects any other comment, in TypeScript, templates and styles.

### 2b. JSDoc of the public API

The public API of the libraries is documented with JSDoc. It is documentation for the users of the package, not a comment, and it is required. It is as plain as the code:

- It starts with a verb in the third person and goes to the point: "Parses...", "Returns...", "Closes...". Never "This function...", "A utility that..." or "Helper to...".
- One sentence, two at most: what it does, and what it returns in the cases that are not obvious (`null`, empty, errors).
- No adjectives or sales words (robust, powerful, seamless, simple, easy, efficient...) and no phrases that say nothing ("for convenience", "as expected", "note that").
- Only what the types do not say: no `@param` or `@returns` that repeat the name or the type.
- `@throws` when the function throws.
- `@example` only when the use is not obvious, on one line.
- In English, without process references.

```ts
// Yes
/**
 * Parses a day written as `YYYY-MM-DD`, or returns `null` when the text is not a valid day.
 * @throws {RangeError} When the time zone skips the whole day.
 */
export function parseCalendarDay(text: string): FoundryCalendarDay | null {}

// No
/**
 * This function is a simple and robust helper that parses a calendar day.
 * @param text The text.
 * @returns The calendar day.
 */
export function parseCalendarDay(text: string): FoundryCalendarDay | null {}
```

Checked by: ESLint `eslint-plugin-jsdoc` in `projects/`: JSDoc required on everything exported (functions, classes, interfaces, types, constants, and the public methods and properties of exported classes; not on `private` or `protected` members), a function description that starts with a verb ending in "s" and not with "This", "A" or "Helper" (`match-description`), no types in tags (`no-types`), no tag that only repeats its name (`informative-docs`), `@param` names that exist, descriptions in `@param` and `@returns`, `@throws` when the body throws (`require-throws`) and a one-line `@example`. `tools/lint/check-text.ts` rejects the sales words and the filler openings in any JSDoc line. Review: the number of sentences, that nothing repeats the types, `@throws` for errors thrown by the functions it calls, whether an `@example` is needed, English and other filler that the lists do not catch.

### 3. No process references

No work blocks, decision numbers, review codes or paths to internal notes. Write the reason in words; the reference goes in the pull request.

```ts
// Yes
// V8 coverage only works in Chromium.

// No
// V8 coverage only works in Chromium (PF-INF3, decision 32).
```

Tests describe behavior. Their titles carry no review codes, not even short ones like `R2` or `U17`: the mapping from a finding to its test lives outside the repository.

```ts
// Yes
it('returns the first instant of a day without midnight', () => {});

// No
it('U17: parseDate in Santiago', () => {});
```

Checked by: `tools/lint/check-text.ts`, on every line and on the titles of `describe`, `it` and `test` (read with the TypeScript parser). It looks for anything shaped like a code (capitals and digits joined by hyphens, or one to four capitals followed by one to three digits) and for decision numbers. Names that look like a code are listed as exceptions in `tools/lint/constants/review-code.constant.ts` (`UTF-8`, `ISO-8601`, `ES2022`, `V8`, `F2`...): add one there when a real name is rejected.

### 4. Only characters you can type

No typographic arrows, ellipses, middle dots, multiplication signs, check marks, long dashes, curly quotes or emoji in code, comments, test names, job names or READMEs. Accented letters in proper names and the copyright sign are fine. Angular's `ɵ` prefix and the text literals of spec files are exceptions (see Exceptions).

The code of the libraries (`projects/`, spec files aside) only takes ASCII characters: anything else is written as an escape, `'\u2026'` and not `'…'`, `'\u00a0'` and not a pasted no-break space.

```yaml
# Yes
name: Unit - Angular 21 - Node 22
```

Checked by: `tools/lint/check-text.ts`; in the code of the libraries, any character that is not plain ASCII.

### 5. Class sections

Members are grouped under `//` markers, in this order, skipping the empty ones: `// INJECTORS`, `// DATA BINDING` (inputs and outputs), `// CONTROL VARIABLES`, `// LIFECYCLE HOOKS`, `// ACTIONS`, `// HANDLERS`, `// GETTERS & SETTERS`, `// VALIDATIONS`, `// AUXILIARY FUNCTIONS`. No blank line between the members of a section; one blank line between sections.

```ts
// Yes
// ACTIONS
remove(key: string): void {}
clear(): void {}
```

`computed()` and `linkedSignal()` go in `// CONTROL VARIABLES`; `effect()` goes in `// LIFECYCLE HOOKS`.

An Angular lifecycle hook (`ngOnInit`, `ngOnChanges`, `ngOnDestroy`...) runs no code of its own: it only calls methods of the class, and each method goes in the section that fits what it does.

```ts
// LIFECYCLE HOOKS
ngOnInit(): void {
  this.loadItems();
}

// ACTIONS
private loadItems(): void {
  this.itemsSE
    .load()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((items) => this.items.set(items));
}
```

Never `/** ACTIONS */`: a `/** */` comment becomes the documentation of the next member in the published `.d.ts`.

Checked by: `tools/lint/check-text.ts` rejects `/** UPPERCASE */`; ESLint `no-restricted-syntax` rejects any statement of a lifecycle hook that is not a `this.method()` call. Order, the section of each method and blank lines: review.

### 6. Explicit types

On variables, properties, parameters and return types. Every named function and method declares its return type, `void` included. Callbacks declare neither: the function that receives them already sets their types. Arrays are written `Array<T>` and `ReadonlyArray<T>`.

```ts
// Yes
function clear(): void {}
const names: Array<string> = rows.map((row) => row.name.trim());

// No
function clear() {}
const names = rows.map((row: Row): string => row.name.trim());
```

A closed list is written the other way round: the constant ends in `as const`, without a type, and its type is derived from it in `types/`, so the values are written once.

```ts
// constants/audit-severities.constant.ts
export const AUDIT_SEVERITIES = ['critical', 'high', 'moderate', 'low', 'info'] as const;

// types/audit-severity.type.ts
export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];
```

Object shapes are interfaces. `type` is only for unions and computed types (mapped, conditional, `typeof`, indexed access).

```ts
// Yes
export interface Point {
  readonly x: number;
}
export type Shape = Circle | Square;

// No
export type Point = { readonly x: number };
```

"No value" is `null`. `undefined` is only what the language or an API gives (an optional property, `array[0]`, `find()`): it is compared, or turned into `null` with `?? null`, but never written as a value or returned by our own functions. The public API of the libraries and the spec files are exceptions (see Exceptions).

```ts
// Yes
function findItem(id: string): Item | null {
  return items.find((item) => item.id === id) ?? null;
}

// No
function findItem(id: string): Item | undefined {
  return undefined;
}
```

Checked by: ESLint `@typescript-eslint/typedef`, `explicit-function-return-type`, `array-type`, `consistent-generic-constructors` and `consistent-type-definitions`; `no-restricted-syntax` rejects `undefined` written as a value (outside a comparison) and in the return type of a function, a method or a function type; in `constants/`, `no-restricted-syntax` accepts a constant without a type only when it ends in `as const`.

### 7. Names

Long and descriptive. No single letters and no abbreviations (`acc`, `err`, `idx`, `arr`, `obj`, `val`, `res`, `cb`, `fn`, `tmp`, `el`), not even in callbacks or loops. Injected services end in `SE`. Public API takes the `Foundry` prefix, except the pure functions of Utils.

```ts
// Yes
private readonly foundryHttpClientSE: FoundryHttpClient = inject(FoundryHttpClient);
names.reduce((total, name) => total + name.length, 0);

// No
names.reduce((acc, n) => acc + n.length, 0);
```

Booleans start with `is`, `has` or `can` (`IS_`, `HAS_` or `CAN_` in a constant), also boolean signals. Observables end in `Observable`, never in `$`.

```ts
// Yes
readonly isOpen: WritableSignal<boolean> = signal(false);
const hasError: boolean = errors.length > 0;
const itemsObservable: Observable<Array<Item>> = this.itemsSE.load();

// No
readonly open: WritableSignal<boolean> = signal(false);
const items$: Observable<Array<Item>> = this.itemsSE.load();
```

A Subject ends in `Subject` and is always private; it is exposed with `asObservable()` as `xObservable`.

```ts
// Yes
private readonly itemsSubject: BehaviorSubject<Array<Item>> = new BehaviorSubject<Array<Item>>([]);
readonly itemsObservable: Observable<Array<Item>> = this.itemsSubject.asObservable();

// No
readonly items: BehaviorSubject<Array<Item>> = new BehaviorSubject<Array<Item>>([]);
```

The public names of the libraries and the names that an outside format fixes are exceptions (see Exceptions).

Checked by: ESLint `id-length` and `id-denylist`; `no-restricted-syntax` on the name of every variable, parameter and property declared as `boolean`, `boolean | null`, `Signal<boolean>`, `WritableSignal<boolean>`, `Observable<T>` or a Subject, and on any name that ends in `$`. A Subject property that is not private is rejected everywhere, also in the public API. The `SE` suffix: review.

### 8. Early returns

On one line without braces when it fits; braces when the body takes more than one line.

```ts
// Yes
if (!item) return null;
```

Checked by: ESLint `curly` (`multi-line`).

### 9. Error and console messages

`[who]: lowercase sentence without a final period`, in English. `who` is the package or the script.

```ts
// Yes
throw new Error('[strip-tslib]: unknown package folder "foundry-x"');
```

Checked by: ESLint `no-restricted-syntax`, on string literals and on the start of template literals.

### 10. Imports

In groups, in this order: side-effect imports, Node built-ins, packages, `@antoniocorraliza`, relative paths. Alphabetical inside each group. No blank lines between the groups.

```ts
// Yes
import { readFileSync } from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import type { Plugin } from 'vitest/config';

// No
import { readFileSync } from 'node:fs';

import angular from '@analogjs/vite-plugin-angular';
```

Types are imported with `import type`: Node runs the tools without compiling them and fails on a type imported as a value.

Checked by: ESLint `simple-import-sort` and `@typescript-eslint/consistent-type-imports`.

### 11. READMEs

What it is (one line), status, install, usage, compatibility and license. No emoji, no list items that start in bold and no sales words ("seamless", "robust", "comprehensive", "powerful", "enterprise", "leverage"). What has not been tested is said ("Not tested with Spring"). Only the license badge until 2.0.0 is released.

Checked by: `tools/lint/check-text.ts` for the words, emoji and bold list items; the rest, review.

### 12. Function signatures on one line

Name, parameters and return type of a function or method go on one line. When they do not fit in 140 columns, the parameters become a named type.

```ts
// Yes
export interface BrowserProjectOptions extends ProjectOptions {
  readonly isAngular: boolean;
  readonly timeZones?: ReadonlyArray<string>;
}

export function browserProjects(options: BrowserProjectOptions): Array<TestProjectInlineConfiguration> {}

// No
export function browserProjects(
  options: ProjectOptions & { readonly isAngular: boolean; readonly timeZones?: ReadonlyArray<string> },
): Array<TestProjectInlineConfiguration> {}
```

The public API of the libraries is an exception (see Exceptions); private and protected members are internal code and keep the rule.

Checked by: Prettier joins a signature that fits; `tools/lint/check-text.ts` rejects one split over several lines.

### 13. Folder structure: definitions apart from the code

Each piece of a library (an entry point) and each folder of `tools/` splits its files by kind into folders. Interfaces, types, constants and Angular tokens are not declared next to the logic: they live in their own files and the code imports them. Tests sit next to the file they test, with `.spec` before the extension.

| Folder          | Holds                                                  | Suffix                                                |
| :-------------- | :----------------------------------------------------- | :---------------------------------------------------- |
| `interfaces/`   | interfaces                                             | `.interface.ts`                                       |
| `types/`        | types (`type`)                                         | `.type.ts`                                            |
| `constants/`    | constants and enums                                    | `.constant.ts`, `.enum.ts`                            |
| `tokens/`       | `InjectionToken` and `HttpContextToken`                | `.token.ts`                                           |
| `services/`     | services                                               | `.service.ts`                                         |
| `interceptors/` | functional interceptors                                | `.interceptor.ts`                                     |
| `guards/`       | functional guards                                      | `.guard.ts`                                           |
| `resolvers/`    | functional resolvers                                   | `.resolver.ts`                                        |
| `providers/`    | `provideFoundry...` functions                          | `.provider.ts`                                        |
| `functions/`    | one public function per file, with its private helpers | `.function.ts`                                        |
| `components/`   | one folder per component                               | `.component.ts`, `.component.html`, `.component.scss` |
| `directives/`   | directives                                             | `.directive.ts`                                       |
| `errors/`       | error classes, one per file                            | `.error.ts`                                           |
| `pipes/`        | pipes                                                  | `.pipe.ts`                                            |

A piece only has the folders it needs. For example, a piece of a library:

```
projects/antoniocorraliza/foundry-core/storage/
  ng-package.json
  src/public-api.ts
  src/functions/define-foundry-storage-key.function.ts
  src/functions/define-foundry-storage-key.function.spec.ts
  src/interfaces/foundry-storage-backend.interface.ts
  src/interfaces/foundry-storage-key.interface.ts
  src/types/foundry-storage-area.type.ts
  src/providers/foundry-storage.provider.ts
  src/services/foundry-storage.service.ts
  src/services/foundry-storage.service.spec.ts
  src/tokens/foundry-storage-options.token.ts
```

A piece with an error class keeps it in `errors/`, like the HTTP client of Core: `src/errors/foundry-api.error.ts`.

An error class always assigns its `name` as a literal, because that value is what survives minification, and declares it with the literal type. A class with subclasses and the JSDoc of that `name` are exceptions (see Exceptions).

```ts
// errors/foundry-csv-parse.error.ts
export class FoundryCsvParseError extends FoundryUtilsError {
  override readonly name: 'FoundryCsvParseError' = 'FoundryCsvParseError';
}
```

In `tools/`, the scripts that Node runs stay at the root of their folder, with a `main()` function; their definitions go in `constants/`, `interfaces/` and `types/`, and the logic that can be tested without the file system goes in `functions/`:

```
tools/vitest/
  projects.ts
  constants/angular-optimized-dependencies.constant.ts
  constants/paths.constant.ts
  constants/test-browsers.constant.ts
  interfaces/angular-node-project-options.interface.ts
  interfaces/browser-project-options.interface.ts
  interfaces/project-options.interface.ts
  interfaces/test-environment.interface.ts
  interfaces/typescript-node-project-options.interface.ts
  types/change-detection.type.ts
  types/test-browser.type.ts
```

More rules of the structure:

- No values computed when a module loads: what depends on the environment or a file is read once, in `main()` or in the function that the tool calls first (`readTestEnvironment()`), and passed on as a parameter.
- Functional interceptors, guards and resolvers are constants with the type that Angular expects (see Exceptions).
- Every object type written inline (`{ ... }`) becomes a named interface: in signatures, in annotations and inside other interfaces (`readonly repository?: PackageRepository`, not `{ readonly url?: string }`). Common generics (`Record`, `Partial`, `Readonly`, `ReadonlyArray`...) are fine.
- The public API of the libraries and the spec files are exceptions (see Exceptions).

```ts
// Yes: interfaces/project-options.interface.ts
export interface ProjectOptions {
  readonly name: string;
}

// No: an interface declared in projects.ts, next to the functions that use it
```

Checked by: ESLint `no-restricted-syntax`, with different rules for code files and for `interfaces/`, `types/`, `constants/`, `tokens/` and `errors/` (only classes that extend an error, one per file with `max-classes-per-file`; an error class anywhere else is rejected), and an error on any inline object type; `tools/lint/check-text.ts` checks that each file has the suffix of its folder.

### 14. Commits and pull requests

Conventional Commits in English. Title of 72 characters at most, lowercase and without a final period. A body of 2 to 4 lines only when the reason is not obvious. Scopes: `workspace`, `packages`, `ci`, `utils`, `core`, `ui`, `deps`, or none. No `Co-Authored-By` or other attribution lines. The pull request title follows the same rule, because it becomes the squash commit.

```text
Yes: chore(ci): pin npm 11.21.3 in every job
No:  Update CI workflows to improve reliability
```

Checked by: `tools/ci/check-commits.ts`, on the commits of the branch (fast level) and on the pull request title (`pr-title.yml`).

### 15. Functions, loops and private members

Top-level functions are declared with `function`, not kept in constants; functional interceptors, guards and resolvers are an exception (see Exceptions). Functions inside other functions can be arrows.

```ts
// Yes
export function loadItems(): Array<Item> {}

// No
export const loadItems = (): Array<Item> => [];
```

Lists are walked with array methods (`forEach`, `map`, `filter`, `reduce`...). A `for...of` loop only when an array method does not fit: to `await` inside it or to stop early (`break`, `return`).

```ts
// Yes
items.forEach((item) => console.log(item));
for (const file of files) await upload(file);

// No
for (const item of items) console.log(item);
```

Private members use the TypeScript `private` modifier, not `#`.

```ts
// Yes
private readonly items: Array<Item> = [];

// No
readonly #items: Array<Item> = [];
```

Checked by: ESLint `no-restricted-syntax` (top-level constants whose value is a function; `for...of`, `for` and `for...in` loops without `await`, `break` or `return` inside; any `#` name). A `return` or `break` inside a nested callback also lets a loop through: review.

### 16. Angular

These rules are for the Angular code of the libraries (`projects/`). The public API, the spec files and the size probes of `tools/size/app/` are exceptions (see Exceptions).

Classes:

- Dependencies come from `inject()` in properties, under `// INJECTORS`; never from constructor parameters.
- What only the template uses is `protected`.
- Each file ends in its kind: `.component.ts`, `.directive.ts`, `.service.ts`, `.pipe.ts` (rule 13).
- Inputs and outputs are declared with `input()`, `model()` and `output()`, never with decorators or `outputFromObservable()`.
- An output is named after what happened (`selectionChange`, `closed`), without `on`.
- An event handler of the template starts with `on` (`onSave`) and goes in `// HANDLERS`.
- Events, classes and attributes of the host element go in the `host` property of the decorator. Angular keeps `@HostListener` and `@HostBinding` only for backwards compatibility. Listeners that must not run change detection are an exception (see Exceptions).

```ts
// Yes
@Component({
  selector: 'foundry-panel',
  templateUrl: './foundry-panel.component.html',
  styleUrl: './foundry-panel.component.scss',
  host: { '[class.isOpen]': 'isOpen()', '(keydown.escape)': 'onEscape()' },
})
export class FoundryPanelComponent {
  // INJECTORS
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  // DATA BINDING
  readonly closed: OutputEmitterRef<void> = output();

  // CONTROL VARIABLES
  protected readonly isOpen: WritableSignal<boolean> = signal(false);

  // HANDLERS
  protected onEscape(): void {
    this.closed.emit();
  }
}

// No
@Component({ selector: 'foundry-panel', template: '<ng-content />' })
export class FoundryPanelComponent {
  constructor(private readonly destroyRef: DestroyRef) {}
  @Output() onClose: EventEmitter<void> = new EventEmitter();
  @HostBinding('class.isOpen') isOpen: boolean = false;
  @HostListener('keydown.escape') escape(): void {}
}
```

Data and subscriptions:

- To have the data of an Observable as a signal, `toSignal()`, in components and in services. It cleans up by itself.
- To do something with an Observable (save, delete, send, react), `subscribe()` inside a named method, with `takeUntilDestroyed(this.destroyRef)` when the Observable does not complete by itself.
- A service does not call `subscribe()`: it returns the Observable, or exposes its state with `toSignal()`. The session of Core is an exception (see Exceptions).
- No `async` pipe in the templates.
- What is not an Observable (a DOM listener, a timer) is cleaned up with `this.destroyRef.onDestroy(...)`.
- The errors of an Observable are handled with `catchError` inside `pipe()`, not with an error callback in `subscribe()`.

```ts
// Yes
// CONTROL VARIABLES
protected readonly items: Signal<Array<Item>> = toSignal(this.itemsSE.load(), { initialValue: [] });

// HANDLERS
protected onSave(item: Item): void {
  this.itemsSE
    .save(item)
    .pipe(catchError(() => of(null)))
    .subscribe((saved) => this.lastSaved.set(saved));
}

// No
this.itemsSE.changes().pipe(takeUntil(this.destroyed)).subscribe({ next: (items) => this.items.set(items), error: () => this.items.set([]) });
```

Templates and styles:

- The template and the styles live in their own files (`templateUrl`, `styleUrl`), never inline.
- Only the built-in control flow: `@if`, `@for`, `@switch`. Never `*ngIf` or `*ngFor`.
- Short expressions are fine in the template (`count.set(count() + 1)`).
- Dynamic classes and styles are bound with `[class.name]` and `[style.property]`, or with the object form (`[class]="{ isOpen: isOpen() }"`). Never `ngClass` or `ngStyle`.
- CSS classes: the class of the element plus state classes, all in camelCase (`.option.isSelected`). The public classes of the global style sheets of UI are an exception (see Exceptions).

```html
<!-- Yes -->
<li class="option" [class.isSelected]="isSelected(item)" (click)="onSelect(item)">{{ item.label }}</li>

<!-- No -->
<li class="option" [ngClass]="{ 'option--selected': isSelected(item) }" *ngIf="items$ | async">{{ item.label }}</li>
```

Checked by: ESLint in `projects/`: `@angular-eslint/prefer-inject`, `no-output-on-prefix`, `prefer-host-metadata-property`, `component-max-inline-declarations` (no inline template or styles), `consistent-component-styles` (`styleUrl`), `template/prefer-control-flow`, and `no-restricted-syntax` (`@Input()`, `@Output()` and `outputFromObservable()`; `subscribe()` in a `.service.ts`; `takeUntil()` and `takeUntilDestroyed()` without the `DestroyRef`; an error callback in `subscribe()`). `tools/lint/check-text.ts`: a class with `@Component`, `@Directive`, `@Injectable` or `@Pipe` in a file without its suffix (in the whole repository); `ngClass`, `ngStyle` and the `async` pipe in the templates of `projects/`; CSS classes that are not camelCase in templates (`class="..."` and `[class.name]`) and in the style sheets of the components. Review: the `// INJECTORS` and `// HANDLERS` sections, `protected` for what only the template uses, the `on` prefix of the handlers, the subscription inside a named method, `takeUntilDestroyed` when the Observable does not complete, `DestroyRef.onDestroy` for what is not an Observable, the element class plus state classes, and the keys of `[class]="{ ... }"`.

## Exceptions

Every rule above applies everywhere except in these cases. Each one says why, and what checks it.

### The public API of the libraries

What a library exports is written as its approved design fixes it: names (`disabled`, `required`, `events`, `outcome`), inline object types in signatures, typed constants instead of `as const` lists, signatures split by Prettier when they do not fit, and `undefined` where the design uses it. The public classes of the global style sheets of UI (`styles/`, such as `foundry-visually-hidden`) are public API too. Why: changing them would change the published `.d.ts` or CSS that the designs have frozen.

```ts
export function parseDate(text: unknown, options?: { readonly format?: FoundryDateFormat }): Date | null {}
readonly disabled: InputSignal<boolean> = input(false);
```

Checked by: ESLint and `tools/lint/check-text.ts` skip the exported declarations of `projects/`, but still check their function bodies and their private and protected members. Something exported only for another internal file, or exported with a separate `export { x }`, is seen as public: review.

### Functional interceptors, guards and resolvers

They stay as a constant with the type that Angular expects, not as a `function`. Why: the type checks the signature, and the `.d.ts` stays as the design writes it.

```ts
export const foundrySessionInterceptor: HttpInterceptorFn = (request, next) => next(request);
```

Checked by: ESLint accepts a top-level constant whose value is a function only when its type ends in `Fn`.

### Listeners that must not run change detection

When a design requires that an event runs no change detection (the tooltip of UI), the listener is added with `addEventListener` outside Angular's zone instead of in `host`, and removed with `DestroyRef.onDestroy`. Why: a `host` listener runs change detection on every event.

```ts
this.ngZone.runOutsideAngular(() => this.host.addEventListener('pointerenter', this.show));
this.destroyRef.onDestroy(() => this.host.removeEventListener('pointerenter', this.show));
```

Checked by: review.

### The session of Core

The session service keeps the subscription of the shared refresh alive on purpose (`shareReplay` with `refCount: false`), so it calls `subscribe()` in a service. Why: if the refresh were cancelled when every request stops waiting, the server would have rotated the token and the browser would keep a spent one.

```ts
// eslint-disable-next-line no-restricted-syntax -- the refresh must finish even when no request waits for it
this.refreshObservable.subscribe();
```

Checked by: ESLint rejects `subscribe()` in a `.service.ts` unless an `eslint-disable-next-line` gives the reason; the review checks that it is this case.

### Angular's private prefix

`ɵ` is allowed at the start of a name (exported but private, the Angular convention), and nowhere else.

```ts
export function ɵforEachOwnKey(): void {}
```

Checked by: `tools/lint/check-text.ts`.

### Spec files

Spec files are test code, read next to what they test:

- their text literals are test data and take any character (`'Nuñez'`, `'🍎🍌🍒'`, `'١٢٣'`, `'日本語'`); test titles and the rest of the code do not;
- their data, fixture components and inline templates stay in the spec, outside the folder structure;
- they use `undefined`, because they compare what the code returns;
- the Angular rules do not apply to their fixtures.

```ts
@Component({ selector: 'foundry-host', template: '<foundry-panel />' })
class HostComponent {}
```

Checked by: ESLint and `tools/lint/check-text.ts` skip these rules in `*.spec.ts` and `.d.ts` files.

### Error classes

An error class with subclasses declares its `name` as `string`, because a literal type would stop the subclasses from declaring their own; its value is still the literal. The `name` of the classes in `errors/` takes no JSDoc: its literal already says everything.

```ts
// errors/foundry-utils.error.ts: it has subclasses
export class FoundryUtilsError extends Error {
  override readonly name: string = 'FoundryUtilsError';
}
```

Checked by: ESLint (`prefer-as-const` off and `jsdoc/require-jsdoc` skips `override readonly name`, only in `errors/`).

### Names fixed by an outside format

A field whose name comes from a format we do not own keeps it, with an `eslint-disable-next-line` that says so.

```ts
// eslint-disable-next-line no-restricted-syntax -- npm names this field in package.json
readonly optional?: boolean;
```

Checked by: the directive and its reason; the review checks the format.

### The size probes

The components in `tools/size/app/` stand for an application, with its inline template and `NgClass`, and the Angular rules do not check them. Why: they are the base that every size is measured against; changing them moves every measurement.

Checked by: the Angular rules of ESLint only cover `projects/`.
