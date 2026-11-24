import type { DiscardableValue } from '../interfaces/discardable-value.interface.ts';

export function createDiscardableValueProbeSource(specifier: string, value: DiscardableValue): string {
  return [
    `import { ${value.keptSymbol} as probeKept, ${value.valueName} as probeUnused } from '${specifier}';`,
    'console.log([probeKept]);',
    '',
  ].join('\n');
}
