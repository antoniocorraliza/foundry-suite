import ts from 'typescript';
import { FOLDER_NAME_SUFFIXES, FOLDER_SUFFIXES } from '../constants/folder-structure.constant.ts';
import { listExportedNames } from './list-exported-names.function.ts';
import { toKebabCase } from './to-kebab-case.function.ts';

function isExportedConstant(statement: ts.Statement): boolean {
  return (
    ts.isVariableStatement(statement) &&
    (statement.declarationList.flags & ts.NodeFlags.Const) !== 0 &&
    (ts.getModifiers(statement) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
  );
}

// A file of constants may group several of one topic and is named after the topic, so only what it exports is checked.
function findConstantFileProblems(path: string, source: ts.SourceFile): Array<string> {
  const names: Array<string> = listExportedNames(source);
  const constantNames: Array<string> = source.statements
    .filter((statement) => isExportedConstant(statement))
    .flatMap((statement) =>
      (statement as ts.VariableStatement).declarationList.declarations.map((declaration) => declaration.name.getText()),
    );
  if (names.length === 0) return [`${path}: a file of constants exports at least one constant`];
  const others: Array<string> = names.filter((name) => !constantNames.includes(name));
  return others.length === 0 ? [] : [`${path}: a file of constants only exports constants, and this one also exports ${others.join(', ')}`];
}

export function findFileNameProblems(path: string, text: string): Array<string> {
  const segments: Array<string> = path.split('/');
  const fileName: string = segments.pop() ?? '';
  const kindFolder: string | undefined = segments.reverse().find((segment) => segment in FOLDER_SUFFIXES);
  if (kindFolder === undefined || !fileName.endsWith('.ts') || /\.(?:spec|test-d|d)\.ts$/.test(fileName)) return [];
  const suffix: string | undefined = (FOLDER_SUFFIXES[kindFolder] ?? []).find((candidate) => fileName.endsWith(candidate));
  if (suffix === undefined) return [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  if (suffix === '.constant.ts') return findConstantFileProblems(path, source);
  const stem: string = fileName.slice(0, -suffix.length);
  const names: Array<string> = listExportedNames(source);
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
