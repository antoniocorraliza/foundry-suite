import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { describe, expectTypeOf, it } from 'vitest';
import { createControlValidator } from './create-control-validator.function';
import { isDniOrNie } from './is-dni-or-nie.function';
import { isUuid } from './is-uuid.function';

describe('createControlValidator with the types of Angular forms', () => {
  it('returns a function that Angular accepts as a ValidatorFn', () => {
    expectTypeOf(createControlValidator(isDniOrNie, 'dni')).toExtend<ValidatorFn>();
    expectTypeOf(createControlValidator(isUuid, 'uuid')).toExtend<ValidatorFn>();
  });

  it('fits in the list of validators of a form control', () => {
    expectTypeOf([createControlValidator(isDniOrNie, 'dni')]).toExtend<Array<ValidatorFn>>();
  });

  it('takes an Angular control and returns what Angular reads as its errors', () => {
    expectTypeOf<AbstractControl>().toExtend<Parameters<ReturnType<typeof createControlValidator>>[0]>();
    expectTypeOf(createControlValidator(isDniOrNie, 'dni')).returns.toExtend<ValidationErrors | null>();
  });
});
