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

No typographic arrows, ellipses, middle dots, multiplication signs, check marks, long dashes, curly quotes or emoji in code, comments, test names, job names or READMEs. Accented letters in proper names and the copyright sign are fine. Angular's `ɵ` prefix (exported but private) is allowed at the start of a name, and nowhere else.

The code of the libraries (`projects/`, spec files aside) only takes ASCII characters, apart from `ɵ` at the start of a name: anything else is written as an escape, `'\u2026'` and not `'…'`, `'\u00a0'` and not a pasted no-break space. The text literals of spec files are test data and take any character (`'Nuñez'`, `'🍎🍌🍒'`, `'١٢٣'`, `'日本語'`); test titles and the rest of the code do not.

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

Never `/** ACTIONS */`: a `/** */` comment becomes the documentation of the next member in the published `.d.ts`.

Checked by: `tools/lint/check-text.ts` rejects `/** UPPERCASE */`. Order and blank lines: review.

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

A closed list is the one exception: the constant ends in `as const`, without a type, and its type is derived from it in `types/`, so the values are written once.

```ts
// constants/audit-severities.constant.ts
export const AUDIT_SEVERITIES = ['critical', 'high', 'moderate', 'low', 'info'] as const;

// types/audit-severity.type.ts
export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];
```

Checked by: ESLint `@typescript-eslint/typedef`, `explicit-function-return-type`, `array-type` and `consistent-generic-constructors`; in `constants/`, `no-restricted-syntax` accepts a constant without a type only when it ends in `as const`.

### 7. Names

Long and descriptive. No single letters and no abbreviations (`acc`, `err`, `idx`, `arr`, `obj`, `val`, `res`, `cb`, `fn`, `tmp`, `el`), not even in callbacks or loops. Injected services end in `SE`. Public API takes the `Foundry` prefix, except the pure functions of Utils.

```ts
// Yes
private readonly foundryHttpClientSE: FoundryHttpClient = inject(FoundryHttpClient);
names.reduce((total, name) => total + name.length, 0);

// No
names.reduce((acc, n) => acc + n.length, 0);
```

Checked by: ESLint `id-length` and `id-denylist`. The `SE` suffix: review.

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
  readonly angular: boolean;
  readonly timeZones?: ReadonlyArray<string>;
}

export function browserProjects(options: BrowserProjectOptions): Array<TestProjectInlineConfiguration> {}

// No
export function browserProjects(
  options: ProjectOptions & { readonly angular: boolean; readonly timeZones?: ReadonlyArray<string> },
): Array<TestProjectInlineConfiguration> {}
```

The public API of the libraries is the exception: an exported function, an exported arrow constant and the non-private members of an exported class keep the signature that their design fixes, so when it does not fit, it is split as Prettier writes it. Internal code and `tools/` keep the rule.

Checked by: Prettier joins a signature that fits; `tools/lint/check-text.ts` rejects one split over several lines, except in the exported declarations of `projects/` (not in their function bodies or private members).

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

An error class always assigns its `name` as a literal, because that value is what survives minification. A class without subclasses also declares it with the literal type; a class with subclasses declares it as `string`, because a literal type there would stop the subclasses from declaring their own.

```ts
// errors/foundry-utils.error.ts: it has subclasses
export class FoundryUtilsError extends Error {
  override readonly name: string = 'FoundryUtilsError';
}

// errors/foundry-csv-parse.error.ts: no subclasses
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
- Functional interceptors, guards and resolvers keep the type that Angular expects: `export const foundrySessionInterceptor: HttpInterceptorFn = (request, next) => ...`. A top-level constant whose value is a function is code, not a definition.
- Every object type written inline (`{ ... }`) becomes a named interface: in signatures, in annotations and inside other interfaces (`readonly repository?: PackageRepository`, not `{ readonly url?: string }`). Common generics (`Record`, `Partial`, `Readonly`, `ReadonlyArray`...) are fine.
- What a library exports (signatures, interfaces, types and constants of its public API) is written as its design fixes it, inline object types and typed constants included: the named object types of this rule and the `as const` lists of rule 6 are for the internal code of the libraries and for `tools/`. ESLint does not ask for names in exported declarations of `projects/`, except inside function bodies and in private members.
- Tests are exempt: the data and the fixture components of a test stay in its spec, where they are read.

```ts
// Yes: interfaces/project-options.interface.ts
export interface ProjectOptions {
  readonly name: string;
}

// No: an interface declared in projects.ts, next to the functions that use it
```

Checked by: ESLint `no-restricted-syntax`, with different rules for code files and for `interfaces/`, `types/`, `constants/`, `tokens/` and `errors/` (only classes that extend an error, one per file with `max-classes-per-file`; an error class anywhere else is rejected), and an error on any inline object type; `tools/lint/check-text.ts` checks that each file has the suffix of its folder. Spec and `.d.ts` files are exempt.

### 14. Commits and pull requests

Conventional Commits in English. Title of 72 characters at most, lowercase and without a final period. A body of 2 to 4 lines only when the reason is not obvious. Scopes: `workspace`, `packages`, `ci`, `utils`, `core`, `ui`, `deps`, or none. No `Co-Authored-By` or other attribution lines. The pull request title follows the same rule, because it becomes the squash commit.

```text
Yes: chore(ci): pin npm 11.21.3 in every job
No:  Update CI workflows to improve reliability
```

Checked by: `tools/ci/check-commits.ts`, on the commits of the branch (fast level) and on the pull request title (`pr-title.yml`).
