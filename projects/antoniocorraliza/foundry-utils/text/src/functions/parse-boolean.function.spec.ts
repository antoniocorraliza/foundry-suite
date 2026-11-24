import { describe, expect, it } from 'vitest';
import { parseBoolean } from './parse-boolean.function';

describe('parseBoolean', () => {
  it('returns a boolean as it is', () => {
    expect(parseBoolean(true)).toBe(true);
    expect(parseBoolean(false)).toBe(false);
  });

  it('reads 1 as true and 0 as false, and no other number', () => {
    expect(parseBoolean(1)).toBe(true);
    expect(parseBoolean(0)).toBe(false);
    expect(parseBoolean(-0)).toBe(false);
    expect(parseBoolean(2)).toBeNull();
    expect(parseBoolean(1.5)).toBeNull();
    expect(parseBoolean(Number.NaN)).toBeNull();
  });

  it.each<string>(['true', '1', 'yes', 'on', 'sí', 'si', ' TRUE ', 'SÍ', 'Si', 'Yes', 'ON'])('reads %j as true', (text) => {
    expect(parseBoolean(text)).toBe(true);
  });

  it.each<string>(['false', '0', 'no', 'off', ' FALSE ', 'No', 'OFF'])('reads %j as false', (text) => {
    expect(parseBoolean(text)).toBe(false);
  });

  it.each<string>(['y', 't', 'n', 'f', '1.0', '', '   ', 'truthy', 'nope'])('returns null for %j, which it does not know', (text) => {
    expect(parseBoolean(text)).toBeNull();
  });

  it('does not read a yes written with a combining accent', () => {
    expect(parseBoolean('sí')).toBeNull();
  });

  it.each<unknown>([null, undefined, new Boolean(true), {}, [true], 1n])(
    'returns null for %s, which is not a boolean, a number or a text',
    (value) => {
      expect(parseBoolean(value)).toBeNull();
    },
  );
});
