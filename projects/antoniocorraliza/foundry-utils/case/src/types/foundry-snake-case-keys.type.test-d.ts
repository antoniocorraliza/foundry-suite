import { describe, expectTypeOf, it } from 'vitest';
import { toSnakeCaseKeys } from '../functions/to-snake-case-keys.function';
import type { FoundrySnakeCaseKeys } from './foundry-snake-case-keys.type';

interface Ticket {
  readonly ticketId: string;
  readonly dueDate?: Date;
  readonly lineItems: ReadonlyArray<{ readonly unitPrice: number }>;
}

describe('FoundrySnakeCaseKeys', () => {
  it('computes the snake_case wire shape from the model, in depth', () => {
    expectTypeOf<FoundrySnakeCaseKeys<Ticket>>().toEqualTypeOf<{
      readonly ticket_id: string;
      readonly due_date?: Date;
      readonly line_items: ReadonlyArray<{ readonly unit_price: number }>;
    }>();
  });

  it('leaves built-in objects as they are', () => {
    expectTypeOf(toSnakeCaseKeys({ dueDate: new Date() })).toEqualTypeOf<{ due_date: Date }>();
  });
});
