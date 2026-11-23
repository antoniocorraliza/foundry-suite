import { describe, expect, it } from 'vitest';
import { pickProperties } from './pick-properties.function';

class UserDto {
  firstName: string = 'Ana';
  password: string = 'secret';
}

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
