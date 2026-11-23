import { readLocaleFirstDay } from './read-locale-first-day.function.ts';

// Returns null for a code that the engine turns into another region (BU becomes MM), so each region appears once.
export function readEngineFirstDay(region: string): number | null {
  if (new Intl.Locale(`und-${region}`).region !== region) return null;
  return readLocaleFirstDay(`und-${region}`);
}
