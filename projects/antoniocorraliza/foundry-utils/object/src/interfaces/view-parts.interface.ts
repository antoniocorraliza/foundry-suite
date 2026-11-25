/** Parts of a typed array or a `DataView` as the native getters read them, also for a view of another context. */
export interface ViewParts {
  readonly typedArrayName: string | null;
  readonly buffer: object;
  readonly byteOffset: number;
  readonly byteLength: number;
}
