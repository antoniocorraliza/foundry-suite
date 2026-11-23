import { REVIEW_CODE, REVIEW_CODE_EXCEPTION_PATTERN } from '../constants/review-codes.constant.ts';

export function hasReviewCode(text: string): boolean {
  return REVIEW_CODE.test(text.replace(REVIEW_CODE_EXCEPTION_PATTERN, ' '));
}
