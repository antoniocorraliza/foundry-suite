export const TEST_FUNCTIONS: ReadonlySet<string> = new Set(['describe', 'it', 'test']);
// Review codes in a test title, also the short ones without a hyphen (R2, U17, PF1). F and A are left out of the
// short ones because F2 is a key and A1 a spreadsheet cell; with a hyphen (F-C1) the general rule catches them.
export const REVIEW_CODE: RegExp = /\b(?:(?:CORE2?|UTILS2?|UI2?|CONJ|DI|PF|F)-[A-Z0-9-]*\d|(?:PF|[BCDIMORU])\d{1,3})\b/;
