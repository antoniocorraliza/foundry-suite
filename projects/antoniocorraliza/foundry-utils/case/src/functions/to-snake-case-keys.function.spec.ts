import { describe, expect, it } from 'vitest';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { toSnakeCaseKeys } from './to-snake-case-keys.function';

describe('toSnakeCaseKeys', () => {
  it('converts the keys of nested plain objects and arrays without changing the input', () => {
    const input: FrozenSnapshot<object> = freezeAndSnapshot({
      userName: 'Ana',
      homeAddress: { streetName: 'Mayor' },
      orderLines: [{ unitPrice: 2 }],
    });
    expect(toSnakeCaseKeys(input.value)).toEqual({
      user_name: 'Ana',
      home_address: { street_name: 'Mayor' },
      order_lines: [{ unit_price: 2 }],
    });
    expect(input.listChanges()).toEqual([]);
  });
});
