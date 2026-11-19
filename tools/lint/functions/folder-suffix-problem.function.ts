import { FOLDER_SUFFIXES } from '../constants/folder-suffixes.constant.ts';

export function folderSuffixProblem(path: string): string | undefined {
  const segments: Array<string> = path.split('/');
  const fileName: string = (segments.pop() ?? '').replace(/\.spec\.ts$/, '.ts');
  const nearestKindFolder: string | undefined = segments.reverse().find((segment) => segment in FOLDER_SUFFIXES);
  if (nearestKindFolder !== undefined) {
    const suffixes: ReadonlyArray<string> = FOLDER_SUFFIXES[nearestKindFolder] ?? [];
    if (suffixes.some((suffix) => fileName.endsWith(suffix))) return undefined;
    return `${path}: a file in ${nearestKindFolder}/ must end in ${suffixes.join(', ')}`;
  }
  const kind: string | undefined = Object.keys(FOLDER_SUFFIXES).find((candidate) =>
    (FOLDER_SUFFIXES[candidate] ?? []).some((suffix) => fileName.endsWith(suffix)),
  );
  return kind === undefined ? undefined : `${path}: a file with this suffix belongs in a ${kind}/ folder`;
}
