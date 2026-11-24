/** Number format of the formatting functions, with the text they return when there is no number to write. */
export interface NumberWriter {
  readonly format: Intl.NumberFormat;
  readonly fallback: string;
}
