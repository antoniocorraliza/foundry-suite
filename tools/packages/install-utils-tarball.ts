import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PACKAGES_DIST_DIRECTORY } from './constants/package-directories.constant.ts';
import type { NpmPackEntry } from './interfaces/npm-pack-entry.interface.ts';

function packUtils(distDirectory: string, workDirectory: string): string {
  const packOutput: string = execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', workDirectory], {
    cwd: distDirectory,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const packed: NpmPackEntry | undefined = (JSON.parse(packOutput) as ReadonlyArray<NpmPackEntry>)[0];
  if (!packed) throw new Error('[install-utils-tarball]: npm pack returned nothing for foundry-utils');
  return join(workDirectory, packed.filename);
}

function main(): number {
  const appDirectory: string | undefined = process.argv[2];
  if (appDirectory === undefined) {
    console.error('[install-utils-tarball]: give the folder of the consumer app, for example tools/jest-smoke');
    return 1;
  }
  const distDirectory: string = join(PACKAGES_DIST_DIRECTORY, 'foundry-utils');
  const appModules: string = join(appDirectory, 'node_modules');
  if (!existsSync(join(distDirectory, 'package.json'))) {
    console.error('[install-utils-tarball]: foundry-utils is not built, run `npm run build:utils` first');
    return 1;
  }
  if (!existsSync(appModules)) {
    console.error(
      `[install-utils-tarball]: the app is not installed, run \`npm ci --strict-allow-scripts --prefix ${appDirectory}\` first`,
    );
    return 1;
  }

  // The tarball has no dependencies, so unpacking it into node_modules installs exactly what npm would publish.
  const workDirectory: string = mkdtempSync(join(tmpdir(), 'foundry-utils-tarball-'));
  const tarball: string = packUtils(distDirectory, workDirectory);
  const installDirectory: string = join(appModules, '@antoniocorraliza', 'foundry-utils');
  rmSync(installDirectory, { recursive: true, force: true });
  mkdirSync(installDirectory, { recursive: true });
  execFileSync('tar', ['-xzf', tarball, '-C', installDirectory, '--strip-components=1']);
  rmSync(workDirectory, { recursive: true, force: true });
  console.log(`[install-utils-tarball]: installed ${tarball.split('/').pop() ?? tarball} into ${installDirectory}`);
  return 0;
}

process.exitCode = main();
