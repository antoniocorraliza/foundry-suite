export function errorNameProblem(specifier: string, className: string, bundler: string, printedName: string): string | undefined {
  if (printedName === className) return undefined;
  return `${className} from ${specifier} [${bundler}]: error.name is '${printedName}' after minifying; declare it as the literal '${className}'`;
}
