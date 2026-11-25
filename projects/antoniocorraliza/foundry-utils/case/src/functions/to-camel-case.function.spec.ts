import { afterEach, describe, expect, it, vi } from 'vitest';
import { measureMilliseconds } from '@foundry-test/functions/measure-milliseconds.function';
import { toCamelCase } from './to-camel-case.function';

describe('toCamelCase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['valid_until', 'validUntil'],
    ['paid_amount', 'paidAmount'],
    ['grid_size', 'gridSize'],
    ['user_id', 'userId'],
    ['android_id', 'androidId'],
    ['orderId', 'orderId'],
    ['_id', '_id'],
    ['parentCategoryId', 'parentCategoryId'],
    ['lastPaidId', 'lastPaidId'],
    ['user_ID', 'userId'],
    ['USER_NAME', 'userName'],
    ['IBAN', 'iban'],
    ['userID', 'userID'],
    ['__v', '__v'],
    ['_user_name_', '_userName_'],
    ['content-type', 'contentType'],
    ['user name', 'userName'],
    ['parent_categoryId', 'parentCategoryId'],
    ['user__name', 'userName'],
    ['ID', 'id'],
    ['UserName', 'userName'],
  ])('converts %s to %s', (key, expected) => {
    expect(toCamelCase(key)).toBe(expected);
  });

  it.each([
    ['', ''],
    ['_', '_'],
    ['__', '__'],
    ['-user-name-', 'userName'],
    [' id ', 'id'],
  ])('converts the edge key %j to %j', (key, expected) => {
    expect(toCamelCase(key)).toBe(expected);
  });

  it.each([
    ['año_nacimiento', 'añoNacimiento'],
    ['ÑU_ID', 'ñuId'],
    ['2fa_code', '2faCode'],
    ['名前_id', '名前Id'],
  ])('uses Unicode letter case and treats characters without case as digits: %s', (key, expected) => {
    expect(toCamelCase(key)).toBe(expected);
  });

  it('does not depend on the locale', () => {
    vi.spyOn(String.prototype, 'toLocaleLowerCase').mockImplementation(function (this: string): string {
      return this.replaceAll('I', 'ı').toLowerCase();
    });
    vi.spyOn(String.prototype, 'toLocaleUpperCase').mockImplementation(function (this: string): string {
      return this.replaceAll('i', 'İ').toUpperCase();
    });
    expect(toCamelCase('ID')).toBe('id');
    expect(toCamelCase('user_id')).toBe('userId');
  });

  it('converts a key of 100,000 characters with a long run of inner underscores in less than 50 ms', () => {
    const key: string = `a${'_'.repeat(99_998)}b`;
    expect(measureMilliseconds(() => toCamelCase(key))).toBeLessThan(50);
    expect(toCamelCase(key)).toBe('aB');
  });
});
