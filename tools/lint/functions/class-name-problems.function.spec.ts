import { describe, expect, it } from 'vitest';
import { classNameProblems } from './class-name-problems.function.ts';

const TEMPLATE: string = 'projects/antoniocorraliza/foundry-ui/select/src/components/foundry-select/foundry-select.component.html';
const STYLES: string = 'projects/antoniocorraliza/foundry-ui/select/src/components/foundry-select/foundry-select.component.scss';

describe('classNameProblems', () => {
  it('accepts camelCase classes in templates, also bound ones and interpolated values', () => {
    const text: string = [
      '<ul class="optionList" role="listbox">',
      '  <li class="option" [class.isSelected]="isSelected(item)" [attr.class]="extra">{{ item }}</li>',
      '  <li class="option {{ extraClass }}" [class]="{ isActive: isActive() }"></li>',
      '</ul>',
    ].join('\n');
    expect(classNameProblems(TEMPLATE, text)).toEqual([]);
  });

  it('reports classes in templates that are not camelCase', () => {
    const text: string = '<li class="option option--selected" [class.is-active]="isActive()"></li>';
    expect(classNameProblems(TEMPLATE, text)).toEqual([
      `${TEMPLATE}:1: CSS class not in camelCase: option--selected`,
      `${TEMPLATE}:1: CSS class not in camelCase: is-active`,
    ]);
  });

  it('accepts camelCase selectors and ignores numbers, strings, urls and at-rules', () => {
    const text: string = [
      "@use 'sass:math';",
      '.option.isSelected,',
      ':host(.isOpen) .optionList {',
      '  margin: 0.5rem;',
      "  background: url('./images/check.svg');",
      "  font-family: 'Inter.Variable', sans-serif;",
      '  &.isActive {',
      '    transition: opacity 0.2s;',
      '  }',
      '}',
      '@media (min-width: 37.5rem) {',
      '  .option {',
      '    padding: 0.25rem;',
      '  }',
      '}',
    ].join('\n');
    expect(classNameProblems(STYLES, text)).toEqual([]);
  });

  it('reports selectors whose classes are not camelCase', () => {
    const text: string = ['.option-list,', '.option.is_selected {', '  color: red;', '}', '.Option {', '}'].join('\n');
    expect(classNameProblems(STYLES, text)).toEqual([
      `${STYLES}:1: CSS class not in camelCase: option-list`,
      `${STYLES}:2: CSS class not in camelCase: is_selected`,
      `${STYLES}:5: CSS class not in camelCase: Option`,
    ]);
  });
});
