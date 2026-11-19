import { ERROR_CLASS_NAME } from '../constants/size-settings.constant.ts';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import type { PublicErrorClass } from '../interfaces/public-error-class.interface.ts';

export function undeclaredErrorClasses(builtEntries: ReadonlyArray<BuiltEntry>, declared: ReadonlyArray<PublicErrorClass>): Array<string> {
  return builtEntries.flatMap((builtEntry) =>
    builtEntry.exports
      .filter((name) => ERROR_CLASS_NAME.test(name))
      .filter(
        (exported) =>
          !declared.some(
            (errorClass) =>
              errorClass.packageFolder === builtEntry.packageFolder &&
              errorClass.entry === builtEntry.entry &&
              errorClass.className === exported,
          ),
      )
      .map((exported) => `${builtEntry.specifier} exports ${exported}: add it to tools/size/constants/public-error-classes.constant.ts`),
  );
}
