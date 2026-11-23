import { NOT_MEASURED_ENTRIES } from '../constants/size-settings.constant.ts';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import type { BuiltPackages } from '../interfaces/built-packages.interface.ts';
import type { ResolvedImport } from '../interfaces/resolved-import.interface.ts';
import type { SizeMeasurement } from '../interfaces/size-measurement.interface.ts';
import type { MeasurementResolution } from '../types/measurement-resolution.type.ts';

export function resolveMeasurement(measurement: SizeMeasurement, built: BuiltPackages): MeasurementResolution {
  const packageEntries: Array<BuiltEntry> = built.entries.filter((builtEntry) => builtEntry.packageFolder === measurement.packageFolder);
  if (measurement.target === 'stylesheets') {
    const missing: Array<string> = (measurement.files ?? []).filter((file) => !built.files.has(`${measurement.packageFolder}/${file}`));
    if (missing.length > 0) return { status: 'pending', measurement, reason: `not built yet: ${missing.join(', ')}` };
    return { status: 'measurable', measurement, imports: [] };
  }
  if (measurement.imports === 'every-entry') {
    const imports: Array<ResolvedImport> = packageEntries
      .filter((builtEntry) => !NOT_MEASURED_ENTRIES.includes(builtEntry.entry))
      .map((builtEntry) => ({ specifier: builtEntry.specifier, symbols: 'whole-entry' }));
    if (imports.length === 0) return { status: 'pending', measurement, reason: 'no entry is built yet' };
    return { status: 'measurable', measurement, imports };
  }
  const imports: Array<ResolvedImport> = [];
  for (const sizeImport of measurement.imports) {
    const builtEntry: BuiltEntry | undefined = packageEntries.find((candidate) => candidate.entry === sizeImport.entry);
    if (!builtEntry) return { status: 'pending', measurement, reason: `entry '${sizeImport.entry || '(root)'}' is not built yet` };
    if (sizeImport.symbols !== 'whole-entry') {
      const missing: Array<string> = sizeImport.symbols.filter((symbol) => !builtEntry.exports.includes(symbol));
      if (missing.length > 0) {
        return { status: 'pending', measurement, reason: `${builtEntry.specifier} does not export ${missing.join(', ')} yet` };
      }
    }
    imports.push({ specifier: builtEntry.specifier, symbols: sizeImport.symbols });
  }
  return { status: 'measurable', measurement, imports };
}
