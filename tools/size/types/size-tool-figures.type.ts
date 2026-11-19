import type { SizeFigures } from '../interfaces/size-figures.interface.ts';
import type { SizeTool } from './size-tool.type.ts';

export type SizeToolFigures = Readonly<Partial<Record<SizeTool, SizeFigures>>>;
