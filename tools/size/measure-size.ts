import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { FOUNDRY_PACKAGES } from '../packages/constants/foundry-packages.constant.ts';
import { PACKAGES_DIST_DIRECTORY } from '../packages/constants/paths.constant.ts';
import { BASE_APP_COMPONENT, BASE_FORMS_APP_COMPONENT } from './constants/base-components.constant.ts';
import { BUNDLERS } from './constants/bundlers.constant.ts';
import { PUBLIC_ERROR_CLASSES } from './constants/public-error-classes.constant.ts';
import { SIZE_MEASUREMENTS } from './constants/size-measurements.constant.ts';
import { SIZE_REFERENCE_PATH } from './constants/size-settings.constant.ts';
import { SIZE_TOOLS } from './constants/size-tools.constant.ts';
import { angularProbeSource } from './functions/angular-probe-source.function.ts';
import { budgetProblems } from './functions/budget-problems.function.ts';
import { buildAngularProbe } from './functions/build-angular-probe.function.ts';
import { bundleWithEsbuild } from './functions/bundle-with-esbuild.function.ts';
import { bundleWithRollup } from './functions/bundle-with-rollup.function.ts';
import { errorNameProbeSource } from './functions/error-name-probe-source.function.ts';
import { errorNameProblem } from './functions/error-name-problem.function.ts';
import { formatKilobytes } from './functions/format-kilobytes.function.ts';
import { listBuiltEntries } from './functions/list-built-entries.function.ts';
import { measureContents } from './functions/measure-contents.function.ts';
import { printedErrorName } from './functions/printed-error-name.function.ts';
import { probeSource } from './functions/probe-source.function.ts';
import { referenceProblems } from './functions/reference-problems.function.ts';
import { resolveMeasurement } from './functions/resolve-measurement.function.ts';
import { runWithConcurrency } from './functions/run-with-concurrency.function.ts';
import { sizeDelta } from './functions/size-delta.function.ts';
import { undeclaredErrorClasses } from './functions/undeclared-error-classes.function.ts';
import { wholeEntryMeasurements } from './functions/whole-entry-measurements.function.ts';
import type { BaseComponent } from './interfaces/base-component.interface.ts';
import type { BuiltEntry } from './interfaces/built-entry.interface.ts';
import type { BundleRequest } from './interfaces/bundle-request.interface.ts';
import type { PendingMeasurement } from './interfaces/pending-measurement.interface.ts';
import type { ResolvedMeasurement } from './interfaces/resolved-measurement.interface.ts';
import type { SizeFigures } from './interfaces/size-figures.interface.ts';
import type { SizeMeasurement } from './interfaces/size-measurement.interface.ts';
import type { SizeReport } from './interfaces/size-report.interface.ts';
import type { SizeRunContext } from './interfaces/size-run-context.interface.ts';
import type { Bundler } from './types/bundler.type.ts';
import type { MeasurementResolution } from './types/measurement-resolution.type.ts';
import type { SizeReference } from './types/size-reference.type.ts';
import type { SizeToolFigures } from './types/size-tool-figures.type.ts';

function listBuiltFiles(distDirectory: string): Set<string> {
  return new Set(
    readdirSync(distDirectory, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => relative(distDirectory, join(entry.parentPath, entry.name)).split(sep).join('/')),
  );
}

function readReference(path: string): SizeReference {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as SizeReference) : {};
}

function writeReference(path: string, measured: SizeReference): void {
  const ordered: Record<string, SizeToolFigures> = {};
  for (const name of Object.keys(measured).sort()) {
    const figures: SizeToolFigures = measured[name] ?? {};
    ordered[name] = Object.fromEntries(SIZE_TOOLS.filter((tool) => figures[tool]).map((tool) => [tool, figures[tool]]));
  }
  writeFileSync(path, `${JSON.stringify(ordered, null, 2)}\n`);
}

async function bundle(bundler: Bundler, request: BundleRequest): Promise<string> {
  return bundler === 'esbuild' ? bundleWithEsbuild(request) : bundleWithRollup(request);
}

function baseComponentOf(measurement: SizeMeasurement, repositoryRoot: string): BaseComponent {
  const component: BaseComponent = measurement.target === 'angular-app-with-forms' ? BASE_FORMS_APP_COMPONENT : BASE_APP_COMPONENT;
  return { path: join(repositoryRoot, component.path), className: component.className };
}

