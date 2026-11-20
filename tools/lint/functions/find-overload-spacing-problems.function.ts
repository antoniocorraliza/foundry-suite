import ts from 'typescript';

function isOverloadSignature(node: ts.Node): node is ts.FunctionDeclaration | ts.MethodDeclaration {
  return (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && node.body === undefined && node.name !== undefined;
}

function hasSameName(first: ts.FunctionDeclaration | ts.MethodDeclaration, second: ts.Node): boolean {
  return (ts.isFunctionDeclaration(second) || ts.isMethodDeclaration(second)) && second.name?.getText() === first.name?.getText();
}

export function findOverloadSpacingProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const checkSiblings = (nodes: ReadonlyArray<ts.Node>): void =>
    nodes.forEach((node, index) => {
      const next: ts.Node | undefined = nodes[index + 1];
      if (next === undefined || !isOverloadSignature(node) || !hasSameName(node, next)) return;
      const endLine: number = source.getLineAndCharacterOfPosition(node.getEnd()).line;
      const nextLine: number = source.getLineAndCharacterOfPosition(next.getStart(source, true)).line;
      if (nextLine - endLine !== 2) problems.push(`${path}:${nextLine + 1}: overloads are separated by one blank line`);
    });
  const visit = (node: ts.Node): void => {
    if (ts.isSourceFile(node) || ts.isModuleBlock(node) || ts.isBlock(node)) checkSiblings(node.statements);
    if (ts.isClassLike(node)) checkSiblings(node.members);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}
