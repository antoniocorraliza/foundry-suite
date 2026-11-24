import type { DiscardableValue } from '../interfaces/discardable-value.interface.ts';

export const DISCARDABLE_VALUES: ReadonlyArray<DiscardableValue> = [
  {
    packageFolder: 'foundry-utils',
    entry: 'csv',
    valueName: 'excelSpanishCsvOptions',
    keptSymbol: 'toCsv',
    absentText: 'delimiter:";",decimalSeparator:","',
  },
];