async function measureAll(measurable: ReadonlyArray<ResolvedMeasurement>, context: SizeRunContext): Promise<SizeReference> {
  const { repositoryRoot, workDirectory, bundleRequest } = context;
  const measured: Record<string, SizeToolFigures> = {};
  const bundleBases: Map<Bundler, SizeFigures> = new Map();
  for (const bundler of BUNDLERS) {
    bundleBases.set(bundler, measureContents([await bundle(bundler, { ...bundleRequest, source: probeSource([]) })]));
  }
  for (const resolution of measurable.filter((candidate) => candidate.measurement.target === 'bundle')) {
    const figures: Partial<Record<Bundler, SizeFigures>> = {};
    for (const bundler of BUNDLERS) {
      const probe: SizeFigures = measureContents([await bundle(bundler, { ...bundleRequest, source: probeSource(resolution.imports) })]);
      figures[bundler] = sizeDelta(probe, bundleBases.get(bundler) ?? { raw: 0, gzip: 0 });
    }
    measured[resolution.measurement.name] = figures;
  }
  for (const resolution of measurable.filter((candidate) => candidate.measurement.target === 'stylesheets')) {
    const files: Array<Buffer> = (resolution.measurement.files ?? []).map((file) =>
      readFileSync(join(PACKAGES_DIST_DIRECTORY, resolution.measurement.packageFolder, file)),
    );
    measured[resolution.measurement.name] = { files: measureContents(files) };
  }
  const angularMeasurable: Array<ResolvedMeasurement> = measurable.filter((candidate) =>
    candidate.measurement.target.startsWith('angular'),
  );
  const baseSources: Map<string, string> = new Map(
    angularMeasurable.map((resolution) => {
      const baseComponent: BaseComponent = baseComponentOf(resolution.measurement, repositoryRoot);
      return [baseComponent.className, angularProbeSource(baseComponent, [])];
    }),
  );
  const sources: Array<string> = [
    ...baseSources.values(),
    ...angularMeasurable.map((resolution) =>
      angularProbeSource(baseComponentOf(resolution.measurement, repositoryRoot), resolution.imports),
    ),
  ];
  const concurrency: number = Math.max(1, Math.floor(availableParallelism() / 2));
  const outputs: Array<SizeFigures> = await runWithConcurrency(
    sources.map((source, index) => async () => {
      const workspaceDirectory: string = join(workDirectory, `angular-${index}`);
      return measureContents(await buildAngularProbe({ source, workspaceDirectory, repositoryRoot }));
    }),
    concurrency,
  );
  const baseFigures: Map<string, SizeFigures> = new Map(
    [...baseSources.keys()].map((className, index) => [className, outputs[index] ?? { raw: 0, gzip: 0 }]),
  );
  angularMeasurable.forEach((resolution, index) => {
    const base: SizeFigures = baseFigures.get(baseComponentOf(resolution.measurement, repositoryRoot).className) ?? { raw: 0, gzip: 0 };
    measured[resolution.measurement.name] = { angular: sizeDelta(outputs[baseSources.size + index] ?? base, base) };
  });
  return measured;
}

async function errorNameProblems(builtEntries: ReadonlyArray<BuiltEntry>, context: SizeRunContext): Promise<Array<string>> {
  const { workDirectory, bundleRequest } = context;
  const problems: Array<string> = undeclaredErrorClasses(builtEntries, PUBLIC_ERROR_CLASSES);
  let checked: number = 0;
  for (const errorClass of PUBLIC_ERROR_CLASSES) {
    const builtEntry: BuiltEntry | undefined = builtEntries.find(
      (candidate) => candidate.packageFolder === errorClass.packageFolder && candidate.entry === errorClass.entry,
    );
    if (!builtEntry?.exports.includes(errorClass.className)) continue;
    for (const bundler of BUNDLERS) {
      const source: string = errorNameProbeSource(builtEntry.specifier, errorClass);
      const outputFile: string = join(workDirectory, `error-name-${checked}.mjs`);
      checked += 1;
      const printed: string = await printedErrorName({ bundle: { ...bundleRequest, source }, bundler, outputFile });
      const problem: string | undefined = errorNameProblem(builtEntry.specifier, errorClass.className, bundler, printed);
      if (problem !== undefined) problems.push(problem);
    }
  }
  console.log(
    `\n[size]: error names checked after minifying: ${checked / BUNDLERS.length} of ${PUBLIC_ERROR_CLASSES.length} declared classes`,
  );
  return problems;
}

