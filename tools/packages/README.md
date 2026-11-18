# Packages: entries, build and tarball checks

## Secondary entry template

Every entry point of a package is a folder with two files (design D1; Core 1.4, Utils 1.4, UI 1.4):

```
projects/antoniocorraliza/<package>/<entry>/
├── ng-package.json
└── src/
    ├── public-api.ts
    └── *.spec.ts          (next to the code)
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

`src/public-api.ts` exports the public API of the entry, and nothing else.

- ng-packagr finds the folder by its `ng-package.json` and builds `@antoniocorraliza/<package>/<entry>`. It also writes the `exports` map of the published `package.json`: never write `exports` by hand for an entry point (only for files that are not entries, such as the UI style sheets).
- The base `tsconfig.json` maps `@antoniocorraliza/<package>/*` to `dist/`, so other packages and the tests see the entry as an app would, once it is built.
- Between packages, import by package name (`@antoniocorraliza/foundry-utils/date`), never with a relative path: a relative path would copy the code into the other package.
- Each package has one empty example entry, created in B2 to prove the template: `foundry-utils/date`, `foundry-core/configuration` and `foundry-ui/icon`. The library blocks fill them in.

## Build order

`npm run build` builds Utils → Core → UI. UI has Utils as a peer (UI-D1): to keep Utils out of the UI bundle, ng-packagr must find Utils already compiled in `dist/`. Core and Utils do not depend on other Foundry packages.

After each `ng build`, `strip-tslib.ts` removes the `tslib` dependency that ng-packagr 21 adds to every built `package.json` when the source manifest does not declare it. The code is compiled with `importHelpers: false`, so it never imports tslib; `check:packages` proves it.

## `npm run check:packages`

Run it after `npm run build`. It packs each package with `npm pack`, unpacks the tarball and checks the rules listed at the top of `check-packages.ts` (exports, license, tslib, any, dependencies, peers, manifest, notices). The expected values (peers, sideEffects, extra exports, notices) are in `packages.ts`: change them there, and only after the decision that changes them.

## Third-party notices

| Package | Material                                              | Notice (inside the tarball) | Required when                            |
| :------ | :---------------------------------------------------- | :-------------------------- | :--------------------------------------- |
| UI      | Fonts Inter and Urbanist (SIL Open Font License)      | `styles/fonts/OFL.txt`      | the tarball has a `styles/fonts/*.woff2` |
| Utils   | Table derived from Unicode CLDR (`getFirstDayOfWeek`) | `UNICODE-LICENSE.txt`       | the source has a file named `*.cldr.ts`  |

Both notices are already copied by the `assets` of each `ng-package.json`: put the file in `projects/antoniocorraliza/foundry-ui/styles/fonts/OFL.txt` or `projects/antoniocorraliza/foundry-utils/UNICODE-LICENSE.txt`. The generated CLDR table must be named `*.cldr.ts` so that the check can see it.

## UI style sheets

`projects/antoniocorraliza/foundry-ui/styles/**/*.css` and `styles/fonts/*.woff2` are copied to the tarball by the `assets` of UI. They are exported as `@antoniocorraliza/foundry-ui/styles/*.css` and listed in `sideEffects`, so that a bundler never drops an imported sheet.

## `moduleResolution: "node10"` (Utils 5.1)

Checked in B2 with the packed Utils and TypeScript 5.5.4, 5.9.3 and 6.0.3: the root entry resolves (through `typings`), the secondary entries do not (TS2307). ng-packagr writes a `package.json` in each entry folder of `dist/`, but its `.npmignore` leaves them out of the tarball ("only needed for development"). TypeScript 6.0 also reports `node10` as deprecated (TS5107). With `bundler`, and with `nodenext` from ESM, everything resolves.
