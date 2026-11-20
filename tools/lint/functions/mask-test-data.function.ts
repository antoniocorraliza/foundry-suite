import ts from 'typescript';
import { getTestTitleArgument } from './get-test-title-argument.function.ts';

function findTextLiteralRange(node: ts.Node, source: ts.SourceFile): [number, number] | null {
  const start: number = node.getStart(source);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateTail(node)) return [start + 1, node.end - 1];
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node)) return [start + 1, node.end - 2];
  return null;
}

export function maskTestData(path: string, text: string): string {
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const characters: Array<string> = text.split('');
  const titles: Set<ts.Node> = new Set();
  const visit = (node: ts.Node): void => {
    const title: ts.Expression | null = getTestTitleArgument(node);
    if (title !== null && (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) titles.add(title);
    const content: [number, number] | null = titles.has(node) ? null : findTextLiteralRange(node, source);
    if (content !== null) {
      const [start, end]: [number, number] = content;
      characters.slice(start, end).forEach((character, offset) => {
        if (character !== '\n' && character !== '\r') characters[start + offset] = ' ';
      });
    }
    if (!titles.has(node)) node.getChildren(source).forEach(visit);
  };
  visit(source);
  return characters.join('');
}
