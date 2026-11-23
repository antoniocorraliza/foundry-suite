import ts from 'typescript';
import { TEMPLATE_JSDOC_VERBS } from '../constants/comment-patterns.constant.ts';

function readFirstWord(comment: string): string {
  return /^\/\*\*[\s*]*([A-Za-z]+)/.exec(comment)?.[1] ?? '';
}

export function findTemplateJsdocProblems(path: string, text: string): Array<string> {
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  return source.statements.flatMap((statement) => {
    const comments: Array<ts.CommentRange> = ts.getLeadingCommentRanges(text, statement.pos) ?? [];
    const jsdoc: ts.CommentRange | undefined = comments.filter((comment) => text.startsWith('/**', comment.pos)).at(-1);
    if (jsdoc === undefined) return [];
    const word: string = readFirstWord(text.slice(jsdoc.pos, jsdoc.end));
    if (!TEMPLATE_JSDOC_VERBS.includes(word)) return [];
    const { line } = source.getLineAndCharacterOfPosition(jsdoc.pos);
    return [`${path}:${line + 1}: template JSDoc: describe a constant, type or interface with a noun phrase, not "${word} the..."`];
  });
}
