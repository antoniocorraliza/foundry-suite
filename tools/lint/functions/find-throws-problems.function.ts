import ts from 'typescript';

function isNeverThrowingName(name: string): boolean {
  return /^\u0275?(?:is|has)[A-Z]/.test(name);
}

export function findThrowsProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    const isFunction: boolean = ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isMethodSignature(node);
    const name: string = isFunction ? ((node as ts.SignatureDeclaration).name?.getText(source) ?? '') : '';
    if (isNeverThrowingName(name) && ts.getJSDocTags(node).some((tag) => tag.tagName.text === 'throws')) {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
      problems.push(`${path}:${line + 1}: ${name} never throws, so its JSDoc has no @throws`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}
