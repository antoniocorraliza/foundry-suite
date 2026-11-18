/* TestBed in a real browser, zoneless. The fixture stays in the page after each test. */
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed({ zoneless: true, teardown: { destroyAfterEach: false } });
