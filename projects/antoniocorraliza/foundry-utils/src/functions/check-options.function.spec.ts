import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { ɵcheckOptions } from './check-options.function';

describe('ɵcheckOptions', () => {
  it.each<unknown>([undefined, {}, { mode: 'up' }, Object.create(null) as object])('accepts the options %j', (options) => {
    expect(() => ɵcheckOptions(options, 'parseDate')).not.toThrow();
  });

  it.each<unknown>([null, 5, 'es-ES', true, [], () => ({})])('throws a TypeError for the options %j, naming the function', (options) => {
    expect(catchError(() => ɵcheckOptions(options, 'parseDate'), TypeError).message).toBe(
      '[foundry-utils]: the options of parseDate must be an object',
    );
  });
});
