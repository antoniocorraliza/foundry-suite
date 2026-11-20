import { SIZE_TOOLS } from '../constants/size-tools.constant.ts';
import type { SizeFigures } from '../interfaces/size-figures.interface.ts';
import type { SizeReference } from '../types/size-reference.type.ts';

export function findGrownMeasurements(base: SizeReference, head: SizeReference): Array<string> {
  return Object.keys(head)
    .filter((name) =>
      SIZE_TOOLS.some((tool) => {
        const before: SizeFigures | undefined = base[name]?.[tool];
        const after: SizeFigures | undefined = head[name]?.[tool];
        return before !== undefined && after !== undefined && (after.raw > before.raw || after.gzip > before.gzip);
      }),
    )
    .sort();
}
