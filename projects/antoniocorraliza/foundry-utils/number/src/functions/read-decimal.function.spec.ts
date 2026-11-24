import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import { readDecimal } from './read-decimal.function';

type DecimalFormat = Required<FoundryParseDecimalOptions>;

const COMMA: DecimalFormat = { decimalSeparator: ',', groupSeparator: null, groupStyle: 'thousands' };
const DOT: DecimalFormat = { decimalSeparator: '.', groupSeparator: null, groupStyle: 'thousands' };
const COMMA_DOT_GROUPS: DecimalFormat = { decimalSeparator: ',', groupSeparator: '.', groupStyle: 'thousands' };
const DOT_COMMA_GROUPS: DecimalFormat = { decimalSeparator: '.', groupSeparator: ',', groupStyle: 'thousands' };
const COMMA_SPACE_GROUPS: DecimalFormat = { decimalSeparator: ',', groupSeparator: ' ', groupStyle: 'thousands' };
const DOT_APOSTROPHE_GROUPS: DecimalFormat = { decimalSeparator: '.', groupSeparator: "'", groupStyle: 'thousands' };
const COMMA_APOSTROPHE_GROUPS: DecimalFormat = { decimalSeparator: ',', groupSeparator: "'", groupStyle: 'thousands' };
const INDIAN_GROUPS: DecimalFormat = { decimalSeparator: '.', groupSeparator: ',', groupStyle: 'indian' };

const ALL_FORMATS: ReadonlyArray<DecimalFormat> = [
  COMMA,
  DOT,
  COMMA_DOT_GROUPS,
  DOT_COMMA_GROUPS,
  COMMA_SPACE_GROUPS,
  DOT_APOSTROPHE_GROUPS,
  COMMA_APOSTROPHE_GROUPS,
  INDIAN_GROUPS,
];

const GROUP_CHARACTERS: Readonly<Record<string, ReadonlyArray<string>>> = {
  '.': ['.'],
  ',': [','],
  ' ': [' ', ' ', ' ', ' '],
  "'": ["'", '’'],
};

function writeDecimalText(integerDigits: string, fractionDigits: string, format: DecimalFormat, groupIndex: number): string {
  const groupCharacters: ReadonlyArray<string> = format.groupSeparator === null ? [] : (GROUP_CHARACTERS[format.groupSeparator] ?? []);
  const groupCharacter: string | undefined = groupCharacters[groupIndex % Math.max(groupCharacters.length, 1)];
  const groups: Array<string> = [];
  let rest: string = integerDigits;
  let size: number = 3;
  while (rest.length > size) {
    groups.unshift(rest.slice(-size));
    rest = rest.slice(0, -size);
    if (format.groupStyle === 'indian') size = 2;
  }
  groups.unshift(rest);
  const integerText: string = groupCharacter === undefined ? integerDigits : groups.join(groupCharacter);
  return fractionDigits === '' ? integerText : `${integerText}${format.decimalSeparator}${fractionDigits}`;
}

