import ts from 'typescript';
import { testTitleArgument } from './test-title-argument.function.ts';

function textLiteralContent(node: ts.Node, source: ts.SourceFile): [number, number] | undefined {
  const start: number = node.getStart(source);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateTail(node)) return [start + 1, node.end - 1];
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node)) return [start + 1, node.end - 2];
  return undefined;
}

export function maskTestData(path: string, text: string): string {
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const characters: Array<string> = text.split('');
  const titles: Set<ts.Node> = new Set();
  const visit = (node: ts.Node): void => {
    const title: ts.Expression | undefined = testTitleArgument(node);
    if (title !== undefined && (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) titles.add(title);
    const content: [number, number] | undefined = titles.has(node) ? undefined : textLiteralContent(node, source);
    if (content !== undefined) {
      for (let position: number = content[0]; position < content[1]; position++) {
        if (characters[position] !== '\n' && characters[position] !== '\r') characters[position] = ' ';
      }
    }
    if (!titles.has(node)) node.getChildren(source).forEach(visit);
  };
  visit(source);
  return characters.join('');
}
