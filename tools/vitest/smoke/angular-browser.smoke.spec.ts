/*
 * B1 smoke test: Angular in a real browser (Playwright), zoneless.
 * It only proves that the project starts and that real events reach a component.
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { server, userEvent } from 'vitest/browser';

@Component({
  selector: 'foundry-smoke-counter',
  template: '<button type="button" (click)="count.set(count() + 1)">Clicked {{ count() }} times</button>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SmokeCounterComponent {
  readonly count = signal(0);
}

describe('B1 smoke · Angular in a real browser', () => {
  it('runs in one of the suite browsers', () => {
    expect(['chromium', 'firefox', 'webkit']).toContain(server.browser);
    expect(navigator.userAgent).not.toContain('jsdom');
  });

  it('updates an OnPush component after a real click', async () => {
    const fixture = TestBed.createComponent(SmokeCounterComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    await userEvent.click(button);
    await fixture.whenStable();

    expect(button.textContent).toBe('Clicked 1 times');
  });
});
