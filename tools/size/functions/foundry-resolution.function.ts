import { EXTERNAL_PACKAGE, FOUNDRY_SPECIFIER } from '../constants/size-settings.constant.ts';
import type { ModuleResolution } from '../interfaces/module-resolution.interface.ts';

export function foundryResolution(specifier: string, entryFiles: ReadonlyMap<string, string>): ModuleResolution | undefined {
  if (EXTERNAL_PACKAGE.test(specifier)) return { path: specifier, external: true };
  if (!FOUNDRY_SPECIFIER.test(specifier)) return undefined;
  const file: string | undefined = entryFiles.get(specifier);
  if (file === undefined) throw new Error(`[size]: ${specifier} is not built`);
  return { path: file, external: false };
}
