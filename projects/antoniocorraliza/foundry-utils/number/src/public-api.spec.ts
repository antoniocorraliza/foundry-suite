import { describe, expect, it } from 'vitest';
import { ɵcheckOptions } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { isPromiseLike } from '@foundry-test/functions/is-promise-like.function';
import { listFunctionNames } from '@foundry-test/functions/list-function-names.function';
import type { CallWithOptions } from '@foundry-test/types/call-with-options.type';
import type { LooseFunction } from '@foundry-test/types/loose-function.type';
import * as entry from './public-api';

const OPTION_USERS: ReadonlyArray<[string, CallWithOptions]> = [
  ['roundToDecimals', (options) => entry.roundToDecimals(1.5, 0, options as never)],
  ['parseDecimal', (options) => entry.parseDecimal('1', options as never)],
];

const SAMPLE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [
  ['clampNumber', [5, 0, 10]],
  ['createCurrencyFormatter', [{ locale: 'es-ES', currency: 'EUR' }]],
  ['formatCurrency', [1, { locale: 'es-ES', currency: 'EUR' }]],
  ['formatNumber', [1, { locale: 'es-ES' }]],
  ['getParseDecimalOptions', ['es-ES']],
  ['padNumber', [5, 2]],
  ['parseDecimal', ['1', { decimalSeparator: ',' }]],
  ['roundToDecimals', [1.5, 0]],
];

describe('public API of the number entry', () => {
  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual([
      'clampNumber',
      'createCurrencyFormatter',
      'formatCurrency',
      'formatNumber',
      'getParseDecimalOptions',
      'padNumber',
      'parseDecimal',
      'roundToDecimals',
    ]);
  });

  it('has a sample call for each export', () => {
    expect(SAMPLE_CALLS.map(([name]) => name).sort()).toEqual(listFunctionNames(entry));
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    expect(isPromiseLike((entry[name] as LooseFunction)(...values))).toBe(false);
  });

  it.each(OPTION_USERS)(
    'throws a TypeError through %s for options that are not an object, naming that function',
    (name, callWithOptions) => {
      expect(catchError(() => callWithOptions(5), TypeError).message).toBe(catchError(() => ɵcheckOptions(5, name), TypeError).message);
    },
  );
});
