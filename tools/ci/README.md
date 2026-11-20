# CI: two levels on GitHub Actions

| Level | Workflow                        | When                                                                                                    | Required check |
| :---- | :------------------------------ | :------------------------------------------------------------------------------------------------------ | :------------- |
| Fast  | `.github/workflows/ci-fast.yml` | Every push to any branch (pull requests included: GitHub reads the check of the head commit)            | `Fast level`   |
| Full  | `.github/workflows/ci-full.yml` | Pull request to `main` (not while it is a draft); every night if `main` changed; by hand before each rc | `Full level`   |

Both use `.github/actions/setup-workspace` (Node, npm, dependencies and browsers). `check-latest` makes `setup-node` install the latest release of each Node line, so the jobs meet the minimums of the matrix (22.22.3 and 24.15). Actions are pinned by commit SHA, with the version in a comment.

## Fast level

Angular 21, Node 24, one job: `npm ci`, commit messages of the branch (`tools/ci/check-commits.ts origin/main..HEAD`), production audit, lint, warm-up, unit tests on Node and Chromium, build, `check:packages`, size of each entry (`npm run size`) and the changelog line of the entries that grew (`npm run size:changelog`).

## Pull request title

`.github/workflows/pr-title.yml` checks the title of every pull request to `main` with `tools/ci/check-commits.ts --title`, because the title becomes the squash commit. It is a separate workflow so that editing the title runs it again without the full level.

## Full level

| Job                                                              | Angular | Node | Browsers                                            | Pull request | Night and rc |
| :--------------------------------------------------------------- | :-----: | :--: | :-------------------------------------------------- | :----------: | :----------: |
| `Unit - Angular 21 - Node 22` (and build and `check:packages`)   |   21    |  22  | none                                                |     yes      |     yes      |
| `Unit - Angular 21 - Node 24 - browsers` (and development audit) |   21    |  24  | Chromium, Firefox, WebKit (in the Playwright image) |     yes      |     yes      |
| `Unit - Angular 22 - Node 22`                                    |   22    |  22  | none                                                |      no      |     yes      |
| `Unit - Angular 22 - Node 24 - browsers`                         |   22    |  24  | Chromium, Firefox, WebKit (in the Playwright image) |      no      |     yes      |
| `Smoke - Node 26` (smoke tests, build and `check:packages`)      |   21    |  26  | none                                                |      no      |     yes      |
| `Smoke - Utils consumers` (Jest and TypeScript matrix)           |   21    |  22  | none                                                |     yes      |     yes      |

Every unit job runs the zone.js and the zoneless projects.

The full product would be 2 Angular versions x 2 change detections x 2 Node versions x 3 browsers = 24 jobs. What is cut and why:

- zone.js and zoneless are Vitest projects of the same run, not jobs: separate jobs would only repeat the setup.
- Browsers run on Node 24 only. The code under test runs inside the browser; Node only serves the files through Vite. Node 22 runs the projects that execute on Node (jsdom and plain TypeScript with time zones).
- Angular 22 unit tests run at night and before each rc, not in pull requests.
- Node 26 only runs the smoke tests, build and `check:packages`.
- The build runs with Angular 21 only: the libraries are compiled with the lowest supported Angular.

## Angular 22

The workspace is Angular 21 (`package.json` and `package-lock.json`). `tools/ci/angular-22/` has a second manifest and lockfile with Angular 22.2.6, `@angular/build` 22.2.7, TypeScript 6.0.3 and the same Vitest, Analog, Vite, Playwright and jsdom versions. It has no lint, build or packaging tools: it only runs tests.

In CI the job runs `npm ci --prefix tools/ci/angular-22` and links `node_modules` to `tools/ci/angular-22/node_modules`, so the workspace resolves Angular 22 and TypeScript 6.0 without touching the development lockfile. `FOUNDRY_EXPECTED_ANGULAR_MAJOR=22` makes the Angular smoke tests fail if the job ran with Angular 21 by mistake.

To run it locally, use a separate worktree, so that your own `node_modules` stays on Angular 21:

```bash
git worktree add ../foundry-ng22 HEAD
cd ../foundry-ng22
npm ci --strict-allow-scripts --prefix tools/ci/angular-22
ln -s tools/ci/angular-22/node_modules node_modules
FOUNDRY_EXPECTED_ANGULAR_MAJOR=22 npm test
cd - && git worktree remove --force ../foundry-ng22
```

To change a version, edit `tools/ci/angular-22/package.json`, run `npm install --prefix tools/ci/angular-22` and commit both files.

## Consumer apps of Utils

Two small apps check Foundry Utils as an app would use it. Each has its own manifest and lockfile, so that their tools stay out of the development lockfile (and the Jest globals never meet the Vitest ones), and both run in the full level only, in the `Smoke - Utils consumers` job.

`node tools/packages/install-utils-tarball.ts <app folder>` packs `dist/antoniocorraliza/foundry-utils` with `npm pack` and unpacks the tarball into the `node_modules` of the app, so the apps test what npm would publish.

