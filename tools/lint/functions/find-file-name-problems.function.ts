import ts from 'typescript';
import { FOLDER_NAME_SUFFIXES } from '../constants/folder-name-suffixes.constant.ts';
import { FOLDER_SUFFIXES } from '../constants/folder-suffixes.constant.ts';
import { listExportedNames } from './list-exported-names.function.ts';
import { toKebabCase } from './to-kebab-case.function.ts';

export function findFileNameProblems(path: string, text: string): Array<string> {
  const segments: Array<string> = path.split('/');
  const fileName: string = segments.pop() ?? '';
  const kindFolder: string | undefined = segments.reverse().find((segment) => segment in FOLDER_SUFFIXES);
  if (kindFolder === undefined || !fileName.endsWith('.ts') || /\.(?:spec|test-d|d)\.ts$/.test(fileName)) return [];
  const suffix: string | undefined = (FOLDER_SUFFIXES[kindFolder] ?? []).find((candidate) => fileName.endsWith(candidate));
  if (suffix === undefined) return [];
  const stem: string = fileName.slice(0, -suffix.length).replace(/\.cldr$/, '');
  const names: Array<string> = listExportedNames(ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true));
  if (names.length !== 1) return [`${path}: a file exports one name, and this one exports ${names.length} (${names.join(', ')})`];
  const name: string = names[0] ?? '';
  const problems: Array<string> = [];
  if (name.startsWith('\u0275Foundry')) problems.push(`${path}: an internal name with the private prefix does not take Foundry: ${name}`);
  const nameSuffix: string = FOLDER_NAME_SUFFIXES[kindFolder] ?? '';
  const bareName: string = name.replace(/^\u0275/, '');
  const expected: string = toKebabCase(
    nameSuffix !== '' && bareName.endsWith(nameSuffix) ? bareName.slice(0, -nameSuffix.length) : bareName,
  );
  if (stem !== expected) problems.push(`${path}: the file is named after what it exports: ${expected}${suffix}`);
  return problems;
}
