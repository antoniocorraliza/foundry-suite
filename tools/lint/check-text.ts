import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import ts from 'typescript';
import { CHECKED_FILE, LOCKFILE, SKIPPED_FILES, SPEC_FILE, TYPESCRIPT_FILE } from './constants/file-patterns.constant.ts';
import { FOLDER_SUFFIXES } from './constants/folder-suffixes.constant.ts';
import { REVIEW_CODE, TEST_FUNCTIONS } from './constants/test-titles.constant.ts';
import { TEXT_RULES } from './constants/text-rules.constant.ts';
import type { ArrowFunctionDeclaration } from './interfaces/arrow-function-declaration.interface.ts';
import type { TextRule } from './interfaces/text-rule.interface.ts';

// describe('...'), it.each(...)('...') and the like: the name of the call, without modifiers.
function testFunctionName(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return testFunctionName(expression.expression);
  if (ts.isCallExpression(expression)) return testFunctionName(expression.expression);
  return undefined;
}

function testTitleText(argument: ts.Expression | undefined): string | undefined {
  if (argument === undefined) return undefined;
  if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) return argument.text;
  if (ts.isTemplateExpression(argument)) return argument.head.text + argument.templateSpans.map((span) => span.literal.text).join(' ');
  return undefined;
}

// Uses the TypeScript parser because Prettier moves long titles to their own line.
function testTitleProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const name: string | undefined = testFunctionName(node.expression);
      const title: string | undefined = name && TEST_FUNCTIONS.has(name) ? testTitleText(node.arguments[0]) : undefined;
      if (title !== undefined && REVIEW_CODE.test(title)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        problems.push(`${path}:${line + 1}: review code in a test title: ${title.slice(0, 100)}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}

// From the name to the opening brace: a signature that Prettier had to split because it does not fit in one line.
function multilineSignature(source: ts.SourceFile, node: ts.Node): ts.Node | undefined {
  const isFunction: boolean =
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node);
  const isArrowConstant: boolean = ts.isVariableDeclaration(node) && node.initializer !== undefined && ts.isArrowFunction(node.initializer);
  if (!isFunction && !isArrowConstant) return undefined;
  const start: ts.Node = isArrowConstant ? node : ((node as ts.SignatureDeclaration).name ?? node);
  const end: ts.Node | undefined = isArrowConstant
    ? (node as ArrowFunctionDeclaration).initializer.equalsGreaterThanToken
    : (node as ts.FunctionLikeDeclaration).body;
  if (end === undefined) return undefined;
  const startLine: number = source.getLineAndCharacterOfPosition(start.getStart(source)).line;
  const endLine: number = source.getLineAndCharacterOfPosition(end.getStart(source)).line;
  return endLine > startLine ? start : undefined;
}

function signatureProblems(path: string, text: string): Array<string> {
  const problems: Array<string> = [];
  const source: ts.SourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    const signature: ts.Node | undefined = multilineSignature(source, node);
    if (signature !== undefined) {
      const { line } = source.getLineAndCharacterOfPosition(signature.getStart(source));
      problems.push(`${path}:${line + 1}: signature on several lines: extract a named type for the parameters`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return problems;
}

// The nearest folder of the path that has a kind decides which suffixes the file may have.
function folderSuffixProblem(path: string): string | undefined {
  const segments: Array<string> = path.split('/');
  const fileName: string = (segments.pop() ?? '').replace(/\.spec\.ts$/, '.ts');
  const folder: string | undefined = segments.reverse().find((segment) => segment in FOLDER_SUFFIXES);
  if (folder !== undefined) {
    const suffixes: ReadonlyArray<string> = FOLDER_SUFFIXES[folder] ?? [];
    if (!suffixes.some((suffix) => fileName.endsWith(suffix))) return `${path}: a file in ${folder}/ must end in ${suffixes.join(', ')}`;
    return undefined;
  }
  const kind: string | undefined = Object.keys(FOLDER_SUFFIXES).find((candidate) =>
    (FOLDER_SUFFIXES[candidate] ?? []).some((suffix) => fileName.endsWith(suffix)),
  );
  return kind === undefined ? undefined : `${path}: a file with this suffix belongs in a ${kind}/ folder`;
}

// The index still lists a deleted file until the deletion is committed.
function repositoryFiles(): Array<string> {
  const output: string = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' });
  return output
    .split('\n')
    .filter((path) => CHECKED_FILE.test(path) && !LOCKFILE.test(path) && !SKIPPED_FILES.has(path) && existsSync(path));
}

function main(): number {
  const problems: Array<string> = [];
  for (const path of repositoryFiles()) {
    const text: string = readFileSync(path, 'utf8');
    const lines: Array<string> = text.split('\n');
    const rules: Array<TextRule> = TEXT_RULES.filter((rule) => !rule.onlyIn || rule.onlyIn.test(path));
    lines.forEach((line, index) => {
      for (const rule of rules) {
        if (rule.pattern.test(line)) problems.push(`${path}:${index + 1}: ${rule.name}: ${line.trim().slice(0, 100)}`);
      }
    });
    const folderProblem: string | undefined = folderSuffixProblem(path);
    if (folderProblem !== undefined) problems.push(folderProblem);
    if (TYPESCRIPT_FILE.test(path)) problems.push(...signatureProblems(path, text));
    if (SPEC_FILE.test(path)) problems.push(...testTitleProblems(path, text));
  }
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) console.error(`[check-text]: ${problems.length} problem(s), see CONTRIBUTING.md`);
  return problems.length === 0 ? 0 : 1;
}

process.exitCode = main();
