import { describe, expect, it } from 'vitest';
import { freezeAndSnapshot } from '../../../../../../tools/vitest/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '../../../../../../tools/vitest/interfaces/frozen-snapshot.interface';
import { omitProperties } from './omit-properties.function';

class User {
  constructor(readonly firstName: string) {}

  get fullName(): string {
    return this.firstName;
  }

  label(): string {
    return this.firstName;
  }
}

class UserDto {
  firstName: string = 'Ana';
  password: string = 'secret';
}

describe('omitProperties', () => {
  it('returns a new object without the given own properties', () => {
    const input: FrozenSnapshot<{ id: number; name: string; password: string }> = freezeAndSnapshot({ id: 1, name: 'Ana', password: 'x' });
    const result: { id: number; name: string } = omitProperties(input.value, ['password']);
    expect(result).toEqual({ id: 1, name: 'Ana' });
    expect(result).not.toBe(input.value);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(input.listChanges()).toEqual([]);
  });

  it('accepts a key that the object lacks', () => {
    expect(omitProperties({ a: 1 } as { a: number; b?: number }, ['b'])).toEqual({ a: 1 });
  });

  it.each([
    ['a class instance with a getter and a method', new User('Ana')],
    ['a class instance without methods, like a NestJS DTO', new UserDto()],
    ['an array', [1, 2]],
    ['a date', new Date()],
    ['a map', new Map()],
  ])('throws a TypeError with %s', (description, value) => {
    expect(() => omitProperties(value as object, [] as Array<never>)).toThrow(TypeError);
  });

  it('works with the plain copy of a DTO', () => {
    expect(omitProperties({ ...new UserDto() }, ['password'])).toEqual({ firstName: 'Ana' });
  });

  it('keeps a __proto__ key as an own property and never changes the prototype', () => {
    const result: Record<string, unknown> = omitProperties(
      JSON.parse('{"name":"x","__proto__":{"isAdmin":true}}') as Record<string, unknown>,
      ['name'],
    );
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect((result as Record<string, unknown>)['isAdmin']).toBeUndefined();
  });

  it('does not copy accessors, non-enumerable properties or symbol keys, and never runs a getter', () => {
    const value: Record<string | symbol, unknown> = { a: 1, [Symbol('s')]: 2 };
    Object.defineProperty(value, 'hidden', { value: 3, enumerable: false });
    Object.defineProperty(value, 'computed', {
      enumerable: true,
      get: (): never => {
        throw new Error('[test]: the getter ran');
      },
    });
    expect(Reflect.ownKeys(omitProperties(value, []))).toEqual(['a']);
  });

  it('returns an object with the Object prototype from a null-prototype input', () => {
    const input: { a: number } = Object.assign(Object.create(null) as object, { a: 1 });
    expect(Object.getPrototypeOf(omitProperties(input, []))).toBe(Object.prototype);
  });
});
