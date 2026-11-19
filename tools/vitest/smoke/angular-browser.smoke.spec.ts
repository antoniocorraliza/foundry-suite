import type { WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, signal, VERSION } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { inject } from 'vitest';
import { server, userEvent } from 'vitest/browser';

@Component({
  selector: 'foundry-smoke-counter',
  template: '<button type="button" (click)="count.set(count() + 1)">Clicked {{ count() }} times</button>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SmokeCounterComponent {
  readonly count: WritableSignal<number> = signal(0);
}

describe('smoke: Angular in a real browser', () => {
  it('runs with the expected Angular major', () => {
    expect(Number(VERSION.major)).toBe(inject('expectedAngularMajor'));
  });

  it('runs in one of the suite browsers', () => {
    expect(['chromium', 'firefox', 'webkit']).toContain(server.browser);
    expect(navigator.userAgent).not.toContain('jsdom');
  });

  it('updates an OnPush component after a real click', async () => {
    const fixture: ComponentFixture<SmokeCounterComponent> = TestBed.createComponent(SmokeCounterComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    await userEvent.click(button);
    await fixture.whenStable();

    expect(button.textContent).toBe('Clicked 1 times');
  });
});
