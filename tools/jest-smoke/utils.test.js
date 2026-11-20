import { describe, expect, it } from '@jest/globals';
import { runInNewContext } from 'node:vm';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import { FoundryKeyCollisionError, toCamelCaseKeys } from '@antoniocorraliza/foundry-utils/case';
import { deepClone, isPlainObject } from '@antoniocorraliza/foundry-utils/object';

describe('Foundry Utils under Jest with jsdom', () => {
  it('keeps a jsdom file by reference in a deep clone', () => {
    const doc = new File(['x'], 'a.txt');
    expect(deepClone({ doc }).doc).toBe(doc);
  });

  it('tells plain objects from other objects in any context', () => {
    expect(isPlainObject(new File(['x'], 'a.txt'))).toBe(false);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(JSON.parse('{"a":1}'))).toBe(true);
    expect(isPlainObject(runInNewContext('({ a: 1 })'))).toBe(true);
  });

  it('converts keys and throws its named errors', () => {
    expect(toCamelCaseKeys({ user_id: 1, items: [{ created_at: 'x' }] })).toEqual({ userId: 1, items: [{ createdAt: 'x' }] });
    const action = () => toCamelCaseKeys({ user_id: 1, userId: 2 });
    expect(action).toThrow(FoundryKeyCollisionError);
    expect(action).toThrow(FoundryUtilsError);
  });
});
