import { FINAL_SPACES_AND_DOTS, FORBIDDEN_FILE_NAME_CHARACTER, WINDOWS_RESERVED_NAME } from '../constants/file-name-patterns.constant';

/** Writes a name that every file system accepts: forbidden characters replaced, no final dots or spaces, never empty or reserved. */
export function sanitizeFileName(fileName: string): string {
  const name: string = fileName.replaceAll(FORBIDDEN_FILE_NAME_CHARACTER, '-').replace(FINAL_SPACES_AND_DOTS, '');
  if (name === '') return 'download';
  return WINDOWS_RESERVED_NAME.test(name.split('.')[0] ?? '') ? `_${name}` : name;
}
