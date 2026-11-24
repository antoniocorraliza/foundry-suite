// eslint-disable-next-line no-restricted-syntax -- the segmenter is created once, the first time a text is split, and never on import
let graphemeSegmenter: Intl.Segmenter | null = null;

/** Splits a text into its visible characters, with one segmenter created the first time it is needed. */
export function splitGraphemes(text: string): Array<string> {
  graphemeSegmenter ??= new Intl.Segmenter([], { granularity: 'grapheme' });
  return Array.from(graphemeSegmenter.segment(text), (segment) => segment.segment);
}
