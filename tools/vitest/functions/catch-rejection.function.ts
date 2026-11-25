import { expect } from 'vitest';
import type { StartPromise } from '../types/start-promise.type';

/** Starts an action that returns a promise, checks that starting it throws nothing, and returns the rejection, or `null` when it resolves. */
export async function catchRejection(start: StartPromise): Promise<unknown> {
  let promise: Promise<unknown> | null = null;
  expect(() => {
    promise = start();
  }).not.toThrow();
  try {
    await promise;
  } catch (rejection) {
    return rejection;
  }
  return null;
}
