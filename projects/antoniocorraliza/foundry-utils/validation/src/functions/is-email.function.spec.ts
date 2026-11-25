import { describe, expect, it } from 'vitest';
import { measureMilliseconds } from '@foundry-test/functions/measure-milliseconds.function';
import { isEmail } from './is-email.function';

describe('isEmail', () => {
  it.each<string>(['ana@empresa.es', 'a.b+c@x.co', 'ana.garcia@sub.empresa.es'])('accepts %j', (text) => {
    expect(isEmail(text)).toBe(true);
  });

  it.each<string>(['ana@', '@x.es', 'ana empresa@x.es', ' ana@x.es', 'ana@x.es ', 'ana', ''])('rejects %j, without trimming it', (text) => {
    expect(isEmail(text)).toBe(false);
  });

  it.each<unknown>([null, undefined, 5, ['ana@empresa.es'], new String('ana@empresa.es')])(
    'returns false for %j, which is not a string',
    (value) => {
      expect(isEmail(value)).toBe(false);
    },
  );

  it.each<[string, string]>([
    ['a long local part', `${'a'.repeat(50_000)}@`],
    ['a long domain', `ana@${'a'.repeat(50_000)}`],
    ['a long run of labels', `ana@${'a.'.repeat(25_000)}`],
  ])('answers at once for %s', (_name, text) => {
    expect(measureMilliseconds(() => isEmail(text))).toBeLessThan(500);
  });

  it('can be passed to filter directly', () => {
    expect(['ana@empresa.es', 'hola'].filter(isEmail)).toEqual(['ana@empresa.es']);
  });
});
