import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'foundry-size-forms-app',
  imports: [NgClass, ReactiveFormsModule, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input [formControl]="search" />
    @for (item of items(); track item) {
      <p [ngClass]="{ selected: item === search.value }">{{ item }}</p>
    }
    <router-outlet />
  `,
})
export class SizeFormsAppComponent implements OnInit {
  // INJECTORS
  private readonly httpClientSE: HttpClient = inject(HttpClient);

  // CONTROL VARIABLES
  readonly items: WritableSignal<Array<string>> = signal([]);
  readonly search: FormControl<string> = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  // LIFECYCLE HOOKS
  ngOnInit(): void {
    this.httpClientSE
      .get<Array<string>>('/items')
      .pipe(map((items) => items.map((item) => item.trim())))
      .subscribe((items) => this.items.set(items));
  }
}
