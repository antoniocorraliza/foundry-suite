import { ɵdefineOwnProperty, ɵgetOwnDataEntries, ɵisPlainObject } from '@antoniocorraliza/foundry-utils';

/**
 * Copies the own data properties of a plain object that the filter keeps into a new object.
 * @throws {TypeError} When the object is not a plain object.
 */
export function copyOwnProperties(object: object, functionName: string, isKept: (key: string) => boolean): object {
  if (!ɵisPlainObject(object)) throw new TypeError(`[foundry-utils]: ${functionName} only accepts plain objects`);
  const result: object = {};
  ɵgetOwnDataEntries(object).forEach(([key, value]) => {
    if (isKept(key)) ɵdefineOwnProperty(result, key, value);
  });
  return result;
}
