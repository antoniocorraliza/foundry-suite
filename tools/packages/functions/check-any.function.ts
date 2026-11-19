import ts from 'typescript';
import type { Tarball } from '../interfaces/tarball.interface.ts';

function readTarballFile(tarball: Tarball, path: string): string {
  return tarball.contents.get(path) ?? '';
}

export function checkAny(tarball: Tarball): Array<string> {
  const problems: Array<string> = [];
  for (const file of tarball.files.filter((path) => path.endsWith('.d.ts'))) {
    const source: ts.SourceFile = ts.createSourceFile(file, readTarballFile(tarball, file), ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (node.kind === ts.SyntaxKind.AnyKeyword) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        problems.push(`${file}:${line + 1} uses \`any\`: ${node.parent.getText(source).slice(0, 80)}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return problems;
}
