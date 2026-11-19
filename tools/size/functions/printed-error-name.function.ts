import { execFile } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import type { ErrorNameRequest } from '../interfaces/error-name-request.interface.ts';
import { bundleWithEsbuild } from './bundle-with-esbuild.function.ts';
import { bundleWithRollup } from './bundle-with-rollup.function.ts';

export async function printedErrorName(request: ErrorNameRequest): Promise<string> {
  const code: string = request.bundler === 'esbuild' ? await bundleWithEsbuild(request.bundle) : await bundleWithRollup(request.bundle);
  writeFileSync(request.outputFile, code);
  const { stdout } = await promisify(execFile)(process.execPath, [request.outputFile]);
  return stdout.trim();
}
