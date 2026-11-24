import { ɵgetOwnDataValue } from '@antoniocorraliza/foundry-utils';
import { IDENTITY_DOCUMENT_KINDS } from '../constants/identity-document-kinds.constant';
import { readDniOrNie } from './read-dni-or-nie.function';

/** Tells whether a value is a Spanish DNI or NIE with its control letter, with or without spaces, dots and a hyphen. */
export function isDniOrNie(value: unknown, options?: { readonly accept?: ReadonlyArray<'dni' | 'nie'> }): boolean {
  return readDniOrNie(value, readAcceptedKinds(ɵgetOwnDataValue(options, 'accept'))) !== null;
}

function readAcceptedKinds(accept: unknown): ReadonlyArray<'dni' | 'nie'> {
  const isKindList: boolean =
    Array.isArray(accept) && accept.length > 0 && accept.every((kind) => IDENTITY_DOCUMENT_KINDS.some((known) => known === kind));
  return isKindList ? (accept as ReadonlyArray<'dni' | 'nie'>) : IDENTITY_DOCUMENT_KINDS;
}
