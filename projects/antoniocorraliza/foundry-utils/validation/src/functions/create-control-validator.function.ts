import type { FoundryValidatableControl } from '../interfaces/foundry-validatable-control.interface';
import type { FoundryValidationErrors } from '../types/foundry-validation-errors.type';

/**
 * Creates a form validator that returns `null` for an empty or valid value and `{ [errorKey]: true }` otherwise.
 * @throws {TypeError} When `isValid` is not a function or `errorKey` is not a text with characters.
 */
export function createControlValidator(
  isValid: (value: unknown) => boolean,
  errorKey: string,
): (control: FoundryValidatableControl) => FoundryValidationErrors | null {
  throw new Error('[foundry-utils]: not implemented yet');
}
