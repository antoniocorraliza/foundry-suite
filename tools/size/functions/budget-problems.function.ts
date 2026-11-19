import { BYTES_PER_KILOBYTE, GZIP_BUDGET_TOOLS } from '../constants/size-settings.constant.ts';
import { SIZE_TOOLS } from '../constants/size-tools.constant.ts';
import type { SizeBudget } from '../interfaces/size-budget.interface.ts';
import type { SizeFigures } from '../interfaces/size-figures.interface.ts';
import type { SizeToolFigures } from '../types/size-tool-figures.type.ts';
import { formatKilobytes } from './format-kilobytes.function.ts';

export function budgetProblems(name: string, figures: SizeToolFigures, budget: SizeBudget | null): Array<string> {
  if (budget === null) return [];
  const problems: Array<string> = [];
  for (const tool of SIZE_TOOLS) {
    const toolFigures: SizeFigures | undefined = figures[tool];
    if (!toolFigures) continue;
    if (toolFigures.raw > budget.rawKilobytes * BYTES_PER_KILOBYTE) {
      problems.push(`${name} [${tool}]: ${formatKilobytes(toolFigures.raw)} is over its budget of ${budget.rawKilobytes} kB`);
    }
    if (GZIP_BUDGET_TOOLS.includes(tool) && toolFigures.gzip > budget.gzipKilobytes * BYTES_PER_KILOBYTE) {
      problems.push(`${name} [${tool}]: ${formatKilobytes(toolFigures.gzip)} gzip is over its budget of ${budget.gzipKilobytes} kB`);
    }
  }
  return problems;
}
