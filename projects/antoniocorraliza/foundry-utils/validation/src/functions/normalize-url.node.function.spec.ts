import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { normalizeUrl } from './normalize-url.function';

describe('normalizeUrl with Object.prototype polluted in its own process', () => {
  beforeAll(() => {
    Reflect.set(Object.prototype, 'protocols', ['javascript:']);
  });

  afterAll(() => {
    Reflect.deleteProperty(Object.prototype, 'protocols');
  });

  it('still rejects a javascript: URL', () => {
    expect(Reflect.get({}, 'protocols')).toEqual(['javascript:']);
    expect(normalizeUrl('javascript://x.es/%0aalert(1)', {})).toBeNull();
    expect(normalizeUrl('https://empresa.es', {})).toBe('https://empresa.es/');
  });
});
