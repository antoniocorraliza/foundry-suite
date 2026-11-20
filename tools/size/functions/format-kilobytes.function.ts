import { BYTES_PER_KILOBYTE } from '../constants/bytes-per-kilobyte.constant.ts';

export function formatKilobytes(bytes: number): string {
  return `${(bytes / BYTES_PER_KILOBYTE).toFixed(2)} kB`;
}
