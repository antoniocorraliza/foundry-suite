import type { KeyFrame } from '../interfaces/key-frame.interface';

/** Splits a key into its leading underscores, the words between its separators and its trailing underscores. */
export function splitKey(key: string): KeyFrame {
  const leading: string = /^_*/.exec(key)?.[0] ?? '';
  const rest: string = key.slice(leading.length);
  let bodyEnd: number = rest.length;
  while (bodyEnd > 0 && rest[bodyEnd - 1] === '_') bodyEnd -= 1;
  const body: string = rest.slice(0, bodyEnd);
  return { leading, words: body.split(/[_\- ]+/).filter((word) => word !== ''), trailing: rest.slice(bodyEnd) };
}
