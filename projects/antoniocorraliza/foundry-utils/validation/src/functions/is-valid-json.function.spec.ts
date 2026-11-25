import { describe, expect, it } from 'vitest';
import { isValidJson } from './is-valid-json.function';

describe('isValidJson', () => {
  it.each<string>(['null', '0', '"hola"', 'true', '{}', '[]', ' [1] ', '{"a":[1,{"b":null}]}'])(
    'accepts any JSON by default: %j',
    (text) => {
      expect(isValidJson(text)).toBe(true);
    },
  );

  it('asks for an object or an array when that is required', () => {
    expect(isValidJson('null', { requireObjectOrArray: true })).toBe(false);
    expect(isValidJson('0', { requireObjectOrArray: true })).toBe(false);
    expect(isValidJson('"hola"', { requireObjectOrArray: true })).toBe(false);
    expect(isValidJson('{}', { requireObjectOrArray: true })).toBe(true);
    expect(isValidJson('[]', { requireObjectOrArray: true })).toBe(true);
  });

  it.each<string>(['', '   ', '{a:1}', "{'a':1}", '﻿{}', '{"a":1,}', 'undefined', 'NaN'])('rejects %j, which is not JSON', (text) => {
    expect(isValidJson(text)).toBe(false);
  });

  it.each<unknown>([{}, [], null, undefined, 0, true])('returns false for %j, which is not a string', (value) => {
    expect(isValidJson(value)).toBe(false);
  });

  it.each<unknown>(['yes', 1, null])('accepts any JSON when requireObjectOrArray is %j', (requireObjectOrArray) => {
    expect(isValidJson('0', { requireObjectOrArray } as never)).toBe(true);
  });
});
