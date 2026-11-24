import { describe, expect, it, vi } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import type { FoundryValidatableControl } from '../interfaces/foundry-validatable-control.interface';
import type { FoundryValidationErrors } from '../types/foundry-validation-errors.type';
import { createControlValidator } from './create-control-validator.function';
import { isDniOrNie } from './is-dni-or-nie.function';
import { isUuid } from './is-uuid.function';

type ControlValidator = (control: FoundryValidatableControl) => FoundryValidationErrors | null;

describe('createControlValidator', () => {
  it('returns null for a valid value', () => {
    const dniValidator: ControlValidator = createControlValidator(isDniOrNie, 'dni');
    expect(dniValidator({ value: '12345678Z' })).toBeNull();
  });

  it('returns the error key for a value that is not valid, in a new object each time', () => {
    const dniValidator: ControlValidator = createControlValidator(isDniOrNie, 'dni');
    const first: FoundryValidationErrors | null = dniValidator({ value: '12345678A' });
    const second: FoundryValidationErrors | null = dniValidator({ value: '12345678A' });
    expect(first).toEqual({ dni: true });
    expect(second).toEqual({ dni: true });
    expect(first).not.toBe(second);
  });

  it.each<unknown>([null, undefined, '', []])('returns null for the empty value %j without calling the check', (value) => {
    const isValid: (value: unknown) => boolean = vi.fn(() => false);
    expect(createControlValidator(isValid, 'invalid')({ value })).toBeNull();
    expect(isValid).not.toHaveBeenCalled();
  });

  it('calls the check for a blank text, which is not empty for a validator', () => {
    expect(createControlValidator(isDniOrNie, 'dni')({ value: '   ' })).toEqual({ dni: true });
  });

  it('calls the check with the value as its only argument', () => {
    const isValid: (value: unknown) => boolean = vi.fn(() => true);
    createControlValidator(isValid, 'invalid')({ value: 'a' });
    expect(vi.mocked(isValid).mock.calls).toEqual([['a']]);
  });

  it('works with a check that has options, which never receives any', () => {
    const uuidValidator: ControlValidator = createControlValidator(isUuid, 'uuid');
    expect(uuidValidator({ value: '0190f3a1-7c2e-7a3b-8f1d-2b3c4d5e6f70' })).toBeNull();
    expect(uuidValidator({ value: 'hola' })).toEqual({ uuid: true });
  });

  it.each<unknown>([1, 'true', 'sí', undefined, null, {}])('takes only true as valid, and %j as an error', (result) => {
    expect(createControlValidator(() => result as boolean, 'invalid')({ value: 'a' })).toEqual({ invalid: true });
  });

  it('lets an error of the check through', () => {
    const failure: Error = new Error('[spec]: the check failed');
    const validator: ControlValidator = createControlValidator(() => {
      throw failure;
    }, 'invalid');
    expect(catchThrown(() => validator({ value: 'a' }))).toBe(failure);
  });

  it('writes the key __proto__ as an own property, without changing the prototype', () => {
    const errors: FoundryValidationErrors | null = createControlValidator(() => false, '__proto__')({ value: 'a' });
    expect(Object.getOwnPropertyDescriptor(errors, '__proto__')?.value).toBe(true);
    expect(Object.getPrototypeOf(errors)).toBe(Object.prototype);
  });

  it.each<[unknown, unknown]>([
    [null, 'dni'],
    ['isDniOrNie', 'dni'],
    [isDniOrNie, 5],
    [isDniOrNie, ''],
    [isDniOrNie, null],
  ])('throws a TypeError when it is created with %s and %j', (isValid, errorKey) => {
    expect(catchThrown(() => createControlValidator(isValid as (value: unknown) => boolean, errorKey as string))).toBeInstanceOf(TypeError);
  });

  it('returns a validator that works without this and leaves the control unchanged', () => {
    const dniValidator: ControlValidator = createControlValidator(isDniOrNie, 'dni');
    const control: FrozenSnapshot<FoundryValidatableControl> = freezeAndSnapshot<FoundryValidatableControl>({ value: ['12345678Z'] });
    expect(dniValidator.call(undefined, control.value)).toEqual({ dni: true });
    expect(control.listChanges()).toEqual([]);
  });
});
