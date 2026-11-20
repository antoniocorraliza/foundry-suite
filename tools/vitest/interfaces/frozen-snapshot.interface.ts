export interface FrozenSnapshot<T> {
  readonly value: T;
  listChanges(): Array<string>;
}
