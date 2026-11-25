import { describe, expect, it, vi } from 'vitest';
import { isUuid } from './is-uuid.function';

const VERSION_7: string = '0190f3a1-7c2e-7a3b-8f1d-2b3c4d5e6f70';

const VERSION_4: string = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

describe('isUuid', () => {
  it.each<number>([1, 2, 3, 4, 5, 6, 7, 8])('accepts a UUID of version %i with the standard variant', (version) => {
    ['8', '9', 'a', 'b'].forEach((variant) => {
      expect(isUuid(`0190f3a1-7c2e-${version}a3b-${variant}f1d-2b3c4d5e6f70`)).toBe(true);
    });
  });

  it('accepts upper-case letters', () => {
    expect(isUuid(VERSION_7.toUpperCase())).toBe(true);
  });

  it('accepts only the given version', () => {
    expect(isUuid(VERSION_4, { version: 4 })).toBe(true);
    expect(isUuid(VERSION_7, { version: 4 })).toBe(false);
    expect(isUuid(VERSION_7, { version: 7 })).toBe(true);
  });

  it.each<string>([
    '0190f3a1-7c2e-0a3b-8f1d-2b3c4d5e6f70',
    '0190f3a1-7c2e-9a3b-8f1d-2b3c4d5e6f70',
    '0190f3a1-7c2e-7a3b-cf1d-2b3c4d5e6f70',
    '0190f3a1-7c2e-7a3b-7f1d-2b3c4d5e6f70',
  ])('rejects %j, without a version from 1 to 8 or the standard variant', (text) => {
    expect(isUuid(text)).toBe(false);
  });

  it('rejects the nil and the max UUID', () => {
    expect(isUuid('00000000-0000-0000-0000-000000000000')).toBe(false);
    expect(isUuid('ffffffff-ffff-ffff-ffff-ffffffffffff')).toBe(false);
  });

  it.each<string>([
    '0190f3a17c2e7a3b8f1d2b3c4d5e6f70',
    `{${VERSION_7}}`,
    `urn:uuid:${VERSION_7}`,
    ` ${VERSION_7}`,
    `${VERSION_7} `,
    `${VERSION_7}0`,
    '0190f3a1-7c2e-7a3b-8f1d-2b3c4d5e6f7g',
  ])('rejects %j, which is not written as a plain UUID', (text) => {
    expect(isUuid(text)).toBe(false);
  });

  it.each<unknown>([9, 0, 4.5, '4', null])('accepts every version when the version option is %j', (version) => {
    expect(isUuid(VERSION_7, { version } as never)).toBe(true);
  });

  it('does not run a getter of the version option', () => {
    const getter: () => number = vi.fn(() => 4);
    expect(isUuid(VERSION_7, Object.defineProperty({}, 'version', { get: getter, enumerable: true }))).toBe(true);
    expect(getter).not.toHaveBeenCalled();
  });

  it('cannot be passed to filter in TypeScript, but does not throw in JavaScript', () => {
    const ids: Array<unknown> = [VERSION_7, 'hola', 5];
    expect(ids.filter(isUuid as (value: unknown, index: number) => boolean)).toEqual([VERSION_7]);
    expect(ids.filter((id: unknown): boolean => isUuid(id))).toEqual([VERSION_7]);
  });

  it.each<unknown>([null, undefined, 5, new String(VERSION_7)])('returns false for %j, which is not a string', (value) => {
    expect(isUuid(value)).toBe(false);
  });
});
