// Pre-bundled up front: on a cold start Vite sometimes failed to load them in the middle of a run.
export const ANGULAR_OPTIMIZED_DEPENDENCIES: ReadonlyArray<string> = [
  '@angular/common',
  '@angular/common/http',
  '@angular/common/http/testing',
  '@angular/core',
  '@angular/core/testing',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/platform-browser/testing',
  '@angular/router',
  'rxjs',
  'rxjs/operators',
];
