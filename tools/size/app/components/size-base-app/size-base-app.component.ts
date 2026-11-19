import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'foundry-size-base-app',
  imports: [NgClass, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './size-base-app.component.html',
})
export class SizeBaseAppComponent implements OnInit {
  // INJECTORS
  private readonly httpClientSE: HttpClient = inject(HttpClient);

  // CONTROL VARIABLES
  readonly items: WritableSignal<Array<string>> = signal([]);
  readonly selectedItem: WritableSignal<string | null> = signal(null);

  // LIFECYCLE HOOKS
  ngOnInit(): void {
    this.loadItems();
  }

  // ACTIONS
  private loadItems(): void {
    this.httpClientSE
      .get<Array<string>>('/items')
      .pipe(map((items) => items.map((item) => item.trim())))
      .subscribe((items) => this.items.set(items));
  }
}
