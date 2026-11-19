import type { ResolvedImport } from '../interfaces/resolved-import.interface.ts';

export function probeSource(imports: ReadonlyArray<ResolvedImport>): string {
  const lines: Array<string> = [];
  const kept: Array<string> = [];
  imports.forEach((resolvedImport, importIndex) => {
    if (resolvedImport.symbols === 'whole-entry') {
      const namespace: string = `probe${importIndex}`;
      lines.push(`import * as ${namespace} from '${resolvedImport.specifier}';`);
      kept.push(namespace);
      return;
    }
    const aliases: Array<string> = resolvedImport.symbols.map((symbol, symbolIndex) => `probe${importIndex}_${symbolIndex}`);
    const bindings: Array<string> = resolvedImport.symbols.map((symbol, symbolIndex) => `${symbol} as ${aliases[symbolIndex] ?? symbol}`);
    lines.push(`import { ${bindings.join(', ')} } from '${resolvedImport.specifier}';`);
    kept.push(...aliases);
  });
  lines.push(`console.log([${kept.join(', ')}]);`);
  return `${lines.join('\n')}\n`;
}
