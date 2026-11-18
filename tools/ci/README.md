# CI: two levels on GitHub Actions

| Level | Workflow                        | When                                                                                                    | Required check |
| :---- | :------------------------------ | :------------------------------------------------------------------------------------------------------ | :------------- |
| Fast  | `.github/workflows/ci-fast.yml` | Every push to any branch (pull requests included: GitHub reads the check of the head commit)            | `Fast level`   |
| Full  | `.github/workflows/ci-full.yml` | Pull request to `main` (not while it is a draft); every night if `main` changed; by hand before each rc | `Full level`   |

Both use `.github/actions/setup-workspace` (Node, npm, dependencies, browsers). Actions are pinned by commit SHA, with the version in a comment.

## Fast level

Angular 21, Node 24, one job: `npm ci` → production audit → lint → warm-up → unit tests on Node and Chromium → build → `check:packages`.

## Full level: matrix

| Job                                                                   | Angular |      Node      | Browsers                                            | Pull request | Night / rc |
| :-------------------------------------------------------------------- | :-----: | :------------: | :-------------------------------------------------- | :----------: | :--------: |
| `Unit · Angular 21 · Node 22` (+ build and `check:packages`)          |   21    | 22 (≥ 22.22.3) | none                                                |     yes      |    yes     |
| `Unit · Angular 21 · Node 24 · browsers` (+ development audit report) |   21    |  24 (≥ 24.15)  | Chromium, Firefox, WebKit (in the Playwright image) |     yes      |    yes     |
| `Unit · Angular 22 · Node 22`                                         |   22    |       22       | none                                                |      —       |    yes     |
| `Unit · Angular 22 · Node 24 · browsers`                              |   22    |       24       | Chromium, Firefox, WebKit (in the Playwright image) |      —       |    yes     |
| `Smoke · Node 26` (smoke, build, `check:packages`)                    |   21    |       26       | none                                                |      —       |    yes     |

Every unit job runs the zone.js and the zoneless projects: they are Vitest projects, not jobs.

**What is cut from the full product (2 Angular × 2 detections × 2 Node × 3 browsers = 24) and why:**

- **zone.js / zoneless are not separate jobs.** Both detections are projects of the same Vitest run; splitting them would only add the setup time of each job twice.
- **Browsers run on one Node only (24).** The code under test runs inside the browser; Node only serves the files through Vite. Node 22 runs the projects that do execute on Node (jsdom and plain TypeScript with time zones).
- **Angular 22 unit tests are not in pull requests:** nights and before each rc.
- **Node 26 only in the smoke job**, without the libraries' own suites.
- **The build runs with Angular 21 only:** the libraries are compiled with the lowest supported Angular. Angular 22 consumers are covered by contract-tests, SSR and integration.

## Angular 22: its own install

The workspace is Angular 21 (`package.json` and `package-lock.json`). `tools/ci/angular-22/` has a second manifest and lockfile with Angular 22.2.6, `@angular/build` 22.2.7 and TypeScript 6.0.3, plus the same Vitest, Analog, Vite, Playwright and jsdom versions. It has no lint, build or packaging tools: it only runs tests.

In CI the job installs it with `npm ci --prefix tools/ci/angular-22` and links `node_modules → tools/ci/angular-22/node_modules`. The workspace files then resolve Angular 22 and TypeScript 6.0, and the development lockfile is never touched. `FOUNDRY_EXPECTED_ANGULAR_MAJOR=22` makes the Angular smoke tests fail if the job ran with Angular 21 by mistake.

Run it locally in a separate worktree, so your own `node_modules` stays on Angular 21:

```bash
git worktree add ../foundry-ng22 HEAD
cd ../foundry-ng22
npm ci --strict-allow-scripts --prefix tools/ci/angular-22
ln -s tools/ci/angular-22/node_modules node_modules
FOUNDRY_EXPECTED_ANGULAR_MAJOR=22 npm test
cd - && git worktree remove --force ../foundry-ng22
```

To change a version: edit `tools/ci/angular-22/package.json` and run `npm install --prefix tools/ci/angular-22`; commit both files.

