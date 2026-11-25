import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { excelSpanishCsvOptions } from '../constants/excel-spanish-csv-options.constant';
import { toCsv } from './to-csv.function';

describe('toCsv with Object.prototype polluted in its own process', () => {
  beforeAll(() => {
    Reflect.set(Object.prototype, 'formulaEscaping', 'none');
    Reflect.set(Object.prototype, 'columns', [{ header: 'other', value: 'b' }]);
  });

  afterAll(() => {
    Reflect.deleteProperty(Object.prototype, 'formulaEscaping');
    Reflect.deleteProperty(Object.prototype, 'columns');
  });

  it('still escapes formulas and writes every key, also with excelSpanishCsvOptions', () => {
    expect(Reflect.get({}, 'formulaEscaping')).toBe('none');
    expect(toCsv([{ a: '=1+1', b: 2.5 }], {})).toBe("a,b\r\n'=1+1,2.5\r\n");
    expect(toCsv([{ a: '=1+1', b: 2.5 }], excelSpanishCsvOptions)).toBe("a;b\r\n'=1+1;2,5\r\n");
  });
});
