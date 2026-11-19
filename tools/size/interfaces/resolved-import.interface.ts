import type { ImportedSymbols } from '../types/imported-symbols.type.ts';

export interface ResolvedImport {
  readonly specifier: string;
  readonly symbols: ImportedSymbols;
}
