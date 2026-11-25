import {
  ɵgetOwnDataEntries,
  ɵgetOwnDataValue,
  ɵgetValueTag,
  ɵisOptionsValue,
  ɵisPlainObject,
  ɵparseEnumOption,
} from '@antoniocorraliza/foundry-utils';
import { ARRAY_KEY_STYLES } from '../constants/array-key-styles.constant';
import { BLOB_TAGS } from '../constants/blob-tags.constant';
import { FORM_DATA_FILE_KEYS } from '../constants/form-data-file-keys.constant';
import type { FoundryFormDataEntries } from '../types/foundry-form-data-entries.type';

/**
 * Creates a FormData of the environment with one part per value and per element of a list, in the order of `Object.keys`, which
 * puts the keys shaped like integers first. `null` and `undefined` are left out.
 * @throws {TypeError} When the entries or the options are not valid, or a value cannot be sent in a form, with its key.
 */
export function createFormData(entries: FoundryFormDataEntries, options?: { readonly arrayKeyStyle?: 'repeat' | 'brackets' }): FormData {
  if (!ɵisPlainObject(entries)) throw new TypeError('[foundry-utils]: the entries of createFormData must be a plain object');
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of createFormData must be an object');
  const arrayKeyStyle: 'repeat' | 'brackets' = ɵparseEnumOption({
    options,
    name: 'arrayKeyStyle',
    allowedValues: ARRAY_KEY_STYLES,
    fallback: 'repeat',
  });
  const formData: FormData = new FormData();
  ɵgetOwnDataEntries(entries).forEach(([key, value]) => {
    if (!Array.isArray(value)) {
      addValue(formData, key, value, key);
      return;
    }
    const items: ReadonlyArray<unknown> = value;
    const partKey: string = arrayKeyStyle === 'brackets' ? `${key}[]` : key;
    items.forEach((item) => {
      if (Array.isArray(item)) throw new TypeError(`[foundry-utils]: the list of the key ${key} cannot hold another list`);
      addValue(formData, partKey, item, key);
    });
  });
  return formData;
}

function addValue(formData: FormData, partKey: string, value: unknown, key: string): void {
  if (value === null || value === undefined) return;
  if (BLOB_TAGS.includes(ɵgetValueTag(value))) addFile(formData, partKey, { file: value }, key);
  else if (ɵisPlainObject(value) && isFileObject(value)) addFile(formData, partKey, value, key);
  else formData.append(partKey, writeText(value, key));
}

function writeText(value: unknown, key: string): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return String(value);
  if (ɵisPlainObject(value) && isJsonObject(value)) return writeJson(ɵgetOwnDataValue(value, 'json'), key);
  throw new TypeError(`[foundry-utils]: the value of the key ${key} cannot be sent in a form`);
}

function isFileObject(value: object): boolean {
  const keys: Array<string> = Object.keys(value);
  return keys.includes('file') && keys.every((name) => FORM_DATA_FILE_KEYS.includes(name));
}

function isJsonObject(value: object): boolean {
  const keys: Array<string> = Object.keys(value);
  return keys.length === 1 && keys[0] === 'json';
}

function addFile(formData: FormData, partKey: string, fileObject: object, key: string): void {
  const file: unknown = ɵgetOwnDataValue(fileObject, 'file');
  const fileName: unknown = ɵgetOwnDataValue(fileObject, 'fileName') ?? null;
  const contentType: unknown = ɵgetOwnDataValue(fileObject, 'contentType') ?? null;
  if (!BLOB_TAGS.includes(ɵgetValueTag(file))) throw new TypeError(`[foundry-utils]: the file of the key ${key} must be a Blob or a File`);
  if (fileName !== null && (typeof fileName !== 'string' || fileName === '')) {
    throw new TypeError(`[foundry-utils]: the fileName of the key ${key} must be a text that is not empty`);
  }
  if (contentType !== null && typeof contentType !== 'string') {
    throw new TypeError(`[foundry-utils]: the contentType of the key ${key} must be a text`);
  }
  try {
    const blob: Blob = file as Blob;
    const name: string = fileName ?? (ɵgetValueTag(blob) === '[object File]' ? (blob as File).name : 'blob');
    formData.append(partKey, contentType === null ? blob : blob.slice(0, blob.size, contentType), name);
  } catch (error) {
    throw new TypeError(`[foundry-utils]: the Blob of the key ${key} does not belong to the FormData of this environment`, {
      cause: error,
    });
  }
}

function writeJson(json: unknown, key: string): string {
  try {
    const text: string | undefined = JSON.stringify(json);
    if (text !== undefined) return text;
  } catch (error) {
    throw new TypeError(`[foundry-utils]: the json of the key ${key} cannot be written as JSON`, { cause: error });
  }
  throw new TypeError(`[foundry-utils]: the json of the key ${key} has no JSON; JSON.stringify gives undefined for it`);
}
