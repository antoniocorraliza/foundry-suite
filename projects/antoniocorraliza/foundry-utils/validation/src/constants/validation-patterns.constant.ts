/** Shape of an email address that an `input type="email"` accepts. */
export const EMAIL_PATTERN: RegExp =
  /^[a-zA-Z\d.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z\d](?:[a-zA-Z\d-]{0,61}[a-zA-Z\d])?(?:\.[a-zA-Z\d](?:[a-zA-Z\d-]{0,61}[a-zA-Z\d])?)*$/;
/** UUID written with hyphens, with its version as the first group and the standard variant. */
export const UUID_PATTERN: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Scheme at the start of a URL, such as `https:` or `mailto:`. */
export const URL_SCHEME_PATTERN: RegExp = /^[a-z][a-z\d+.-]*:/i;
/** Host of a URL as it is written, after its scheme and before its port, path, query or fragment. */
export const WRITTEN_URL_HOST_PATTERN: RegExp = /^[a-z][a-z\d+.-]*:\/\/([^/?#:]*)/i;
/** IPv4 address with its four numbers. */
export const IPV4_ADDRESS_PATTERN: RegExp = /^\d+\.\d+\.\d+\.\d+$/;
/** Generic phone number with an international prefix: a plus and from 8 to 15 digits that do not start with 0. */
export const INTERNATIONAL_PHONE_PATTERN: RegExp = /^\+[1-9]\d{7,14}$/;
/** Generic phone number without an international prefix: from 9 to 15 digits. */
export const LOCAL_PHONE_PATTERN: RegExp = /^\d{9,15}$/;
/** Spanish phone number: 9 digits that start with 6, 7, 8 or 9, with an optional `+34`. */
export const SPANISH_PHONE_PATTERN: RegExp = /^(?:\+34)?[6-9]\d{8}$/;
/** DNI of 8 digits or NIE of `X`, `Y` or `Z` and 7 digits, followed by the control letter. */
export const DNI_OR_NIE_PATTERN: RegExp = /^(\d{8}|[XYZ]\d{7})([A-Z])$/;
/** Control letters of a DNI or NIE, by the remainder of its number divided by 23. */
export const DNI_CONTROL_LETTERS: string = 'TRWAGMYFPDXBNJZSQVHLCKE';
