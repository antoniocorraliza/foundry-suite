import ts from 'typescript';
import { JSDOC_FILLER_WORDS } from '../constants/jsdoc-filler-words.constant.ts';

function splitWords(text: string): Array<string> {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word !== '');
}

function removePlural(word: string): string {
  return word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word;
}

function readFirstSentence(comment: string): string {
  const description: string = comment
    .replace(/^\/\*\*|\*\/$/g, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .filter((line) => !line.startsWith('@'))
    .join(' ');
  return description.split(/\.(?:\s|$)/)[0] ?? '';
}

function getDeclarationName(statement: ts.Statement): string | null {
  if (ts.isFunctionDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
    return statement.name?.text ?? null;
  }
  if (ts.isClassDeclaration(statement)) return statement.name?.text ?? null;
  if (ts.isVariableStatement(statement)) {
    const name: ts.BindingName | undefined = statement.declarationList.declarations[0]?.name;
    return name !== undefined && ts.isIdentifier(name) ? name.text : null;
  }
  return null;
}

function hasOnlyNameWords(sentence: string, name: string, isFunction: boolean): boolean {
  const nameWords: ReadonlySet<string> = new Set(splitWords(name.replaceAll('_', ' ')).map(removePlural));
  const words: Array<string> = splitWords(sentence).slice(isFunction ? 1 : 0);
  return words.every((word) => JSDOC_FILLER_WORDS.has(word) || nameWords.has(removePlural(word)));
}

export function findNameOnlyJsdocProblems(path: string, text: string): Array<string> {
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  return source.statements.flatMap((statement) => {
    const name: string | null = getDeclarationName(statement);
    const comments: Array<ts.CommentRange> = ts.getLeadingCommentRanges(text, statement.pos) ?? [];
    const jsdoc: ts.CommentRange | undefined = comments.filter((comment) => text.startsWith('/**', comment.pos)).at(-1);
    if (name === null || jsdoc === undefined) return [];
    const sentence: string = readFirstSentence(text.slice(jsdoc.pos, jsdoc.end));
    if (!hasOnlyNameWords(sentence, name, ts.isFunctionDeclaration(statement))) return [];
    const { line } = source.getLineAndCharacterOfPosition(jsdoc.pos);
    return [`${path}:${line + 1}: JSDoc that only repeats the name ${name}: say the edge case or the reason`];
  });
}