When a browser test fails, the job uploads `.vitest/attachments` (Vitest's failure screenshots) as an artifact kept for 7 days.

## Test environment variables

| Variable                         | Values                                           | Default                                                 |
| :------------------------------- | :----------------------------------------------- | :------------------------------------------------------ |
| `FOUNDRY_TEST_BROWSERS`          | `chromium,firefox,webkit` (any subset) or `none` | the three browsers                                      |
| `FOUNDRY_EXPECTED_ANGULAR_MAJOR` | `21`, `22`                                       | the major of `@angular/core` in the root `package.json` |
| `FOUNDRY_TEST_COVERAGE`          | `true`                                           | unset (coverage keeps Chromium only)                    |

An unknown browser name fails the run instead of silently running fewer tests.

## Caches and warm-up

- **npm cache** (`~/.npm`) through `setup-node`, keyed on the lockfile of the job (Angular 21 or 22).
- **Playwright browsers** (`~/.cache/ms-playwright`), keyed on OS, architecture, Playwright version and browser list. Chromium is the headless shell (`--only-shell`).
- **System packages:** jobs with Firefox and WebKit run in the official Playwright image (`mcr.microsoft.com/playwright:v1.65.1-noble`), which already has the browsers and their libraries; installing them with apt took over 10 minutes. Its tag must match the Playwright version of the lockfiles. The fast level (Chromium only) runs on the plain runner and skips apt, because the runner image already has the libraries of Chrome.
- **Vite warm-up:** `npm run test:warmup` runs the Angular browser smoke project before the real run, so Vite has optimized the dependencies. `optimizeDeps.include` in the factories does the rest.

## Install scripts: `allowScripts`

npm reads the `allowScripts` field from 11.16. Node 22 ships npm 10, which ignores it, so every CI job pins npm 11.21.3 and installs with `--strict-allow-scripts`: a new dependency with an install script that is not in the list fails the install until someone reviews it.

**No package may run install scripts today.** The four that have one are denied explicitly (`false`), in both manifests, because everything works without them (lint, tests, build and `check:packages`, checked with the scripts skipped):

| Package            | Comes from                               | Script                                       | Why it is not needed                                                                                                                                                              |
| :----------------- | :--------------------------------------- | :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `esbuild`          | `@angular/build`, Vite                   | `postinstall: node install.js`               | It checks the binary and may swap the JS launcher for it. The platform binary comes as an optional dependency (`@esbuild/linux-x64`…) and the JS API finds it without the script. |
| `lmdb`             | `@angular/build` (optional; build cache) | `install: node-gyp-build-optional-packages`  | Only compiles from source when there is no prebuilt binary; the prebuilt ones come as optional dependencies (`@lmdb/lmdb-<platform>`).                                            |
| `msgpackr-extract` | `msgpackr` ← `lmdb` (optional)           | `install: node-gyp-build-optional-packages`  | Same as `lmdb`. Without it, `msgpackr` falls back to JavaScript.                                                                                                                  |
| `@parcel/watcher`  | `sass` ← `@angular/build` (optional)     | `install: node scripts/build-from-source.js` | Only builds from source without a prebuilt binary; `sass` uses it only in watch mode.                                                                                             |

To review a new one: `npm install-scripts ls`, then `npm install-scripts approve <pkg>` (pinned to the reviewed version) or `npm install-scripts deny <pkg>`, and add its reason to this table.

## npm audit

- **Production** (`npm audit --omit=dev --audit-level=low`): fast level, blocking.
- **Development**: full level, Angular 21 · Node 24 job, never blocking. The table goes to the job summary, with a warning annotation when there is any high or critical vulnerability (`tools/ci/audit-report.ts`).

## Where the next jobs go

| Job                                                      | Where                                                                                                   | Level                   |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :---------------------- |
| `contracts:check` (generated copy of the contract types) | step in `ci-fast.yml`, after lint                                                                       | fast                    |
| `contract-tests/`                                        | job in `ci-full.yml`, matrix `angular: ['21', '22']`, added to `result.needs`                           | full, pull requests too |
| size per entry                                           | step in `ci-fast.yml`, after `check:packages`                                                           | fast                    |
| SSR                                                      | job in `ci-full.yml`, matrix `angular: ['21', '22']`, added to `result.needs`                           | full, pull requests too |
| integration                                              | job in `ci-full.yml`, one job per Angular version running zone.js and zoneless, added to `result.needs` | full, pull requests too |
| real Safari                                              | its own workflow on macOS (`ci-safari.yml`)                                                             | its own triggers        |

The slots are marked with comments in both workflows. A job added to `result.needs` becomes part of the required `Full level` check without changing the branch rule.

## Keeping CI fast

Every job pays about a minute of setup before any test runs. The rules:

- `timeout-minutes` on every job (a stuck browser cannot run for hours).
- `cancel-in-progress` for pushes to the same branch and for pull requests.
- Draft pull requests only get the fast level: open the pull request as a draft while the work goes on, and mark it ready for review when it is done.
- The night run is skipped when `main` has not changed since the last successful night or manual run (`Night gate`).
- Prefer one more step in an existing job over a new job.
