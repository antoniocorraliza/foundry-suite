import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import {
  FoundryCircularReferenceError,
  ɵcheckOptions,
  ɵcopyArrayItems,
  ɵdefineOwnProperty,
  ɵgetOwnDataEntries,
  ɵisPlainObject,
  ɵparseEnumOption,
} from '@antoniocorraliza/foundry-utils';
import { COLLISION_MODES } from '../constants/collision-modes.constant';
import { FoundryKeyCollisionError } from '../errors/foundry-key-collision.error';
import type { KeyConversion } from '../interfaces/key-conversion.interface';
import type { CollisionMode } from '../types/collision-mode.type';

function convertObject(object: object, path: FoundryObjectPath, inner: ReadonlyArray<object>, conversion: KeyConversion): object {
  const result: object = {};
  const originalKeys: Map<string, string> = new Map<string, string>();
  ɵgetOwnDataEntries(object).forEach(([key, value]) => {
    const convertedKey: string = conversion.convertKey(key);
    const firstKey: string | undefined = originalKeys.get(convertedKey);
    if (firstKey === undefined) originalKeys.set(convertedKey, key);
    else if (conversion.mode === 'error') throw new FoundryKeyCollisionError({ path, originalKeys: [firstKey, key], convertedKey });
    else if (conversion.mode === 'keepFirst') return;
    ɵdefineOwnProperty(result, convertedKey, convertValue(value, [...path, key], inner, conversion));
  });
  return result;
}

function convertValue(value: unknown, path: FoundryObjectPath, ancestors: ReadonlyArray<object>, conversion: KeyConversion): unknown {
  if (!Array.isArray(value) && !ɵisPlainObject(value)) return value;
  if (ancestors.includes(value)) throw new FoundryCircularReferenceError({ path });
  const inner: ReadonlyArray<object> = [...ancestors, value];
  if (Array.isArray(value)) return ɵcopyArrayItems(value).map((item, index) => convertValue(item, [...path, index], inner, conversion));
  return convertObject(value, path, inner, conversion);
}

/**
 * Converts the keys of the plain objects of a value, in depth, with the given key conversion.
 * @throws {FoundryKeyCollisionError} When two keys of one object convert to the same key.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function convertKeys(value: unknown, options: unknown, convertKey: (key: string) => string): unknown {
  ɵcheckOptions(options, 'the key conversion');
  const mode: CollisionMode = ɵparseEnumOption({ options, name: 'onCollision', allowedValues: COLLISION_MODES, fallback: 'error' });
  return convertValue(value, [], [], { convertKey, mode });
}
