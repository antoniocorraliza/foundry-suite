import ts from 'typescript';

function listTopLevelFunctions(path: string, text: string): Array<[string, number]> {
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  return source.statements
    .filter((statement) => ts.isFunctionDeclaration(statement) && statement.name !== undefined)
    .map((statement) => [
      (statement as ts.FunctionDeclaration).name?.text ?? '',
      source.getLineAndCharacterOfPosition(statement.getStart(source)).line + 1,
    ]);
}

export function findRepeatedSpecHelpers(specTexts: ReadonlyMap<string, string>): Array<string> {
  const firstFiles: Map<string, string> = new Map<string, string>();
  return [...specTexts].flatMap(([path, text]) =>
    listTopLevelFunctions(path, text).flatMap(([name, line]) => {
      const firstFile: string | undefined = firstFiles.get(name);
      if (firstFile === undefined) {
        firstFiles.set(name, path);
        return [];
      }
      return [`${path}:${line}: repeated test helper: ${name} is also declared in ${firstFile}; move it to a shared file`];
    }),
  );
}
