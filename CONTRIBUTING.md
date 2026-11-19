# Contributing

## Before opening a pull request

Use the Node version in `.nvmrc`, with npm 11.16 or later: older versions ignore `allowScripts` and run every install script.

```bash
npm ci
npm run lint             # ESLint, Prettier, text rules and type-check
npm test
npm run build
npm run check:packages
```

`npm run format` fixes the formatting. CI runs the same checks: see `tools/ci/README.md`.

## Style guide

It applies to the whole repository: libraries, `tools/`, `.github/`, configuration and READMEs. Each rule says what checks it: a tool inside `npm run lint` (fast CI level) or the pull request review.

### 1. Formatting

Prettier: 140 columns, single quotes, semicolons, trailing commas and a final newline. Lockfiles are not formatted. A decorator goes right above the class or member it decorates, without a blank line in between: Prettier removes it.

Checked by: `prettier --check`.

### 2. Comments explain why, not what

No file headers, no comments that repeat the code and no history of how something was reached. In English.

The public API of the libraries is documented with JSDoc, also in English. That is documentation for the users of the package, not a comment, and it is required.

```ts
// Yes
// ng-packagr 21 adds tslib to dependencies even when nothing imports it.

// No
// TestBed on Node (jsdom) without zone.js.
```

Checked by: review.

### 3. No process references

No work blocks, decision numbers, review codes or paths to internal notes. Write the reason in words; the reference goes in the pull request.

```ts
// Yes
// V8 coverage only works in Chromium.

// No
// V8 coverage only works in Chromium (PF-INF3, decision 32).
```

Tests describe behaviour. Their titles carry no review codes, not even short ones like `R2` or `U17`: the mapping from a finding to its test lives outside the repository.

```ts
// Yes
it('returns the first instant of a day without midnight', () => {});

// No
it('U17: parseDate in Santiago', () => {});
```

Checked by: `tools/lint/check-text.ts`, which also reads the titles of `describe`, `it` and `test` with the TypeScript parser.

### 4. Only characters you can type

No typographic arrows, ellipses, middle dots, multiplication signs, check marks, long dashes, curly quotes or emoji in code, comments, test names, job names or READMEs. Accented letters in proper names and the copyright sign are fine.

```yaml
# Yes
name: Unit - Angular 21 - Node 22
```

Checked by: `tools/lint/check-text.ts`.

### 5. Class sections

Members are grouped under `//` markers, in this order, skipping the empty ones: `// INJECTORS`, `// DATA BINDING` (inputs and outputs), `// CONTROL VARIABLES`, `// LIFECYCLE HOOKS`, `// ACTIONS`, `// HANDLERS`, `// GETTERS & SETTERS`, `// VALIDATIONS`, `// AUXILIARY FUNCTIONS`. No blank line between the members of a section; one blank line between sections.

```ts
// Yes
// ACTIONS
remove(key: string): void {}
clear(): void {}
```

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

Checked by: ESLint `@typescript-eslint/typedef`, `explicit-function-return-type`, `array-type` and `consistent-generic-constructors`.

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

Checked by: ESLint `no-restricted-syntax` for string literals; template literals: review.

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

Checked by: Prettier joins a signature that fits; `tools/lint/check-text.ts` rejects one split over several lines.

### 13. Folder structure: definitions apart from the code

Each piece of a library (an entry point) and each folder of `tools/` splits its files by kind into folders. Interfaces, types, constants and Angular tokens are not declared next to the logic: they live in their own files and the code imports them. Tests sit next to the file they test, with `.spec` before the extension.

| Folder          | Holds                                                  | Suffix                                                |
| :-------------- | :----------------------------------------------------- | :---------------------------------------------------- |
| `interfaces/`   | interfaces and types                                   | `.interface.ts`, `.type.ts`                           |
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
| `pipes/`        | pipes                                                  | `.pipe.ts`                                            |

A piece only has the folders it needs. Examples:

