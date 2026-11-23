import { describe, expect, it } from 'vitest';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { toCamelCaseKeys } from './to-camel-case-keys.function';

describe('toCamelCaseKeys', () => {
  it('converts the keys of nested plain objects and arrays without changing the input', () => {
    const input: FrozenSnapshot<object> = freezeAndSnapshot({
      user_name: 'Ana',
      home_address: { street_name: 'Mayor' },
      order_lines: [{ unit_price: 2 }],
    });
    expect(toCamelCaseKeys(input.value)).toEqual({ userName: 'Ana', homeAddress: { streetName: 'Mayor' }, orderLines: [{ unitPrice: 2 }] });
    expect(input.listChanges()).toEqual([]);
  });
});
