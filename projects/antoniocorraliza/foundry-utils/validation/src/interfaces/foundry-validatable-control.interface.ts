/** Form control that a validator of `createControlValidator` reads, such as an Angular `AbstractControl`. */
export interface FoundryValidatableControl {
  /** Current value of the control. */
  readonly value: unknown;
}
