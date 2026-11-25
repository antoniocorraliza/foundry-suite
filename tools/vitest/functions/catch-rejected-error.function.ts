import { expect } from 'vitest';
import type { ErrorClass } from '../types/error-class.type';
import type { StartPromise } from '../types/start-promise.type';
import { catchRejection } from './catch-rejection.function';

/** Starts an action that returns a promise, checks that it rejects with an instance of the class, and returns the error with its type. */
export function catchRejectedError<ErrorType extends Error>(start: StartPromise, errorClass: ErrorClass<ErrorType>): Promise<ErrorType> {
  return catchRejection(start).then((rejection) => {
    expect(rejection).toBeInstanceOf(errorClass);
    return rejection as ErrorType;
  });
}
