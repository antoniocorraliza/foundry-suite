# Size of each entry

`npm run size` measures what each entry of the three packages adds to an app, in production (minified) and gzip, and fails when a measurement is over its budget or differs from the reference saved in the repository. Run it after `npm run build`: it reads the packages from `dist/`.

```bash
npm run build
npm run size              # measure and compare
npm run size:update       # measure and rewrite tools/size/size-reference.json
npm run size:changelog    # entries that grew since origin/main need a changelog line
```

## How each package is measured

| Package   | Tool                   | How                                                                                                                                                                                                                                                                                                                            |
| :-------- | :--------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core, UI  | `angular`              | Production build (`@angular/build:application`, Angular 21) of a small app that already uses the router, `HttpClient`, `@for`, `NgClass` and RxJS (`app/components/size-base-app`); the base for form controls also uses reactive forms (`size-forms-app`). The result is the difference with the same app without the import. |
| Utils     | `esbuild` and `rollup` | Bundle of a file that only imports the measured code, minified with esbuild and with Rollup and Terser, minus the bundle of an empty file.                                                                                                                                                                                     |
| UI styles | `files`                | The published style sheets themselves.                                                                                                                                                                                                                                                                                         |

The import is kept alive with `console.log([...])` in the probe and in the base, so the difference is only what the import brings. A whole entry is imported with `import * as`, which adds a few bytes for the namespace object. Sizes are in bytes in the reference and in kB (1000 bytes) in the report; gzip uses level 6, each output file on its own.

## Budgets: `constants/size-measurements.constant.ts`

The only place with budgets. Each row names what it imports (whole entry or named symbols), its package, its base app and its budget in kB (raw and gzip). The raw budget applies to every tool; the gzip budget applies to `angular`, `esbuild` and `files`, not to `rollup`. A row with `budget: null` is measured and kept in the reference, but has no limit yet.

- A row whose entry is not built yet, or whose symbols are not exported yet, is reported as pending and never fails.
- Every built entry is also measured whole, with no budget, even without a row (`utils/date`, `core (root)`...). A new entry therefore changes the reference.
- Names follow `<package>/<entry>`, `<package> (root)` or `<package>: every entry`, optionally followed by `: <symbols>`. The changelog check reads the package and the entry from the name.

## Reference: `size-reference.json`

The figures of the last accepted build. `npm run size` fails when a measurement grows, shrinks, appears or disappears without updating it: run `npm run size:update` and commit the file with the change that moved the sizes. Generate it with the Node version in `.nvmrc`, like CI: gzip output depends on the zlib that Node ships.

## Changelog line

`npm run size:changelog [base]` (default `origin/main`) compares the reference at the merge base with the current one. For each measurement that existed there and grew, the `CHANGELOG.md` of its package (`projects/antoniocorraliza/<package>/CHANGELOG.md`) must have an added line that names the entry, such as `@antoniocorraliza/foundry-utils/date`; for `every entry`, the package name is enough. New measurements do not need a line. While a package has no `CHANGELOG.md`, nothing is required.

## Error names after minifying

Every public error class declares its `name` as a literal, so that it survives the minifier of the app. For each class in `constants/public-error-classes.constant.ts` that is already exported, `npm run size` bundles `new Class(...).name` with esbuild and with Rollup and Terser, runs it with Node and compares the output with the class name. An exported class whose name matches `Foundry...Error` and is not in that list fails until it is added with the arguments of its constructor.