function printReport(report: SizeReport): void {
  const { measured, measurements, pending } = report;
  console.log(`\n${'measurement'.padEnd(64)}${'tool'.padEnd(9)}${'raw'.padStart(10)}${'gzip'.padStart(11)}   budget`);
  for (const measurement of measurements) {
    const figures: SizeToolFigures | undefined = measured[measurement.name];
    if (!figures) continue;
    for (const tool of SIZE_TOOLS) {
      const toolFigures: SizeFigures | undefined = figures[tool];
      if (!toolFigures) continue;
      const budget: string = measurement.budget ? `${measurement.budget.rawKilobytes} / ${measurement.budget.gzipKilobytes} kB` : 'none';
      const raw: string = formatKilobytes(toolFigures.raw).padStart(10);
      console.log(`${measurement.name.padEnd(64)}${tool.padEnd(9)}${raw}${formatKilobytes(toolFigures.gzip).padStart(11)}   ${budget}`);
    }
  }
  console.log(`\n[size]: ${pending.length} measurements pending (entry not built or symbol not exported yet)`);
  for (const resolution of pending) console.log(`  - ${resolution.measurement.name}: ${resolution.reason}`);
}

function printProblems(title: string, problems: ReadonlyArray<string>): void {
  if (problems.length === 0) return;
  console.log(`\n${title}`);
  for (const problem of problems) console.log(`  FAIL ${problem}`);
}

async function main(): Promise<number> {
  const isUpdate: boolean = process.argv.includes('--update');
  const builtEntries: Array<BuiltEntry> = await listBuiltEntries(resolve(PACKAGES_DIST_DIRECTORY), FOUNDRY_PACKAGES);
  const measurements: Array<SizeMeasurement> = [...SIZE_MEASUREMENTS, ...wholeEntryMeasurements(builtEntries, SIZE_MEASUREMENTS)];
  const builtFiles: Set<string> = listBuiltFiles(PACKAGES_DIST_DIRECTORY);
  const resolutions: Array<MeasurementResolution> = measurements.map((measurement) =>
    resolveMeasurement(measurement, { entries: builtEntries, files: builtFiles }),
  );
  const measurable: Array<ResolvedMeasurement> = resolutions.filter((resolution) => resolution.status === 'measurable');
  const pending: Array<PendingMeasurement> = resolutions.filter((resolution) => resolution.status === 'pending');
  console.log(`[size]: measuring ${measurable.length} of ${measurements.length} measurements`);
  const repositoryRoot: string = process.cwd();
  const workDirectory: string = mkdtempSync(join(tmpdir(), 'foundry-size-'));
  symlinkSync(join(repositoryRoot, 'node_modules'), join(workDirectory, 'node_modules'), 'dir');
  const bundleRequest: BundleRequest = {
    source: '',
    resolveDirectory: workDirectory,
    entryFiles: new Map(builtEntries.map((builtEntry) => [builtEntry.specifier, builtEntry.file])),
  };
  const context: SizeRunContext = { repositoryRoot, workDirectory, bundleRequest };
  try {
    const measured: SizeReference = await measureAll(measurable, context);
    printReport({ measured, measurements, pending });
    const budget: Array<string> = measurable.flatMap((resolution) =>
      budgetProblems(resolution.measurement.name, measured[resolution.measurement.name] ?? {}, resolution.measurement.budget),
    );
    const errorNames: Array<string> = await errorNameProblems(builtEntries, context);
    let reference: Array<string> = [];
    if (isUpdate) {
      writeReference(SIZE_REFERENCE_PATH, measured);
      console.log(`[size]: ${SIZE_REFERENCE_PATH} updated; commit it with the change that moved the sizes`);
    } else {
      reference = referenceProblems(measured, readReference(SIZE_REFERENCE_PATH));
    }
    printProblems('Over budget:', budget);
    printProblems('Error names:', errorNames);
    printProblems(`Different from ${SIZE_REFERENCE_PATH} (run \`npm run size:update\` and commit it):`, reference);
    const failures: number = budget.length + errorNames.length + reference.length;
    console.log(failures === 0 ? '\n[size]: ok' : `\n[size]: ${failures} problem(s)`);
    return failures === 0 ? 0 : 1;
  } finally {
    rmSync(workDirectory, { recursive: true, force: true });
  }
}

process.exitCode = await main();
