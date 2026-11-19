import { execFile } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { AngularProbeRequest } from '../interfaces/angular-probe-request.interface.ts';

export async function buildAngularProbe(request: AngularProbeRequest): Promise<Array<Buffer>> {
  const { source, workspaceDirectory, repositoryRoot } = request;
  mkdirSync(join(workspaceDirectory, 'src'), { recursive: true });
  symlinkSync(join(repositoryRoot, 'node_modules'), join(workspaceDirectory, 'node_modules'), 'dir');
  const build: Readonly<Record<string, unknown>> = {
    builder: '@angular/build:application',
    options: {
      browser: 'src/main.ts',
      index: 'src/index.html',
      tsConfig: 'tsconfig.json',
      outputPath: 'out',
      polyfills: [],
      optimization: true,
      sourceMap: false,
      outputHashing: 'none',
      extractLicenses: false,
    },
  };
  const workspace: Readonly<Record<string, unknown>> = {
    version: 1,
    cli: { analytics: false, cache: { enabled: false } },
    projects: { probe: { projectType: 'application', root: '', sourceRoot: 'src', architect: { build } } },
  };
  const typescriptConfiguration: Readonly<Record<string, unknown>> = {
    extends: join(repositoryRoot, 'tsconfig.json'),
    compilerOptions: { lib: ['ES2022', 'DOM'], types: [] },
    files: ['src/main.ts'],
  };
  writeFileSync(join(workspaceDirectory, 'angular.json'), JSON.stringify(workspace));
  writeFileSync(join(workspaceDirectory, 'tsconfig.json'), JSON.stringify(typescriptConfiguration));
  writeFileSync(join(workspaceDirectory, 'src/index.html'), '<!doctype html><html><body></body></html>\n');
  writeFileSync(join(workspaceDirectory, 'src/main.ts'), source);
  const angularCli: string = join(repositoryRoot, 'node_modules/@angular/cli/bin/ng.js');
  try {
    await promisify(execFile)(process.execPath, [angularCli, 'build', 'probe'], {
      cwd: workspaceDirectory,
      env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch (error) {
    throw new Error(`[size]: the Angular build in ${workspaceDirectory} failed`, { cause: error });
  }
  const outputDirectory: string = join(workspaceDirectory, 'out/browser');
  return readdirSync(outputDirectory)
    .filter((file) => /\.(?:js|css)$/.test(file))
    .sort()
    .map((file) => readFileSync(join(outputDirectory, file)));
}
