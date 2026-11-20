import { describe, expect, it } from 'vitest';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import { FoundryKeyCollisionError } from './foundry-key-collision.error';

describe('FoundryKeyCollisionError', () => {
  it('is a FoundryUtilsError with its own name and the details as properties', () => {
    const error: FoundryKeyCollisionError = new FoundryKeyCollisionError({
      path: ['items', 2],
      originalKeys: ['user_id', 'userId'],
      convertedKey: 'userId',
    });
    expect(error).toBeInstanceOf(FoundryUtilsError);
    expect(error.name).toBe('FoundryKeyCollisionError');
    expect(error.path).toEqual(['items', 2]);
    expect(error.originalKeys).toEqual(['user_id', 'userId']);
    expect(error.convertedKey).toBe('userId');
  });

  it('writes the path and both keys in the message', () => {
    const error: FoundryKeyCollisionError = new FoundryKeyCollisionError({
      path: ['items', 2],
      originalKeys: ['user_id', 'userId'],
      convertedKey: 'userId',
    });
    expect(error.message).toMatch(/^\[foundry-utils\]: [^A-Z].*[^.]$/);
    expect(error.message).toContain('items[2]');
    expect(error.message).toContain('user_id');
    expect(error.message).toContain('userId');
  });

  it('keeps the cause', () => {
    const original: Error = new Error('[test]: original');
    const error: FoundryKeyCollisionError = new FoundryKeyCollisionError(
      { path: [], originalKeys: ['a_b', 'aB'], convertedKey: 'aB' },
      { cause: original },
    );
    expect(error.cause).toBe(original);
  });
});
