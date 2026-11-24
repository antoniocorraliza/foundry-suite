import { describe, expect, it } from 'vitest';
import { excelSpanishCsvOptions } from './excel-spanish-csv-options.constant';

describe('excelSpanishCsvOptions', () => {
  it('has a semicolon between cells and a decimal comma', () => {
    expect(excelSpanishCsvOptions).toEqual({ delimiter: ';', decimalSeparator: ',' });
  });

  it('is frozen, so an assignment throws instead of changing the options of the whole app', () => {
    expect(Object.isFrozen(excelSpanishCsvOptions)).toBe(true);
    expect(() => {
      (excelSpanishCsvOptions as { delimiter: string }).delimiter = ',';
    }).toThrow(TypeError);
    expect(excelSpanishCsvOptions.delimiter).toBe(';');
  });
});
