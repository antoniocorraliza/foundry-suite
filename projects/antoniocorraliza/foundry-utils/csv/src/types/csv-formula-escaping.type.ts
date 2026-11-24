import type { FORMULA_ESCAPINGS } from '../constants/formula-escapings.constant';

/** Handling of the apostrophe that escapes a formula. */
export type CsvFormulaEscaping = (typeof FORMULA_ESCAPINGS)[number];
