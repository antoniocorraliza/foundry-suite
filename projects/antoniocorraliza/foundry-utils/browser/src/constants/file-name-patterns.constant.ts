/** Character that a file name cannot have: a forbidden one of Windows or a control character. */
export const FORBIDDEN_FILE_NAME_CHARACTER: RegExp = /[/\\:*?"<>|\p{Cc}]/gu;
/** Spaces and dots at the end of a file name, which Windows removes. */
export const FINAL_SPACES_AND_DOTS: RegExp = /[ .]+$/;
/** Device name that Windows reserves with any extension, in any case. */
export const WINDOWS_RESERVED_NAME: RegExp = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
