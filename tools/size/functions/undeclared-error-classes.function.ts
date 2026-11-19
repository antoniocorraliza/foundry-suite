import { ERROR_CLASS_NAME } from '../constants/size-settings.constant.ts';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import type { PublicErrorClass } from '../interfaces/public-error-class.interface.ts';

export function undeclaredErrorClasses(builtEntries: ReadonlyArray<BuiltEntry>, declared: ReadonlyArray<PublicErrorClass>): Array<string> {
  const problems: Array<string> = [];
  for (const builtEntry of builtEntries) {
    for (const exported of builtEntry.exports.filter((name) => ERROR_CLASS_NAME.test(name))) {
      const isDeclared: boolean = declared.some(
        (errorClass) =>
          errorClass.packageFolder === builtEntry.packageFolder &&
          errorClass.entry === builtEntry.entry &&
          errorClass.className === exported,
      );
      if (!isDeclared) {
        problems.push(`${builtEntry.specifier} exports ${exported}: add it to tools/size/constants/public-error-classes.constant.ts`);
      }
    }
  }
  return problems;
}
