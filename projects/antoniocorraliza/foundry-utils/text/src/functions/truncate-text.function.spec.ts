import { describe, expect, it } from 'vitest';
import { ɵparseTextOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { splitGraphemes } from './split-graphemes.function';
import { truncateText } from './truncate-text.function';

describe('truncateText', () => {
  it('counts the suffix inside the limit, with an ellipsis of one character by default', () => {
    expect(truncateText('abcdef', 4)).toBe('abc…');
    expect(splitGraphemes(truncateText('abcdef', 4))).toHaveLength(4);
  });

  it('returns a text that fits as it is, without a suffix', () => {
    expect(truncateText('abcd', 4)).toBe('abcd');
    expect(truncateText('ab', 4)).toBe('ab');
    expect(truncateText('', 0)).toBe('');
  });

  it('counts visible characters as splitGraphemes splits them', () => {
    const texts: ReadonlyArray<string> = ['👨‍👩‍👧👨‍👩‍👧', 'ab😀cd', 'ab👨‍👩‍👧cd', '🇪🇸🇫🇷abc', '👍🏽👍🏽👍🏽', 'ééé'];
    texts.forEach((text) =>
      [2, 3, 4].forEach((maximumLength) => {
        expect(splitGraphemes(truncateText(text, maximumLength)).length).toBe(Math.min(maximumLength, splitGraphemes(text).length));
      }),
    );
  });

  it('returns the first characters without a suffix when the limit does not leave room for it', () => {
    expect(truncateText('abcdef', 1)).toBe('a');
    expect(truncateText('abc', 0)).toBe('');
    expect(truncateText('abcdef', 3, { suffix: '...' })).toBe('abc');
    expect(truncateText('abcdef', 2, { suffix: '...' })).toBe('ab');
  });

  it('counts a suffix by its visible characters', () => {
    expect(truncateText('abcdef', 5, { suffix: '...' })).toBe('ab...');
    expect(truncateText('abcdef', 3, { suffix: '' })).toBe('abc');
    expect(truncateText('abcdef', 3, { suffix: '😀' })).toBe('ab😀');
  });

  it('keeps the space before the suffix', () => {
    expect(truncateText('hola mundo', 6)).toBe('hola …');
  });

  it('takes a null suffix as the default one', () => {
    expect(truncateText('abcdef', 4, { suffix: null } as never)).toBe('abc…');
  });

  it.each<number>([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('throws a RangeError for the maximum length %j', (maximumLength) => {
    expect(catchThrown(() => truncateText('abc', maximumLength))).toBeInstanceOf(RangeError);
  });

  it('rejects a suffix that is not a text as parseTextOption does', () => {
    expect(catchError(() => truncateText('abcdef', 4, { suffix: 5 } as never), TypeError).message).toBe(
      catchError(() => ɵparseTextOption({ options: { suffix: 5 }, name: 'suffix', fallback: '' }), TypeError).message,
    );
  });

  it.each<unknown>([null, undefined, 5, new String('abc')])('throws a TypeError for the text %j, which is not a string', (text) => {
    expect(catchThrown(() => truncateText(text as string, 2))).toBeInstanceOf(TypeError);
  });
});