describe('readDecimal', () => {
  it('reads a number with the decimal separator of the options', () => {
    expect(readDecimal('12,5', COMMA)).toBe(12.5);
    expect(readDecimal('12.5', DOT)).toBe(12.5);
    expect(readDecimal('7', COMMA)).toBe(7);
  });

  it('removes the spaces around the number, also a no-break space and line breaks', () => {
    expect(readDecimal(' 12,5 ', COMMA)).toBe(12.5);
    expect(readDecimal(' 12,5 ', COMMA)).toBe(12.5);
    expect(readDecimal('\n12,5\t', COMMA)).toBe(12.5);
  });

  it('ignores the direction marks at the start, as many as there are', () => {
    expect(readDecimal('‎-1,234.5', DOT_COMMA_GROUPS)).toBe(-1234.5);
    expect(readDecimal('‏‎5', DOT)).toBe(5);
    expect(readDecimal('؜-5', DOT)).toBe(-5);
  });

  it.each<string>(['5‎', '-‎5', '1‏2', '1,2؜3'])('returns null for %j, with a direction mark that is not at the start', (text) => {
    expect(readDecimal(text, COMMA)).toBeNull();
  });

  it('reads a plus sign, a hyphen and the minus sign', () => {
    expect(readDecimal('+5', DOT)).toBe(5);
    expect(readDecimal('-5', DOT)).toBe(-5);
    expect(readDecimal('−1 234,5', COMMA_SPACE_GROUPS)).toBe(-1234.5);
  });

  it.each<string>(['- 5', '--5', '+-5', '−-5', '5-', '-', '+'])('returns null for %j, with a sign out of place', (text) => {
    expect(readDecimal(text, DOT)).toBeNull();
  });

  it.each<string>(['.5', ',5', ',', '.'])('returns null for %j, without an integer digit', (text) => {
    expect(readDecimal(text, DOT)).toBeNull();
    expect(readDecimal(text, COMMA)).toBeNull();
  });

  it('accepts no group separator unless the options give one', () => {
    expect(readDecimal('1234,5', COMMA)).toBe(1234.5);
    expect(readDecimal('1 234,5', COMMA)).toBeNull();
    expect(readDecimal('1.234,5', COMMA)).toBeNull();
    expect(readDecimal('1.234', COMMA)).toBeNull();
  });

  it('never takes the separator of another language for the decimal one', () => {
    expect(readDecimal('12.5', COMMA)).toBeNull();
    expect(readDecimal('12,5', DOT)).toBeNull();
  });

  it('accepts a number without groups, or with every group in place', () => {
    expect(readDecimal('1.234.567', COMMA_DOT_GROUPS)).toBe(1234567);
    expect(readDecimal('1234567', COMMA_DOT_GROUPS)).toBe(1234567);
    expect(readDecimal('12.345,5', COMMA_DOT_GROUPS)).toBe(12345.5);
    expect(readDecimal('123', COMMA_DOT_GROUPS)).toBe(123);
  });

  it.each<string>(['12.34,5', '1234.567', '1.2345', '1.234.56', '.123', '1..234', '1.234.'])(
    'returns null for %j, with groups out of place',
    (text) => {
      expect(readDecimal(text, COMMA_DOT_GROUPS)).toBeNull();
    },
  );

  it.each<string>(['1 234 567,5', '1 234 567,5', '1 234 567,5', '1 234 567,5', '1 234 567,5', '1 234 567,5'])(
    'reads any space that numbers use as a space group separator, also mixed: %j',
    (text) => {
      expect(readDecimal(text, COMMA_SPACE_GROUPS)).toBe(1234567.5);
    },
  );

  it('reads the straight and the curly apostrophe as an apostrophe group separator', () => {
    expect(readDecimal("1'234.5", DOT_APOSTROPHE_GROUPS)).toBe(1234.5);
    expect(readDecimal('1’234.5', DOT_APOSTROPHE_GROUPS)).toBe(1234.5);
    expect(readDecimal("1'234,5", COMMA_APOSTROPHE_GROUPS)).toBe(1234.5);
  });

  it('reads Indian groups only with the Indian group style', () => {
    expect(readDecimal('12,34,567.5', INDIAN_GROUPS)).toBe(1234567.5);
    expect(readDecimal('1,234', INDIAN_GROUPS)).toBe(1234);
    expect(readDecimal('1,00,00,000', INDIAN_GROUPS)).toBe(10000000);
    expect(readDecimal('1,234,567.5', INDIAN_GROUPS)).toBeNull();
    expect(readDecimal('12,34,567.5', DOT_COMMA_GROUPS)).toBeNull();
    expect(readDecimal('123,34,567', INDIAN_GROUPS)).toBeNull();
  });

  it('needs at least one digit after the decimal separator', () => {
    expect(readDecimal('12,', COMMA)).toBeNull();
    expect(readDecimal('12,05', COMMA)).toBe(12.05);
  });

  it.each<string>([
    '0x1A',
    '1e3',
    '1E3',
    'Infinity',
    '-Infinity',
    'NaN',
    '',
    '   ',
    '1.234,56 €',
    '12 %',
    '١٢٣',
    '۱۲۳',
    '१२३',
    '١2',
    '1_000',
    '12,5,0',
  ])('returns null for %j', (text) => {
    expect(readDecimal(text, COMMA_DOT_GROUPS)).toBeNull();
  });

  it('never returns negative zero', () => {
    expect(Object.is(readDecimal('-0', COMMA), 0)).toBe(true);
    expect(Object.is(readDecimal('-0,0', COMMA), 0)).toBe(true);
    expect(Object.is(readDecimal('−0,000', COMMA_DOT_GROUPS), 0)).toBe(true);
  });

  it.each<unknown>([5, 12.5, null, undefined, true, new String('5'), ['5'], { value: '5' }, 5n])(
    'returns null for %s, which is not a string',
    (value) => {
      expect(readDecimal(value, DOT)).toBeNull();
    },
  );

  it('returns null for a number too large to be finite', () => {
    expect(readDecimal('9'.repeat(400), DOT)).toBeNull();
    expect(readDecimal(`-${'9'.repeat(400)}`, DOT)).toBeNull();
  });

  it('returns the nearest number for more significant digits than a number keeps', () => {
    expect(readDecimal('12345678901234567890', DOT)).toBe(Number('12345678901234567890'));
    expect(readDecimal('0.1234567890123456789', DOT)).toBe(Number('0.1234567890123456789'));
  });

  it('reads back a number written with any supported format', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_FORMATS),
        fc.bigInt({ min: 0n, max: 10n ** 15n }),
        fc.stringMatching(/^(?:\d{1,6})?$/u),
        fc.boolean(),
        fc.nat(),
        (format, integerPart, fractionDigits, isNegative, groupIndex) => {
          const text: string = writeDecimalText(String(integerPart), fractionDigits, format, groupIndex);
          const expected: number = Number(`${String(integerPart)}${fractionDigits === '' ? '' : `.${fractionDigits}`}`);
          expect(readDecimal(`${isNegative ? '-' : ''}${text}`, format)).toBe(isNegative && expected !== 0 ? -expected : expected);
        },
      ),
    );
  });

  it('never throws, and never returns negative zero or NaN', () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_FORMATS), fc.oneof(fc.string(), fc.anything()), (format, value) => {
        const result: number | null = readDecimal(value, format);
        expect(result === null || Number.isFinite(result)).toBe(true);
        expect(Object.is(result, -0)).toBe(false);
      }),
    );
  });
});
