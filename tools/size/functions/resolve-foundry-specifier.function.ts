import { EXTERNAL_PACKAGE, FOUNDRY_SPECIFIER } from '../constants/module-patterns.constant.ts';
import type { ModuleResolution } from '../interfaces/module-resolution.interface.ts';

export function resolveFoundrySpecifier(specifier: string, entryFiles: ReadonlyMap<string, string>): ModuleResolution | null {
  if (EXTERNAL_PACKAGE.test(specifier)) return { path: specifier, isExternal: true };
  if (!FOUNDRY_SPECIFIER.test(specifier)) return null;
  const file: string | undefined = entryFiles.get(specifier);
  if (file === undefined) throw new Error(`[size]: ${specifier} is not built`);
  return { path: file, isExternal: false };
}
