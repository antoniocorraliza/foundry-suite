import { EMAIL_PATTERN } from '../constants/validation-patterns.constant';

/** Tells whether a value is a text with the shape of an email address, as an `input type="email"` checks it. */
export function isEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_PATTERN.test(value);
}