```
projects/antoniocorraliza/foundry-core/storage/
  ng-package.json
  src/public-api.ts
  src/functions/define-foundry-storage-key.function.ts
  src/functions/define-foundry-storage-key.function.spec.ts
  src/functions/create-foundry-memory-storage-backend.function.ts
  src/interfaces/foundry-storage-area.type.ts
  src/interfaces/foundry-storage-backend.interface.ts
  src/interfaces/foundry-storage-key.interface.ts
  src/providers/foundry-storage.provider.ts
  src/services/foundry-storage.service.ts
  src/services/foundry-storage.service.spec.ts
  src/tokens/foundry-storage-options.token.ts
```

A piece with an interceptor adds, for example, `src/interceptors/foundry-session.interceptor.ts` and its spec.

```
projects/antoniocorraliza/foundry-ui/select/
  ng-package.json
  src/public-api.ts
  src/components/foundry-select/foundry-select.component.ts
  src/components/foundry-select/foundry-select.component.html
  src/components/foundry-select/foundry-select.component.scss
  src/components/foundry-select/foundry-select.component.spec.ts
  src/constants/foundry-select-defaults.constant.ts
  src/directives/foundry-select-value.directive.ts
  src/directives/foundry-select-value.directive.spec.ts
  src/interfaces/foundry-select-value-context.interface.ts
  src/services/foundry-select-panel.service.ts
  src/tokens/foundry-select-labels.token.ts
```

```
projects/antoniocorraliza/foundry-utils/date/
  ng-package.json
  src/public-api.ts
  src/constants/date-limits.constant.ts
  src/functions/add-calendar-days.function.ts
  src/functions/add-calendar-days.function.spec.ts
  src/functions/parse-date.function.ts
  src/functions/parse-date.function.spec.ts
  src/interfaces/foundry-calendar-day.type.ts
  src/interfaces/foundry-calendar-day-range.interface.ts
```

In `tools/`, the scripts that Node runs stay at the root of their folder, with a `main()` function, and their definitions go in `constants/` and `interfaces/`:

```
tools/vitest/
  projects.ts
  constants/angular-optimized-dependencies.constant.ts
  constants/foundry-test-browsers.constant.ts
  constants/paths.constant.ts
  interfaces/angular-node-project-options.interface.ts
  interfaces/browser-project-options.interface.ts
  interfaces/foundry-test-browser.type.ts
  interfaces/project-options.interface.ts
  interfaces/typescript-node-project-options.interface.ts
```

More rules of the structure:

- No values computed when a module loads: what depends on the environment or a file is a function (`isCoverageRun()`), not a top-level constant.
- Functional interceptors, guards and resolvers keep the type that Angular expects: `export const foundrySessionInterceptor: HttpInterceptorFn = (request, next) => ...`. A top-level constant whose value is a function is code, not a definition.
- Types written inside a signature become a named interface (`AngularNodeProjectOptions extends ProjectOptions`).
- Tests are exempt: the data and the fixture components of a test stay in its spec, where they are read.

```ts
// Yes: interfaces/project-options.interface.ts
export interface ProjectOptions {
  readonly name: string;
}

// No: an interface declared in projects.ts, next to the functions that use it
```

Checked by: ESLint `no-restricted-syntax`, with different rules for code files and for `interfaces/`, `constants/` and `tokens/`; `tools/lint/check-text.ts` checks that each file has the suffix of its folder. Spec and `.d.ts` files are exempt.

### 14. Commits and pull requests

Conventional Commits in English. Title of 72 characters at most, lowercase and without a final period. A body of 2 to 4 lines only when the reason is not obvious. Scopes: `workspace`, `packages`, `ci`, `utils`, `core`, `ui`, `deps`, or none. No `Co-Authored-By` or other attribution lines. The pull request title follows the same rule, because it becomes the squash commit.

```text
Yes: chore(ci): pin npm 11.21.3 in every job
No:  Update CI workflows to improve reliability
```

Checked by: `tools/ci/check-commits.ts`, on the commits of the branch (fast level) and on the pull request title (`pr-title.yml`).
