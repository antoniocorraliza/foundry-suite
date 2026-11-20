export interface FrozenSnapshot<T> {
  readonly value: T;
  changes(): Array<string>;
}
