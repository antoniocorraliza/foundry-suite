import { describe, expect, it } from 'vitest';
import { omitProperties } from './omit-properties.function';

class UserDto {
  firstName: string = 'Ana';
  password: string = 'secret';
}

describe('omitProperties', () => {
  it('returns every own property except the given ones', () => {
    expect(omitProperties({ id: 1, name: 'Ana', password: 'x' }, ['password'])).toEqual({ id: 1, name: 'Ana' });
  });

  it('accepts a key that the object lacks', () => {
    expect(omitProperties({ a: 1 } as { a: number; b?: number }, ['b'])).toEqual({ a: 1 });
  });

  it('works with the plain copy of a DTO', () => {
    expect(omitProperties({ ...new UserDto() }, ['password'])).toEqual({ firstName: 'Ana' });
  });
});
