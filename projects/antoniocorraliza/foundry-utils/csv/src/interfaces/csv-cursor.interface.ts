/** Place of the reading in a CSV text: offset of the next character and its physical line. */
export interface CsvCursor {
  position: number;
  line: number;
}
