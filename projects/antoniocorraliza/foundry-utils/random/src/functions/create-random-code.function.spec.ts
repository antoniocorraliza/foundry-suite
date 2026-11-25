import { afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryCryptoUnavailableError, ɵcheckOptions, ɵparseTextOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createQueuedCrypto } from '@foundry-test/functions/create-queued-crypto.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { createRandomCode } from './create-random-code.function';
import { readRandomBytes } from './read-random-bytes.function';

const DEFAULT_ALPHABET: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const ALPHABET_OF_256: string = String.fromCodePoint(...Array.from({ length: 256 }, (_character, index) => 0x4e00 + index));

describe('createRandomCode', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns that many characters of the default alphabet', () => {
    const code: string = createRandomCode(1024);
    expect(code).toHaveLength(1024);
    expect(Array.from(code).every((character) => DEFAULT_ALPHABET.includes(character))).toBe(true);
  });

  it('uses the default alphabet of 62 characters, in this order', () => {
    vi.stubGlobal('crypto', createQueuedCrypto(Array.from({ length: 62 }, (_byte, index) => index)));
    expect(createRandomCode(62)).toBe(DEFAULT_ALPHABET);
  });

  it('takes the character at the position of each byte', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([0, 25, 26, 51, 52, 61]));
    expect(createRandomCode(6)).toBe('AZaz09');
  });

  it.each([248, 249, 250, 251, 252, 253, 254, 255])('discards the byte %i with the default alphabet and asks for another', (byte) => {
    vi.stubGlobal('crypto', createQueuedCrypto([byte, 0]));
    expect(createRandomCode(1)).toBe('A');
  });

  it('discards the bytes from 248 to 255 in a row and keeps the next one', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([248, 249, 250, 251, 252, 253, 254, 255, 1]));
    expect(createRandomCode(1)).toBe('B');
  });

  it('keeps the byte 247 with the default alphabet', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([247]));
    expect(createRandomCode(1)).toBe('9');
  });

  it('discards 255 with an alphabet of 3 characters, and takes 254 as the third character', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([255, 254]));
    expect(createRandomCode(1, { alphabet: 'abc' })).toBe('c');
  });

  it.each<[string, string, string]>([
    ['2', 'ab', 'b'],
    ['4', 'abcd', 'd'],
    ['256', ALPHABET_OF_256, String.fromCodePoint(0x4eff)],
  ])('discards no byte with an alphabet of %s characters, which divides 256', (_size, alphabet, last) => {
    vi.stubGlobal('crypto', createQueuedCrypto([255, 0]));
    expect(createRandomCode(2, { alphabet })).toBe(`${last}${Array.from(alphabet)[0]}`);
  });

  it('counts the alphabet and the length in code points, and never splits an emoji', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([0, 1, 2, 3, 4, 5]));
    const code: string = createRandomCode(6, { alphabet: '🍎🍌🍒' });
    expect(code).toBe('🍎🍌🍒🍎🍌🍒');
    expect(code).toHaveLength(12);
  });

  it('returns whole emoji with the real bytes', () => {
    const characters: Array<string> = Array.from(createRandomCode(50, { alphabet: '🍎🍌🍒' }));
    expect(characters).toHaveLength(50);
    expect(characters.every((character) => ['🍎', '🍌', '🍒'].includes(character))).toBe(true);
  });

  it('counts a combining accent and a lone surrogate as one character each, as for...of walks the text', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([1, 3]));
    expect(createRandomCode(2, { alphabet: 'éx\uD800' })).toBe('́\uD800');
  });

  it.each<[string, unknown]>([
    ['null', null],
    ['undefined', undefined],
  ])('uses the default alphabet when the alphabet is %s', (_description, alphabet) => {
    vi.stubGlobal('crypto', createQueuedCrypto([61]));
    expect(createRandomCode(1, { alphabet: alphabet as string })).toBe('9');
  });

  it('ignores the options it does not know', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([0]));
    expect(createRandomCode(1, { size: 4 } as never)).toBe('A');
  });

  it.each<unknown>([0, -1, -0, 1.5, 1025, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '5', null])(
    'throws a RangeError for the length %s',
    (length) => {
      const thrown: RangeError = catchError(() => createRandomCode(length as number), RangeError);
      expect(thrown.message).toMatch(/^\[foundry-utils\]: /);
    },
  );

  it('rejects an alphabet that is not a text as parseTextOption does', () => {
    expect(catchError(() => createRandomCode(6, { alphabet: ['a', 'b'] as never }), TypeError).message).toBe(
      catchError(() => ɵparseTextOption({ options: { alphabet: ['a', 'b'] }, name: 'alphabet', fallback: '' }), TypeError).message,
    );
  });

  it.each<[string, string]>([
    ['an empty alphabet', ''],
    ['one character', 'a'],
    ['one emoji', '🍎'],
    ['a repeated character', 'aba'],
    ['a repeated emoji', '🍎🍌🍎'],
    ['257 characters', `${ALPHABET_OF_256}z`],
  ])('throws a RangeError for an alphabet with %s', (_description, alphabet) => {
    expect(catchThrown(() => createRandomCode(6, { alphabet }))).toBeInstanceOf(RangeError);
  });

  it('rejects options that are not an object as checkOptions does', () => {
    expect(catchError(() => createRandomCode(6, 'abc' as never), TypeError).message).toBe(
      catchError(() => ɵcheckOptions('abc', 'createRandomCode'), TypeError).message,
    );
  });

  it('checks its arguments before looking for crypto', () => {
    vi.stubGlobal('crypto', undefined);
    expect(catchThrown(() => createRandomCode(0))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => createRandomCode(6, { alphabet: 5 as never }))).toBeInstanceOf(TypeError);
    expect(catchThrown(() => createRandomCode(6, { alphabet: 'a' }))).toBeInstanceOf(RangeError);
  });

  it('names the API that readRandomBytes names when crypto has no getRandomValues', () => {
    vi.stubGlobal('crypto', { randomUUID: (): string => '' });
    expect(catchError(() => createRandomCode(6), FoundryCryptoUnavailableError).missingApi).toBe(
      catchError(() => readRandomBytes(1), FoundryCryptoUnavailableError).missingApi,
    );
  });

  it('leaves its options unchanged', () => {
    const options: FrozenSnapshot<{ readonly alphabet: string }> = freezeAndSnapshot({ alphabet: 'abc' });
    createRandomCode(6, options.value);
    expect(options.listChanges()).toEqual([]);
  });
});
