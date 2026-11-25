/** Lists, in alphabetical order, the exports of an entry that are functions and not classes, which start with an upper-case letter. */
export function listFunctionNames(entry: object): Array<string> {
  return Object.entries(entry)
    .filter(([name, value]) => typeof value === 'function' && /^[a-z]/.test(name))
    .map(([name]) => name)
    .sort();
}
