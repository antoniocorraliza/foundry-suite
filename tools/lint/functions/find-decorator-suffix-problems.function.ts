import { CLASS_DECORATOR } from '../constants/class-decorator.constant.ts';
import { DECORATOR_SUFFIXES } from '../constants/decorator-suffixes.constant.ts';

export function findDecoratorSuffixProblems(path: string, text: string): Array<string> {
  return [...text.matchAll(CLASS_DECORATOR)]
    .map((match) => match[1] ?? '')
    .filter((decorator) => !path.endsWith(DECORATOR_SUFFIXES[decorator] ?? ''))
    .map((decorator) => `${path}: a class with @${decorator} goes in a file that ends in ${DECORATOR_SUFFIXES[decorator] ?? ''}`);
}
