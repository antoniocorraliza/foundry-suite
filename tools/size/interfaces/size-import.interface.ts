import type { ImportedSymbols } from '../types/imported-symbols.type.ts';

export interface SizeImport {
  readonly entry: string;
  readonly symbols: ImportedSymbols;
}
