import ts from 'typescript';
import { DIRECTIVE_WITH_REASON, PURE_ANNOTATION, SECTION_MARKERS } from '../constants/library-comments.constant.ts';

function isAllowedComment(comment: string): boolean {
  if (comment.startsWith('/**') && comment !== '/**/') return true;
  if (SECTION_MARKERS.some((marker) => comment === `// ${marker}`)) return true;
  return PURE_ANNOTATION.test(comment) || DIRECTIVE_WITH_REASON.test(comment);
}

function commentRanges(source: ts.SourceFile): Array<ts.CommentRange> {
  const text: string = source.getFullText();
  const ranges: Map<number, ts.CommentRange> = new Map();
  const collect = (node: ts.Node): void => {
    (ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []).forEach((range) => ranges.set(range.pos, range));
    (ts.getTrailingCommentRanges(text, node.getEnd()) ?? []).forEach((range) => ranges.set(range.pos, range));
    node.getChildren(source).forEach(collect);
  };
  collect(source);
  return [...ranges.values()].sort((first, second) => first.pos - second.pos);
}

export function libraryCommentProblems(path: string, text: string): Array<string> {
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  return commentRanges(source)
    .map((range) => ({ range, comment: text.slice(range.pos, range.end) }))
    .filter(({ comment }) => !isAllowedComment(comment))
    .map(({ range, comment }) => {
      const { line } = source.getLineAndCharacterOfPosition(range.pos);
      return `${path}:${line + 1}: comment in a library (only JSDoc, section markers, pure annotations and directives with a reason): ${comment.split('\n')[0]?.slice(0, 80) ?? ''}`;
    });
}
