/* TestBed on Node (jsdom) with zone.js. setup-zone patches the global describe/it: the project needs `globals: true`. */
import '@analogjs/vitest-angular/setup-zone';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { provideZoneChangeDetection } from '@angular/core';

setupTestBed({ zoneless: false, providers: [provideZoneChangeDetection()] });
