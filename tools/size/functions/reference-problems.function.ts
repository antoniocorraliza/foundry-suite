import { SIZE_TOOLS } from '../constants/size-tools.constant.ts';
import type { SizeFigures } from '../interfaces/size-figures.interface.ts';
import type { SizeReference } from '../types/size-reference.type.ts';
import type { SizeToolFigures } from '../types/size-tool-figures.type.ts';
import { formatKilobytes } from './format-kilobytes.function.ts';
import { signedBytes } from './signed-bytes.function.ts';

function changeProblem(label: string, measured: SizeFigures, reference: SizeFigures): string | undefined {
  const rawChange: number = measured.raw - reference.raw;
  const gzipChange: number = measured.gzip - reference.gzip;
  if (rawChange === 0 && gzipChange === 0) return undefined;
  const direction: string = rawChange > 0 || (rawChange === 0 && gzipChange > 0) ? 'grew' : 'shrank';
  const now: string = `${formatKilobytes(measured.raw)}, gzip ${formatKilobytes(measured.gzip)}`;
  return `${label}: ${direction} by ${signedBytes(rawChange)} (gzip ${signedBytes(gzipChange)}), now ${now}`;
}

export function referenceProblems(measured: SizeReference, reference: SizeReference): Array<string> {
  const problems: Array<string> = [];
  const names: Array<string> = [...new Set([...Object.keys(measured), ...Object.keys(reference)])].sort();
  for (const name of names) {
    const measuredFigures: SizeToolFigures | undefined = measured[name];
    const referenceFigures: SizeToolFigures | undefined = reference[name];
    if (!measuredFigures) {
      problems.push(`${name}: in the reference but no longer measured`);
      continue;
    }
    if (!referenceFigures) {
      problems.push(`${name}: new, not in the reference yet`);
      continue;
    }
    for (const tool of SIZE_TOOLS) {
      const toolMeasured: SizeFigures | undefined = measuredFigures[tool];
      const toolReference: SizeFigures | undefined = referenceFigures[tool];
      if (!toolMeasured && !toolReference) continue;
      if (!toolMeasured) problems.push(`${name} [${tool}]: in the reference but no longer measured`);
      else if (!toolReference) problems.push(`${name} [${tool}]: new, not in the reference yet`);
      else {
        const problem: string | undefined = changeProblem(`${name} [${tool}]`, toolMeasured, toolReference);
        if (problem !== undefined) problems.push(problem);
      }
    }
  }
  return problems;
}
