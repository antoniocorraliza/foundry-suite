import { ɵisFoundryPlainObject } from '@antoniocorraliza/foundry-utils';

/** Tells whether a value is a plain object: null prototype, or a prototype whose constructor is `Object` in any context. */
export function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return ɵisFoundryPlainObject(value);
}
