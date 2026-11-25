import type { Observable } from 'rxjs';
import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryDebouncer } from './public-api';
import { createDebouncer, sleep } from './public-api';

declare const numberObservable: Observable<number>;

describe('types of the timing entry', () => {
  it('declares sleep as the design fixes it, returning a promise', () => {
    expectTypeOf(sleep).toEqualTypeOf<(milliseconds: number, options?: { readonly signal?: AbortSignal }) => Promise<void>>();
  });

  it('gives the debouncer the arguments of the callback', () => {
    const debouncer: FoundryDebouncer<[draft: number]> = createDebouncer((draft: number) => draft, 500);
    expectTypeOf(debouncer.schedule).toEqualTypeOf<(draft: number) => void>();
    expectTypeOf(debouncer.isPending).toEqualTypeOf<() => boolean>();
    // @ts-expect-error schedule needs the argument of the callback
    debouncer.schedule();
    // @ts-expect-error the argument is a number
    debouncer.schedule('5');
  });

  it('lets schedule be passed on its own to the subscription of an Observable and to an event listener', () => {
    numberObservable.subscribe(createDebouncer((value: number) => value, 300).schedule);
    new EventTarget().addEventListener('input', createDebouncer((event: Event) => event, 300).schedule);
  });
});
