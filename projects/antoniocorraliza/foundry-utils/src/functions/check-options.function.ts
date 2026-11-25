import { ɵisOptionsValue } from './is-options-value.function';

/**
 * Checks that the options of a function are missing or an object, and names the function in the error.
 * @throws {TypeError} When the options are neither `undefined` nor an object.
 */
export function ɵcheckOptions(options: unknown, owner: string): asserts options is Readonly<Record<string, unknown>> | undefined {
  if (!ɵisOptionsValue(options)) throw new TypeError(`[foundry-utils]: the options of ${owner} must be an object`);
}
