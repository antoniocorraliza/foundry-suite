import type { IDENTITY_DOCUMENT_KINDS } from '../constants/identity-document-kinds.constant';

/** Kind of identity document that `isDniOrNie` accepts. */
export type IdentityDocumentKind = (typeof IDENTITY_DOCUMENT_KINDS)[number];
