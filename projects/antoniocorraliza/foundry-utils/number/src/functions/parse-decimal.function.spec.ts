import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import { parseDecimal } from './parse-decimal.function';

describe('parseDecimal', () => {
  it('reads decimals with the shared reader of this entry', () => {
    expect(parseDecimal('12,5', { decimalSeparator: ',' })).toBe(12.5);
    expect(parseDecimal('1 234 567,5', { decimalSeparator: ',', groupSeparator: ' ' })).toBe(1234567.5);
    expect(parseDecimal('1’234.5', { decimalSeparator: '.', groupSeparator: "'" })).toBe(1234.5);
    expect(parseDecimal('12,34,567.5', { decimalSeparator: '.', groupSeparator: ',', groupStyle: 'indian' })).toBe(1234567.5);
    expect(parseDecimal('1.234,5', { decimalSeparator: ',' })).toBeNull();
  });

  it('accepts no group separator by default, and takes null as none', () => {
    expect(parseDecimal('1.234', { decimalSeparator: ',' })).toBeNull();
    expect(parseDecimal('1.234', { decimalSeparator: ',', groupSeparator: null })).toBeNull();
  });

  it('takes a null group style as the thousands style', () => {
    expect(parseDecimal('1.234.567', { decimalSeparator: ',', groupSeparator: '.', groupStyle: null } as never)).toBe(1234567);
  });

  it.each<unknown>([5, null, undefined, new String('5'), {}])('returns null for the value %j, which is not a string', (value) => {
    expect(parseDecimal(value, { decimalSeparator: '.' })).toBeNull();
  });

  it.each<FoundryParseDecimalOptions>([
    { decimalSeparator: ',', groupSeparator: ',' },
    { decimalSeparator: '.', groupSeparator: '.' },
  ])('throws a RangeError when the group separator is the decimal one, with or without a text: %j', (options) => {
    expect(catchThrown(() => parseDecimal('1', options))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => parseDecimal(null, options))).toBeInstanceOf(RangeError);
  });

  it.each<unknown>([undefined, 5, ',', null, [], { decimalSeparator: undefined }, { decimalSeparator: null }, {}])(
    'throws a TypeError for the options %j, without the required decimal separator',
    (options) => {
      expect(catchThrown(() => parseDecimal('1', options as FoundryParseDecimalOptions))).toBeInstanceOf(TypeError);
    },
  );

  it.each<unknown>([
    { decimalSeparator: ' ' },
    { decimalSeparator: ',', groupSeparator: '_' },
    { decimalSeparator: ',', groupSeparator: ' ' },
    { decimalSeparator: ',', groupStyle: 'lakh' },
  ])('throws a TypeError for the unknown option values %j', (options) => {
    expect(catchThrown(() => parseDecimal('1', options as FoundryParseDecimalOptions))).toBeInstanceOf(TypeError);
  });

  it('leaves its options unchanged', () => {
    const options: FrozenSnapshot<FoundryParseDecimalOptions> = freezeAndSnapshot<FoundryParseDecimalOptions>({
      decimalSeparator: ',',
      groupSeparator: '.',
    });
    parseDecimal('1.234,5', options.value);
    expect(options.listChanges()).toEqual([]);
  });

  it('never throws because of the value', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        expect(() => parseDecimal(value, { decimalSeparator: ',', groupSeparator: ' ', groupStyle: 'indian' })).not.toThrow();
      }),
    );
  });
});
