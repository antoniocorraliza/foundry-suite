import { ɵdefineOwnProperty } from '@antoniocorraliza/foundry-utils';
import type { FoundryValidatableControl } from '../interfaces/foundry-validatable-control.interface';
import type { FoundryValidationErrors } from '../types/foundry-validation-errors.type';

function isEmptyControlValue(value: unknown): boolean {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * Creates a form validator that returns `null` for an empty or valid value and `{ [errorKey]: true }` otherwise.
 * @throws {TypeError} When `isValid` is not a function or `errorKey` is not a text that is not empty.
 */
export function createControlValidator(
  isValid: (value: unknown) => boolean,
  errorKey: string,
): (control: FoundryValidatableControl) => FoundryValidationErrors | null {
  if (typeof isValid !== 'function') throw new TypeError('[foundry-utils]: the check of createControlValidator must be a function');
  if (typeof errorKey !== 'string' || errorKey === '') {
    throw new TypeError('[foundry-utils]: the error key of createControlValidator must be a text that is not empty');
  }
  return (control) => {
    const value: unknown = control.value;
    if (isEmptyControlValue(value) || isValid(value) === true) return null;
    const errors: Record<string, true> = {};
    ɵdefineOwnProperty(errors, errorKey, true);
    return errors;
  };
}
