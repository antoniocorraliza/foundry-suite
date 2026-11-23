export const CAMEL_CASE_CLASS: RegExp = /^[a-z][a-zA-Z\d]*$/;
export const CLASS_BINDING: RegExp = /\[class\.([^\]\s=]+)\]/g;
export const INTERPOLATION: RegExp = /\{\{.*?\}\}/g;
export const STATIC_CLASS_ATTRIBUTE: RegExp = /(?<![\w.[-])class="([^"]*)"/g;
export const STYLE_CLASS_SELECTOR: RegExp = /\.(-?[_a-zA-Z][\w-]*)/g;
export const STYLE_DECLARATION: RegExp = /^\s*[-\w]+\s*:\s/;
export const STYLE_STRING_OR_URL: RegExp = /url\([^)]*\)|"[^"]*"|'[^']*'/g;
