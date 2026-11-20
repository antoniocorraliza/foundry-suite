import { toCamelCase } from '@antoniocorraliza/foundry-utils/case';
import { isPlainObject } from '@antoniocorraliza/foundry-utils/object';

export function useUtils(): ReadonlyArray<unknown> {
  return [toCamelCase('user_id'), isPlainObject({ a: 1 })];
}
