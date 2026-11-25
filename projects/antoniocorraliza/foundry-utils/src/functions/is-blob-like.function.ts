import { BLOB_TAGS } from '../constants/blob-tags.constant';
import { ɵgetValueTag } from './get-value-tag.function';

/** Tells whether a value is a `Blob` or a `File`, by its tag, so a value created in another context also counts. */
export function ɵisBlobLike(value: unknown): value is Blob {
  return BLOB_TAGS.includes(ɵgetValueTag(value));
}
