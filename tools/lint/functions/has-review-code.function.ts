import { REVIEW_CODE, REVIEW_CODE_EXCEPTIONS } from '../constants/review-codes.constant.ts';

function escapeForPattern(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function hasReviewCode(text: string): boolean {
  const exceptions: RegExp = new RegExp(`(?<![\\w+-])(?:${REVIEW_CODE_EXCEPTIONS.map(escapeForPattern).join('|')})(?![\\w-])`, 'g');
  return REVIEW_CODE.test(text.replace(exceptions, ' '));
}
