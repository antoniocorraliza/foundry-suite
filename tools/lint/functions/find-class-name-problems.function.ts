import { CAMEL_CASE_CLASS } from '../constants/camel-case-class.constant.ts';
import { CLASS_BINDING } from '../constants/class-binding.constant.ts';
import { INTERPOLATION } from '../constants/interpolation.constant.ts';
import { LIBRARY_TEMPLATE_FILE } from '../constants/library-template-file.constant.ts';
import { STATIC_CLASS_ATTRIBUTE } from '../constants/static-class-attribute.constant.ts';
import { STYLE_CLASS_SELECTOR } from '../constants/style-class-selector.constant.ts';
import { STYLE_DECLARATION } from '../constants/style-declaration.constant.ts';
import { STYLE_STRING_OR_URL } from '../constants/style-string-or-url.constant.ts';

function readTemplateClassNames(line: string): Array<string> {
  const staticNames: Array<string> = [...line.matchAll(STATIC_CLASS_ATTRIBUTE)].flatMap((match) =>
    (match[1] ?? '')
      .replace(INTERPOLATION, ' ')
      .split(/\s+/)
      .filter((name) => name !== ''),
  );
  return [...staticNames, ...[...line.matchAll(CLASS_BINDING)].map((match) => match[1] ?? '')];
}

// Only selectors carry class names: the part before `{`, or a line of a selector list that ends in a comma.
function readStyleClassNames(line: string): Array<string> {
  const code: string = line.replace(STYLE_STRING_OR_URL, '');
  if (code.trimStart().startsWith('@') || STYLE_DECLARATION.test(code)) return [];
  const selector: string | null = code.includes('{') ? (code.split('{')[0] ?? '') : code.trimEnd().endsWith(',') ? code : null;
  return selector === null ? [] : [...selector.matchAll(STYLE_CLASS_SELECTOR)].map((match) => match[1] ?? '');
}

export function findClassNameProblems(path: string, text: string): Array<string> {
  const isTemplate: boolean = LIBRARY_TEMPLATE_FILE.test(path);
  return text
    .split('\n')
    .flatMap((line, index) =>
      (isTemplate ? readTemplateClassNames(line) : readStyleClassNames(line))
        .filter((name) => !CAMEL_CASE_CLASS.test(name))
        .map((name) => `${path}:${index + 1}: CSS class not in camelCase: ${name}`),
    );
}
