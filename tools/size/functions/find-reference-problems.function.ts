import { SIZE_TOOLS } from '../constants/size-tools.constant.ts';
import type { SizeFigures } from '../interfaces/size-figures.interface.ts';
import type { SizeReference } from '../types/size-reference.type.ts';
import type { SizeToolFigures } from '../types/size-tool-figures.type.ts';
import { formatKilobytes } from './format-kilobytes.function.ts';
import { formatSignedBytes } from './format-signed-bytes.function.ts';

function findChangeProblem(label: string, measured: SizeFigures, reference: SizeFigures): string | null {
  const rawChange: number = measured.raw - reference.raw;
  const gzipChange: number = measured.gzip - reference.gzip;
  if (rawChange === 0 && gzipChange === 0) return null;
  const direction: string = rawChange > 0 || (rawChange === 0 && gzipChange > 0) ? 'grew' : 'shrank';
  const now: string = `${formatKilobytes(measured.raw)}, gzip ${formatKilobytes(measured.gzip)}`;
  return `${label}: ${direction} by ${formatSignedBytes(rawChange)} (gzip ${formatSignedBytes(gzipChange)}), now ${now}`;
}

export function findReferenceProblems(measured: SizeReference, reference: SizeReference): Array<string> {
  const problems: Array<string> = [];
  const names: Array<string> = [...new Set([...Object.keys(measured), ...Object.keys(reference)])].sort();
  names.forEach((name) => {
    const measuredFigures: SizeToolFigures | undefined = measured[name];
    const referenceFigures: SizeToolFigures | undefined = reference[name];
    if (!measuredFigures) {
      problems.push(`${name}: in the reference but no longer measured`);
      return;
    }
    if (!referenceFigures) {
      problems.push(`${name}: new, not in the reference yet`);
      return;
    }
    SIZE_TOOLS.forEach((tool) => {
      const toolMeasured: SizeFigures | undefined = measuredFigures[tool];
      const toolReference: SizeFigures | undefined = referenceFigures[tool];
      if (!toolMeasured && !toolReference) return;
      if (!toolMeasured) problems.push(`${name} [${tool}]: in the reference but no longer measured`);
      else if (!toolReference) problems.push(`${name} [${tool}]: new, not in the reference yet`);
      else {
        const problem: string | null = findChangeProblem(`${name} [${tool}]`, toolMeasured, toolReference);
        if (problem !== null) problems.push(problem);
      }
    });
  });
  return problems;
}
