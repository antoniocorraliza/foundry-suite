# Packages: entries, build and tarball checks

## Secondary entry template

Every entry point of a package is a folder with two files:

```
projects/antoniocorraliza/<package>/<entry>/ng-package.json
projects/antoniocorraliza/<package>/<entry>/src/public-api.ts
projects/antoniocorraliza/<package>/<entry>/src/*.spec.ts      (tests next to the code)
```

`ng-package.json`:

```json
{
  "$schema": "../../../../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

`src/public-api.ts` exports the public API of the entry and nothing else.

- ng-packagr finds the folder by its `ng-package.json`, builds `@antoniocorraliza/<package>/<entry>` and writes the `exports` map of the published `package.json`. Never write `exports` by hand for an entry point; only for files that are not entries, such as the UI style sheets.
- In development, the base `tsconfig.json` maps `@antoniocorraliza/<package>` and `@antoniocorraliza/<package>/*` to the source (`src/public-api.ts`), and the tests resolve them the same way through Vite aliases (`tools/vitest/functions/add-source-aliases.function.ts`), so a change is seen without a build. The build of each package (`tsconfig.lib.prod.json`) maps them to `dist/`, so UI is compiled against the built Utils, as an app would be. `check:packages`, `size` and the consumer apps also work on `dist/`.
- Between packages, import by package name (`@antoniocorraliza/foundry-utils/date`), never with a relative path: a relative path copies the code into the other package.
- Core and UI each keep one empty entry that proves the template: `foundry-core/configuration` and `foundry-ui/icon`.

## Build order

`npm run build` builds Utils, Core and UI, in that order. UI has Utils as a peer dependency: ng-packagr must find Utils already compiled in `dist/` to keep it out of the UI bundle. Core and Utils do not depend on other Foundry packages.

After each `ng build`, `strip-tslib.ts` removes the `tslib` dependency that ng-packagr 21 adds to every built `package.json` whose source manifest does not declare it. The code is compiled with `importHelpers: false`, so it never imports tslib.

## `npm run check:packages`

Run it after `npm run build`. It packs each package with `npm pack`, unpacks the tarball and checks these rules. It exits with code 1 if any of them fails.

| Rule           | What it checks                                                                                                                                                                                                                    |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exports`      | every entry point has an export with `types` (first) and `default` (last), and the files exist; a pattern export (`./styles/*.css`) fails without matching files when `sideEffects` lists CSS and its folder exists in the source |
| `license`      | `LICENSE` is in the tarball, identical to the root one, and `"license"` is `"MIT"`, followed by ` AND <SPDX id>` for each required notice                                                                                         |
| `tslib`        | no file imports tslib and no manifest field declares it                                                                                                                                                                           |
| `any`          | no `any` in the published `.d.ts` files                                                                                                                                                                                           |
| `dependencies` | `dependencies` is empty; no `optionalDependencies` or `bundleDependencies`                                                                                                                                                        |
| `peers`        | the peers in `constants/foundry-packages.constant.ts`, and Foundry peers as `^<version of that package>`                                                                                                                          |
| `manifest`     | `name`, `type`, `engines`, `sideEffects` and `repository`                                                                                                                                                                         |
| `notices`      | the third-party notices are in the tarball when the material they cover is in the package                                                                                                                                         |

The expected values (peers, `sideEffects`, non-entry exports, notices) are in `constants/foundry-packages.constant.ts`: change them there.

## Third-party notices

Third-party material needs its notice inside the tarball and its license in the `"license"` field:

| Package | Material                                              | Notice (inside the tarball) | Required when                                    | License       |
| :------ | :---------------------------------------------------- | :-------------------------- | :----------------------------------------------- | :------------ |
| UI      | Fonts Inter and Urbanist (SIL Open Font License)      | `styles/fonts/OFL.txt`      | the tarball has a `styles/fonts/*.woff2`         | `OFL-1.1`     |
| Utils   | Table derived from Unicode CLDR (`getFirstDayOfWeek`) | `UNICODE-LICENSE.txt`       | the source has a file named `*.cldr.constant.ts` | `Unicode-3.0` |

The `assets` of each `ng-package.json` already copy both notices: put the file in `projects/antoniocorraliza/foundry-ui/styles/fonts/OFL.txt` or `projects/antoniocorraliza/foundry-utils/UNICODE-LICENSE.txt`. The generated CLDR table is a constant, so it goes in `constants/`, and its name must end in `.cldr.constant.ts` (for example `constants/first-day-of-week.cldr.constant.ts`) for the check to see it.

## UI style sheets

UI has no style sheets yet. Its `assets` already copy `projects/antoniocorraliza/foundry-ui/styles/**/*.css` and `styles/fonts/*.woff2` to the tarball, and its manifest already exports them as `@antoniocorraliza/foundry-ui/styles/*.css` and lists them in `sideEffects`, so that a bundler never drops an imported sheet.

## `moduleResolution: "node10"`

Not supported. Checked with the packed Utils and TypeScript 5.5.4, 5.9.3 and 6.0.3: the root entry resolves (through `typings`), the secondary entries do not (TS2307). ng-packagr writes a `package.json` in each entry folder of `dist/`, but its `.npmignore` leaves them out of the tarball. TypeScript 6.0 also reports `node10` as deprecated (TS5107). With `bundler`, and with `nodenext` from ESM, everything resolves.
