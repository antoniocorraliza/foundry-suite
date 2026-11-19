import type { SizeFigures } from '../interfaces/size-figures.interface.ts';

export function sizeDelta(probe: SizeFigures, base: SizeFigures): SizeFigures {
  return { raw: probe.raw - base.raw, gzip: probe.gzip - base.gzip };
}
