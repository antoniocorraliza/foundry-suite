import { describe, expect, it } from 'vitest';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { omitProperties } from './omit-properties.function';
import { pickProperties } from './pick-properties.function';

interface PropertySelectionCase {
  readonly name: string;
  readonly selectEveryProperty: (value: object) => object;
}

class User {
  constructor(readonly firstName: string) {}

  get fullName(): string {
    return this.firstName;
  }

  getLabel(): string {
    return this.firstName;
  }
}

class UserDto {
  firstName: string = 'Ana';
  password: string = 'secret';
}

const PROPERTY_SELECTIONS: ReadonlyArray<PropertySelectionCase> = [
  { name: 'pickProperties', selectEveryProperty: (value) => pickProperties(value, Reflect.ownKeys(value) as Array<never>) },
  { name: 'omitProperties', selectEveryProperty: (value) => omitProperties(value, [] as Array<never>) },
];

describe.each(PROPERTY_SELECTIONS)('$name', ({ selectEveryProperty }) => {
  it('returns a new object with the Object prototype, without changing the input', () => {
    const input: FrozenSnapshot<{ id: number; name: string }> = freezeAndSnapshot({ id: 1, name: 'Ana' });
    const result: object = selectEveryProperty(input.value);
    expect(result).toEqual({ id: 1, name: 'Ana' });
    expect(result).not.toBe(input.value);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(input.listChanges()).toEqual([]);
  });

  it.each([
    ['a class instance with a getter and a method', new User('Ana')],
    ['a class instance without methods, like a NestJS DTO', new UserDto()],
    ['an array', [1, 2]],
    ['a date', new Date()],
    ['a map', new Map()],
  ])('throws a TypeError with %s', (description, value) => {
    expect(() => selectEveryProperty(value)).toThrow(TypeError);
  });

  it('keeps a __proto__ key as an own property and never changes the prototype', () => {
    const result: Record<string, unknown> = selectEveryProperty(
      JSON.parse('{"name":"x","__proto__":{"isAdmin":true}}') as object,
    ) as Record<string, unknown>;
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect(result['isAdmin']).toBeUndefined();
  });

  it('ignores accessors, non-enumerable properties and symbol keys, also when asked for them, and never runs a getter', () => {
    const value: Record<string | symbol, unknown> = { a: 1, [Symbol('s')]: 2 };
    Object.defineProperty(value, 'hidden', { value: 3, enumerable: false });
    Object.defineProperty(value, 'computed', {
      enumerable: true,
      get: (): never => {
        throw new Error('[test]: the getter ran');
      },
    });
    expect(Reflect.ownKeys(selectEveryProperty(value))).toEqual(['a']);
  });

  it('returns an object with the Object prototype from a null-prototype input', () => {
    const input: object = Object.assign(Object.create(null) as object, { a: 1 });
    expect(Object.getPrototypeOf(selectEveryProperty(input))).toBe(Object.prototype);
  });
});

describe('pickProperties', () => {
  it('returns only the given own properties', () => {
    expect(pickProperties({ id: 1, name: 'Ana', password: 'x' }, ['id', 'name'])).toEqual({ id: 1, name: 'Ana' });
  });

  it('does not create a property that the object lacks', () => {
    expect(Object.keys(pickProperties({ a: 1 } as { a: number; b?: number }, ['b']))).toEqual([]);
  });

  it('works with the plain copy of a DTO', () => {
    expect(pickProperties({ ...new UserDto() }, ['firstName'])).toEqual({ firstName: 'Ana' });
  });
});
