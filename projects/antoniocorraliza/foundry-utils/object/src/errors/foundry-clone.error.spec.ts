import { describe, expect, it } from 'vitest';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import { FoundryCloneError } from './foundry-clone.error';

describe('FoundryCloneError', () => {
  it('is a FoundryUtilsError with its own name and the details as properties', () => {
    const error: FoundryCloneError = new FoundryCloneError({ path: ['items', 2, 'owner'], valueDescription: 'class Ticket' });
    expect(error).toBeInstanceOf(FoundryUtilsError);
    expect(error.name).toBe('FoundryCloneError');
    expect(error.path).toEqual(['items', 2, 'owner']);
    expect(error.valueDescription).toBe('class Ticket');
  });

  it('writes the path as in JavaScript and the description in the message', () => {
    const error: FoundryCloneError = new FoundryCloneError({ path: ['items', 2, 'owner'], valueDescription: 'class Ticket' });
    expect(error.message).toMatch(/^\[foundry-utils\]: [^A-Z].*[^.]$/);
    expect(error.message).toContain('items[2].owner');
    expect(error.message).toContain('class Ticket');
    expect(new FoundryCloneError({ path: [], valueDescription: 'function' }).message).toContain('root');
  });

  it('keeps the cause', () => {
    const original: Error = new Error('[test]: original');
    expect(new FoundryCloneError({ path: [], valueDescription: 'Error' }, { cause: original }).cause).toBe(original);
  });
});
