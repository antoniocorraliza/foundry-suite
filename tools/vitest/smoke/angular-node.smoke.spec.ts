import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input, NgZone, VERSION } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { inject } from 'vitest';

@Component({
  selector: 'foundry-smoke-greeting',
  template: '<p>Hello, {{ name() }}</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SmokeGreetingComponent {
  readonly name: InputSignal<string> = input.required<string>();
}

// describe and it are the globals on purpose: imported from vitest, the test would run outside the zone.js ProxyZone.
describe('smoke: Angular on Node (jsdom)', () => {
  it('runs with the expected Angular major', () => {
    expect(Number(VERSION.major)).toBe(inject('expectedAngularMajor'));
  });

  it('renders an OnPush component with a required signal input', async () => {
    const fixture: ComponentFixture<SmokeGreetingComponent> = TestBed.createComponent(SmokeGreetingComponent);
    fixture.componentRef.setInput('name', 'Foundry');
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Hello, Foundry');
  });

  it('uses the change detection of its project', () => {
    const runsInsideAngularZone: boolean = TestBed.inject(NgZone).run(() => NgZone.isInAngularZone());
    expect(runsInsideAngularZone).toBe(inject('changeDetection') === 'zone');
  });
});
