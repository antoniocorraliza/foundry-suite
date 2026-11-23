import type { FoundryObjectPath } from '../types/foundry-object-path.type';

/** Writes a path as in JavaScript (`items[2].owner`), or `root` for the empty path. */
export function ɵformatObjectPath(path: FoundryObjectPath): string {
  if (path.length === 0) return 'root';
  return path
    .map((segment, index) => {
      if (typeof segment === 'number') return `[${segment}]`;
      if (/^[A-Za-z_$][\w$]*$/.test(segment)) return index === 0 ? segment : `.${segment}`;
      return `[${JSON.stringify(segment)}]`;
    })
    .join('');
}
