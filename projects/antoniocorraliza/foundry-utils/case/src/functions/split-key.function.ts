import type { KeyFrame } from '../interfaces/key-frame.interface';

/** Splits a key into its leading underscores, the words between its separators and its trailing underscores. */
export function splitKey(key: string): KeyFrame {
  const leading: string = /^_*/.exec(key)?.[0] ?? '';
  const rest: string = key.slice(leading.length);
  const trailing: string = /_*$/.exec(rest)?.[0] ?? '';
  const body: string = rest.slice(0, rest.length - trailing.length);
  return { leading, words: body.split(/[_\- ]+/).filter((word) => word !== ''), trailing };
}
