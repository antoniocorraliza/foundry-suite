import { describe, expect, it } from 'vitest';
import { splitExportPattern } from './split-export-pattern.function.ts';

describe('splitExportPattern', () => {
  it('returns the parts before and after the star, without the leading ./', () => {
    expect(splitExportPattern('./styles/*.css')).toEqual(['styles/', '.css']);
    expect(splitExportPattern('styles/*.css')).toEqual(['styles/', '.css']);
  });
});
