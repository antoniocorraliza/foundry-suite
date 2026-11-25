/** File of a form with its own name and type. */
export interface FoundryFormDataFile {
  /** The Blob or File to send. */
  readonly file: Blob;
  /** Name of the part. By default, the name of the File, or `'blob'` for a Blob. */
  readonly fileName?: string;
  /** Type of the part. By default, the type of the Blob. */
  readonly contentType?: string;
}
