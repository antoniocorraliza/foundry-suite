import { describe, expect, it } from 'vitest';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import { FoundryCsvParseError } from './foundry-csv-parse.error';

const REASONS: ReadonlyArray<FoundryCsvParseError['reason']> = [
  'unclosedQuote',
  'unexpectedQuote',
  'columnCountMismatch',
  'duplicateHeader',
  'emptyHeader',
  'invalidEncoding',
];

describe('FoundryCsvParseError', () => {
  it('is a FoundryUtilsError with its own name and the details as properties', () => {
    const error: FoundryCsvParseError = new FoundryCsvParseError({ reason: 'columnCountMismatch', line: 2, column: 4 });
    expect(error).toBeInstanceOf(FoundryUtilsError);
    expect(error.name).toBe('FoundryCsvParseError');
    expect(error.reason).toBe('columnCountMismatch');
    expect(error.line).toBe(2);
    expect(error.column).toBe(4);
  });

  it('writes what happened, then the reason, the line and the column in the message', () => {
    const error: FoundryCsvParseError = new FoundryCsvParseError({ reason: 'columnCountMismatch', line: 12, column: 4 });
    expect(error.message).toMatch(/^\[foundry-utils\]: [^A-Z].*[^.]$/);
    expect(error.message).toContain('columnCountMismatch');
    expect(error.message).toContain('line 12');
    expect(error.message).toContain('column 4');
    expect(error.message.indexOf('columnCountMismatch')).toBeGreaterThan('[foundry-utils]: '.length);
  });

  it('describes each reason with its own words', () => {
    const messages: Array<string> = REASONS.map((reason) => new FoundryCsvParseError({ reason, line: 1, column: 1 }).message);
    expect(new Set(messages).size).toBe(REASONS.length);
    messages.forEach((message, index) => expect(message).toContain(REASONS[index]));
  });

  it('keeps the cause', () => {
    const original: Error = new Error('[test]: original');
    expect(new FoundryCsvParseError({ reason: 'invalidEncoding', line: 0, column: 0 }, { cause: original }).cause).toBe(original);
  });
});
