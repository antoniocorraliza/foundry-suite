import { IDENTITY_DOCUMENT_KINDS } from '../constants/identity-document-kinds.constant';
import type { IdentityDocumentKind } from '../types/identity-document-kind.type';

/** Tells whether a value is a list, not empty, of the kinds of document that `isDniOrNie` accepts. */
export function isDocumentKindList(value: unknown): value is ReadonlyArray<IdentityDocumentKind> {
  return Array.isArray(value) && value.length > 0 && value.every((kind) => IDENTITY_DOCUMENT_KINDS.some((known) => known === kind));
}
