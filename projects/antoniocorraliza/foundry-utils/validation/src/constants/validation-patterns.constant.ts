/** Shape of an email address that an `input type="email"` accepts. */
export const EMAIL_PATTERN: RegExp =
  /^[a-zA-Z\d.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z\d](?:[a-zA-Z\d-]{0,61}[a-zA-Z\d])?(?:\.[a-zA-Z\d](?:[a-zA-Z\d-]{0,61}[a-zA-Z\d])?)*$/;
/** UUID written with hyphens, with its version as the first group and the standard variant. */
export const UUID_PATTERN: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Scheme at the start of a URL, such as `https:` or `mailto:`. */
export const URL_SCHEME_PATTERN: RegExp = /^[a-z][a-z\d+.-]*:/i;
/** Host of a URL as it is written, after its scheme and before its port, path, query or fragment. */
export const WRITTEN_URL_HOST_PATTERN: RegExp = /^[a-z][a-z\d+.-]*:\/\/([^/?#:]*)/i;
/** Host that the URL parser writes for an IPv4 address, also when the text gave a shorter or hexadecimal one. */
export const IPV4_ADDRESS_PATTERN: RegExp = /^\d+\.\d+\.\d+\.\d+$/;
/** Generic phone number with an international prefix: a plus and from 8 to 15 digits that do not start with 0. */
export const INTERNATIONAL_PHONE_PATTERN: RegExp = /^\+[1-9]\d{7,14}$/;
/** Generic phone number without an international prefix: from 9 to 15 digits. */
export const LOCAL_PHONE_PATTERN: RegExp = /^\d{9,15}$/;
/** Spanish phone number: 9 digits that start with 6, 7, 8 or 9, with an optional `+34`. */
export const SPANISH_PHONE_PATTERN: RegExp = /^(?:\+34)?[6-9]\d{8}$/;
/** Letters that start a NIE, in the order of the digit that each one stands for. */
export const NIE_PREFIXES: string = 'XYZ';
/** DNI of 8 digits or NIE of a letter of `NIE_PREFIXES` and 7 digits, followed by the control letter, with named groups. */
export const DNI_OR_NIE_PATTERN: RegExp = /* @__PURE__ */ new RegExp(
  `^(?:(?<niePrefix>[${NIE_PREFIXES}])(?<nieDigits>\\d{7})|(?<dniDigits>\\d{8}))(?<letter>[A-Z])$`,
  'u',
);
/** Control letters of a DNI or NIE, by the remainder of its number divided by 23. */
export const DNI_CONTROL_LETTERS: string = 'TRWAGMYFPDXBNJZSQVHLCKE';
