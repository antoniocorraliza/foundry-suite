import { ɵdefineFoundryOwnProperty, ɵgetFoundryOwnDataEntries, ɵisFoundryPlainObject } from '@antoniocorraliza/foundry-utils';

/**
 * Copies the own data properties of a plain object that the filter keeps into a new object.
 * @throws {TypeError} When the object is not a plain object.
 */
export function copyOwnProperties(object: object, functionName: string, isKept: (key: string) => boolean): object {
  if (!ɵisFoundryPlainObject(object)) throw new TypeError(`[foundry-utils]: ${functionName} only accepts plain objects`);
  const result: object = {};
  ɵgetFoundryOwnDataEntries(object).forEach(([key, value]) => {
    if (isKept(key)) ɵdefineFoundryOwnProperty(result, key, value);
  });
  return result;
}
