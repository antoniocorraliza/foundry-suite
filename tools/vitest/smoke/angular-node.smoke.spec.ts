/*
 * B1 smoke test: Angular on Node (jsdom), zoneless and with zone.js.
 * It only proves that the project starts; it does not test any library.
 * `describe`/`it`/`expect` are globals on purpose (see setup/angular-zone.ts).
 */
import { ChangeDetectionStrategy, Component, NgZone, VERSION, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { inject } from 'vitest';

@Component({
  selector: 'foundry-smoke-greeting',
  template: '<p>Hello, {{ name() }}</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SmokeGreetingComponent {
  readonly name = input.required<string>();
}

describe('B1 smoke · Angular on Node (jsdom)', () => {
  it('runs with the expected Angular major', () => {
    expect(Number(VERSION.major)).toBe(inject('expectedAngularMajor'));
  });
  it('renders an OnPush component with a required signal input', async () => {
    const fixture = TestBed.createComponent(SmokeGreetingComponent);
    fixture.componentRef.setInput('name', 'Foundry');
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Hello, Foundry');
  });

  it('uses the change detection of its project', () => {
    const runsInsideAngularZone = TestBed.inject(NgZone).run(() => NgZone.isInAngularZone());
    expect(runsInsideAngularZone).toBe(inject('changeDetection') === 'zone');
  });
});