| App                       | Script                    | What it checks                                                                                                                                                                                                                                  |
| :------------------------ | :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/jest-smoke/`       | `npm run test:jest`       | Jest 30 with `jest-environment-jsdom` and Babel 7, configured with the Jest recipe of the Utils README                                                                                                                                          |
| `tools/typescript-smoke/` | `npm run test:typescript` | `tsc` 5.5, 6.0 and 7, strict and without `skipLibCheck`: with the DOM types, with `@types/node` only, and a `.cts` file with `nodenext`, which must fail with TS1479 on 5.5 (`tools/packages/constants/typescript-consumer-checks.constant.ts`) |

To run them locally:

```bash
npm ci --strict-allow-scripts --prefix tools/jest-smoke
npm ci --strict-allow-scripts --prefix tools/typescript-smoke
npm run build:utils
npm run test:jest && npm run test:typescript
```

To change a version, edit the `package.json` of the app, run `npm install --strict-allow-scripts --prefix <app folder>` with npm 11 and commit both files. In `tools/jest-smoke`, keep `@babel/core` on the version that the Angular build already uses, so that the app has a single Babel. In `tools/typescript-smoke`, each compiler is an npm alias (`typescript-6.0`); a new line needs its alias and its rows in the constant.

## Test environment variables

| Variable                         | Values                                           | Default                                                 |
| :------------------------------- | :----------------------------------------------- | :------------------------------------------------------ |
| `FOUNDRY_TEST_BROWSERS`          | `chromium,firefox,webkit` (any subset) or `none` | the three browsers                                      |
| `FOUNDRY_EXPECTED_ANGULAR_MAJOR` | `21`, `22`                                       | the major of `@angular/core` in the root `package.json` |
| `FOUNDRY_TEST_COVERAGE`          | `true`                                           | unset; with `true`, browser projects keep Chromium only |

An unknown browser name fails the run instead of running fewer tests.

When a browser test fails, the job uploads `.vitest/attachments` (the failure screenshots of Vitest) as an artifact kept for 7 days.

## Caches and warm-up

- npm cache (`~/.npm`) through `setup-node`, keyed on the lockfile of the job.
- Playwright browsers (`~/.cache/ms-playwright`), keyed on OS, architecture, Playwright version and browser list. Chromium is the headless shell (`--only-shell`).
- Jobs with Firefox and WebKit run in the Playwright image (`mcr.microsoft.com/playwright:v1.65.1-noble`), which already has the browsers and their system packages. Its tag must match the Playwright version of both lockfiles. The fast level only needs Chromium and runs on the plain runner, whose image already has the libraries of Chrome.
- `npm run test:warmup` runs the Angular browser smoke project before the real run, so that Vite has optimized the dependencies.

## Install scripts: `allowScripts`

npm reads the `allowScripts` field from version 11.16. Node 22 ships npm 10, which ignores it, so every CI job pins npm 11.21.3 and installs with `--strict-allow-scripts`: a new dependency with an install script that is not in the list fails the install until someone reviews it. Locally, use the Node 24 of `.nvmrc`.

No package may run install scripts. The four that have one are denied (`false`) in both manifests of the workspace, because lint, tests, build and `check:packages` work without them. `tools/jest-smoke/package.json` denies the only one it installs, `@parcel/watcher` (from `jest-haste-map`, which works without it):

| Package            | Comes from                               | Script                                       | Why it is not needed                                                                                                       |
| :----------------- | :--------------------------------------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `esbuild`          | `@angular/build`, Vite                   | `postinstall: node install.js`               | It checks the binary, which comes as an optional dependency (`@esbuild/linux-x64` and others); the JS API finds it anyway. |
| `lmdb`             | `@angular/build` (optional; build cache) | `install: node-gyp-build-optional-packages`  | It only compiles from source when there is no prebuilt binary; those come as optional dependencies.                        |
| `msgpackr-extract` | `msgpackr` from `lmdb` (optional)        | `install: node-gyp-build-optional-packages`  | Same as `lmdb`. Without it, `msgpackr` falls back to JavaScript.                                                           |
| `@parcel/watcher`  | `sass` from `@angular/build` (optional)  | `install: node scripts/build-from-source.js` | It only builds from source without a prebuilt binary; `sass` uses it only in watch mode.                                   |

To review a new one: `npm install-scripts ls`, then `npm install-scripts approve <package>` (pinned to the reviewed version) or `npm install-scripts deny <package>`, and add a row to this table.

## npm audit

- Production (`npm audit --omit=dev --audit-level=low`): fast level, blocking.
- Development: full level, in the Angular 21 browsers job, never blocking. `tools/ci/audit-report.ts` writes the table to the job summary and adds a warning when there is any high or critical vulnerability.

## Adding a job

A new job of the full level must be added to `needs` of the `result` job: that makes it part of the required `Full level` check without changing the branch rule. Prefer one more step in an existing job over a new job, because every job pays about a minute of setup.

## Keeping CI fast

- Every job has `timeout-minutes`.
- `cancel-in-progress` cancels the previous run of the same branch or pull request.
- Draft pull requests only get the fast level: open the pull request as a draft while the work goes on and mark it ready for review when it is done.
- The night run is skipped when `main` has not changed since the last successful night or manual run.
