import { expect } from 'vitest';
import type { ErrorClass } from '../types/error-class.type';
import { catchThrown } from './catch-thrown.function';

/** Runs an action, checks that it throws an instance of the class, and returns the error with its type. */
export function catchError<ErrorType extends Error>(action: () => unknown, errorClass: ErrorClass<ErrorType>): ErrorType {
  const thrown: unknown = catchThrown(action);
  expect(thrown).toBeInstanceOf(errorClass);
  return thrown as ErrorType;
}
