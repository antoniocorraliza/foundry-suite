import { ɵgetOwnDataValue } from '@antoniocorraliza/foundry-utils';
import { IDENTITY_DOCUMENT_KINDS } from '../constants/identity-document-kinds.constant';
import { isDocumentKindList } from './is-document-kind-list.function';
import { readDniOrNie } from './read-dni-or-nie.function';

/** Tells whether a value is a Spanish DNI or NIE with its control letter, with or without spaces, dots and a hyphen. */
export function isDniOrNie(value: unknown, options?: { readonly accept?: ReadonlyArray<'dni' | 'nie'> }): boolean {
  const accept: unknown = ɵgetOwnDataValue(options, 'accept');
  return readDniOrNie(value, isDocumentKindList(accept) ? accept : IDENTITY_DOCUMENT_KINDS) !== null;
}
