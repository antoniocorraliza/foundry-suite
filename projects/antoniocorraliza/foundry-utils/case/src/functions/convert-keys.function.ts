import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import {
  FoundryCircularReferenceError,
  ɵdefineFoundryOwnProperty,
  ɵgetFoundryOwnDataEntries,
  ɵgetFoundryValueKind,
  ɵisFoundryOptionsValue,
} from '@antoniocorraliza/foundry-utils';
import { FoundryKeyCollisionError } from '../errors/foundry-key-collision.error';
import type { KeyConversion } from '../interfaces/key-conversion.interface';
import type { CollisionMode } from '../types/collision-mode.type';

function collisionMode(options: unknown): CollisionMode {
  if (!ɵisFoundryOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of the key conversion must be an object');
  const mode: unknown = options?.['onCollision'] ?? 'error';
  if (mode === 'error' || mode === 'keepFirst' || mode === 'keepLast') return mode;
  throw new TypeError(`[foundry-utils]: unknown onCollision option ${String(mode)}`);
}

function convertObject(object: object, path: FoundryObjectPath, ancestors: ReadonlyArray<object>, conversion: KeyConversion): object {
  const result: object = {};
  const originalKeys: Map<string, string> = new Map<string, string>();
  ɵgetFoundryOwnDataEntries(object).forEach(([key, value]) => {
    const convertedKey: string = conversion.convertKey(key);
    const firstKey: string | undefined = originalKeys.get(convertedKey);
    if (firstKey !== undefined && conversion.mode === 'error') {
      throw new FoundryKeyCollisionError({ path, originalKeys: [firstKey, key], convertedKey });
    }
    if (firstKey !== undefined && conversion.mode === 'keepFirst') return;
    if (firstKey === undefined) originalKeys.set(convertedKey, key);
    ɵdefineFoundryOwnProperty(result, convertedKey, convertValue(value, [...path, key], [...ancestors, object], conversion));
  });
  return result;
}

function convertValue(value: unknown, path: FoundryObjectPath, ancestors: ReadonlyArray<object>, conversion: KeyConversion): unknown {
  const kind: string = ɵgetFoundryValueKind(value);
  if (kind !== 'array' && kind !== 'plainObject') return value;
  const object: object = value as object;
  if (ancestors.includes(object)) throw new FoundryCircularReferenceError({ path });
  if (Array.isArray(object)) {
    return object.map((item: unknown, index) => convertValue(item, [...path, index], [...ancestors, object], conversion));
  }
  return convertObject(object, path, ancestors, conversion);
}

/**
 * Converts the keys of the plain objects of a value, in depth, with the given key conversion.
 * @throws {FoundryKeyCollisionError} When two keys of one object convert to the same key.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function convertKeys(value: unknown, options: unknown, convertKey: (key: string) => string): unknown {
  return convertValue(value, [], [], { convertKey, mode: collisionMode(options) });
}
