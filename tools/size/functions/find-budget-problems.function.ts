import { BYTES_PER_KILOBYTE } from '../constants/bytes-per-kilobyte.constant.ts';
import { GZIP_BUDGET_TOOLS } from '../constants/gzip-budget-tools.constant.ts';
import { SIZE_TOOLS } from '../constants/size-tools.constant.ts';
import type { SizeBudget } from '../interfaces/size-budget.interface.ts';
import type { SizeFigures } from '../interfaces/size-figures.interface.ts';
import type { SizeToolFigures } from '../types/size-tool-figures.type.ts';
import { formatKilobytes } from './format-kilobytes.function.ts';

export function findBudgetProblems(name: string, figures: SizeToolFigures, budget: SizeBudget | null): Array<string> {
  if (budget === null) return [];
  const problems: Array<string> = [];
  SIZE_TOOLS.forEach((tool) => {
    const toolFigures: SizeFigures | undefined = figures[tool];
    if (!toolFigures) return;
    if (toolFigures.raw > budget.rawKilobytes * BYTES_PER_KILOBYTE) {
      problems.push(`${name} [${tool}]: ${formatKilobytes(toolFigures.raw)} is over its budget of ${budget.rawKilobytes} kB`);
    }
    if (GZIP_BUDGET_TOOLS.includes(tool) && toolFigures.gzip > budget.gzipKilobytes * BYTES_PER_KILOBYTE) {
      problems.push(`${name} [${tool}]: ${formatKilobytes(toolFigures.gzip)} gzip is over its budget of ${budget.gzipKilobytes} kB`);
    }
  });
  return problems;
}
