import { describe, expect, it } from 'vitest';
import { messageProblems } from './message-problems.function.ts';

describe('messageProblems', () => {
  it('accepts a title with a body after a blank line', () => {
    expect(messageProblems('fix(core): retry the refresh once\n\nThe second 401 means the refresh token expired.\n')).toEqual([]);
  });

  it('requires a blank line between the title and the body', () => {
    expect(messageProblems('fix(core): retry the refresh once\nThe body.')).toEqual([
      'the body must be separated from the title by a blank line',
    ]);
  });

  it.each([
    'Co-Authored-By: Someone <someone@example.com>',
    'co-authored-by: someone',
    'Generated with a tool',
    'Claude-Session: https://example.com',
    'Someone <noreply@anthropic.com>',
  ])('rejects an attribution line: %s', (line) => {
    expect(messageProblems(`fix(core): retry the refresh once\n\n${line}`)).toEqual(['the message credits a tool or an assistant']);
  });
});
