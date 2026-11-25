# Foundry Utils

[![License: MIT AND Unicode-3.0](https://img.shields.io/badge/license-MIT%20AND%20Unicode--3.0-blue.svg)](LICENSE)

TypeScript utilities of Foundry Suite for dates, numbers, text, CSV files, validation and forms, with no framework and no dependencies.

## Status

**Version 2.0 is in development.** It has not been released and it is not ready for use. Its twelve entries are implemented and tested, and their API can still change before 2.0.0.

Version 1.x is deprecated on npm: it has known defects and must not be used in new projects.

## Install

Version 2.0 is not published yet. Its release candidates will be published with the `next` tag:

```bash
npm install @antoniocorraliza/foundry-utils@next
```

It has no dependencies and no peer dependencies. Each entry is imported from its own path:

```ts
import { parseDate } from '@antoniocorraliza/foundry-utils/date';
```

The root, `@antoniocorraliza/foundry-utils`, exports the error classes that several entries share (`FoundryUtilsError`, the base of every error class of the package, `FoundryCircularReferenceError` and `FoundryCryptoUnavailableError`) and the types `FoundryObjectPath` and `FoundryBinaryInput`. Its other names are internal and can change in any version.

No function changes its arguments. Importing an entry does not read `crypto`, `document` or the timers: they are read when a function is called, so every entry can be imported on Node.

## Compatibility

| Environment                   | Supported                                             | Tested                                       |
| :---------------------------- | :---------------------------------------------------- | :------------------------------------------- |
| Node                          | 22.12 or later                                        | Latest Node 22 and Node 24                   |
| Modules                       | ES modules only                                       | `import` only                                |
| TypeScript                    | 5.5 or later                                          | 5.5, 6.0 and 7.0                             |
| Browsers                      | Last two versions of Chrome, Edge, Firefox and Safari | Chromium, Firefox and WebKit from Playwright |
| Angular                       | No Angular code and no peer dependency                | Types only                                   |
| Bundlers                      | `"sideEffects": false`                                | esbuild and Rollup                           |
| Vitest                        | Yes, also with jsdom                                  | Runs the tests of the library                |
| Jest                          | Jest 30 with jsdom and the recipe below               | Jest 30                                      |
| Deno, Bun, Cloudflare Workers | -                                                     | Not tested                                   |

Notes:

- Node: every entry except `/browser` works without a DOM, also in server-side rendering. Earlier releases of Node 22 are not tested.
- Modules: `require()` of an entry from a CommonJS file of Node is not tested.
- TypeScript: with `moduleResolution` set to `bundler`; from a CommonJS file (`.cts`), 6.0 or later with `nodenext`. A consumer of the packed library that imports every entry compiles with 5.5, 6.0 and 7.0, with the DOM types and with only `@types/node`; a `.cts` file compiles with 6.0 and 7.0 and fails with 5.5 (TS1479). `node10` is not supported: it does not read `exports`, so the entries do not resolve. Not tested: `node16`, and `nodenext` from an ES module.
- Browsers: not tested in Safari or Edge.
- Angular: `createControlValidator` returns a function that Angular accepts as a `ValidatorFn`, which is type-checked. Not tested in an Angular app.
- Bundlers: each entry is bundled with esbuild and with Rollup to check its size. Not tested in an app built with the Angular CLI, Vite or webpack.
- Jest: not tested with `ts-jest`.

### Jest

Jest loads test files as CommonJS and does not transform `node_modules`, so it fails on this package with "Must use import to load ES Module". Let Babel transform it:

```bash
npm install --save-dev jest jest-environment-jsdom @babel/core @babel/preset-env
```

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  transform: { '\\.[cm]?js$': 'babel-jest' },
  transformIgnorePatterns: ['/node_modules/(?!@antoniocorraliza/foundry-utils/)'],
};
```

```js
// babel.config.js
module.exports = { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] };
```

`readCsvFile` needs `TextDecoder` and `Blob.prototype.arrayBuffer`, which `jest-environment-jsdom` lacks: there it rejects with a `TypeError` that names them. `sha256` and `sha512` reject with `FoundryCryptoUnavailableError`, because the `crypto` of jsdom has no `crypto.subtle`. A test that reads a file or computes a hash runs in the `node` environment, with this comment at the top of the file:

```js
/** @jest-environment node */
```

`/random`, `/timing` and `/form-data` work with jsdom. `downloadBlob` throws `FoundryBrowserApiUnavailableError`, because jsdom has no `URL.createObjectURL`.

## Entries

| Entry         | What it does                                                                                        |
| :------------ | :-------------------------------------------------------------------------------------------------- |
| `/date`       | Dates as `Date`, and days and clock times kept as text so that the time zone does not move them.    |
| `/number`     | Rounding that follows the decimal digits as they are written, not the binary value.                 |
| `/text`       | Truncation that never splits a visible character, and slugs for URLs.                               |
| `/case`       | snake_case keys from a backend become camelCase, in depth and in the type, and back.                |
| `/object`     | Deep comparison and copies of plain data, with the list of what changed.                            |
| `/csv`        | RFC 4180 CSV, with formulas escaped, read from UTF-8, UTF-16 or Windows-1252 files.                 |
| `/browser`    | One function, `downloadBlob`, which saves a Blob under a name that every operating system accepts.  |
| `/validation` | Is it an email, a URL, a phone number or a Spanish DNI? Checks like these, also as form validators. |
| `/random`     | UUIDs and random codes from `crypto`, never from `Math.random`.                                     |
| `/hash`       | SHA-256 and SHA-512 of a text or of bytes, in hexadecimal.                                          |
| `/timing`     | A `sleep` that an `AbortSignal` can cancel, and debouncers that do not share a timer.               |
| `/form-data`  | Turns a plain object, files included, into a `FormData`.                                            |

The types and the JSDoc of each function describe its whole API. The examples show the main functions.

### `/date`

```ts
import {
  addCalendarDays,
  formatDate,
  localDateTimeToDate,
  parseCalendarDay,
  parseDate,
  toInstantRange,
} from '@antoniocorraliza/foundry-utils/date';

parseDate('1/3/2026', { format: 'eu' }); // 1 March 2026 at local midnight
parseDate('31/04/2026', { format: 'eu' }); // null: never today, never an invalid Date
formatDate(new Date(2026, 2, 1), { format: 'eu' }); // '01/03/2026'

parseCalendarDay('2026-03-01T00:00:00.000Z', { acceptMidnightInstant: true }); // '2026-03-01' in every time zone
addCalendarDays('2026-02-28', 1); // '2026-03-01'

const { start, endExclusive } = toInstantRange({ start: '2026-03-01', end: '2026-03-31' });
// the invoices of March: createdAt >= start and createdAt < endExclusive

localDateTimeToDate('2026-03-29T02:30'); // null in Europe/Madrid, whose clock skips that time
```

A day travels as `YYYY-MM-DD` and stays in the app as that text (`FoundryCalendarDay`): reading, writing, adding and comparing days does not depend on the time zone. A backend that sends a day as a UTC midnight (`2026-03-01T00:00:00.000Z`) is read with `calendarDate: true` in `parseDate` or `acceptMidnightInstant: true` in `parseCalendarDay`, and is written with `toUtcCalendarDateString`. Numeric timestamps are milliseconds; pass `timestampUnit: 'seconds'` for seconds.

A clock time, such as an appointment, stays in the app as `YYYY-MM-DDTHH:mm` text (`FoundryLocalDateTime`). `localDateTimeToDate` turns it into an instant: `null` when the time zone skips that time, and the first of two repeated times, or the second with `repeatedTime: 'later'`. A day whose clock skips midnight starts at its first instant: `parseDate('2026-09-06')` is 01:00 in America/Santiago.

`getIsoWeek` and `getIsoWeeksOfMonth` give ISO 8601 weeks. `getCalendarWeek` and `getCalendarMonthGrid` start on Monday unless `firstDayOfWeek` says otherwise. `getFirstDayOfWeek(locale)` reads a table of Unicode CLDR 48 that the package carries, not the data of the engine; it gives Monday when the region is unknown.

### `/number`

```ts
import { formatCurrency, parseDecimal, roundToDecimals } from '@antoniocorraliza/foundry-utils/number';

roundToDecimals(4.015, 2); // 4.02, as it is written in decimal (Math.round gives 4.01)
formatCurrency(4.015, { locale: 'es-ES', currency: 'EUR' }); // 4,02 € in Spanish, rounded as roundToDecimals rounds
parseDecimal('1.234.567,5', { decimalSeparator: ',', groupSeparator: '.' }); // 1234567.5
```

`formatNumber`, `formatCurrency` and `createCurrencyFormatter` take the language and the currency from their options, never from the device. `getParseDecimalOptions(locale)` gives the options that read what `formatNumber` writes in a language. That round trip is tested with `es-ES`, `de-DE`, `it-IT`, `pt-BR`, `tr-TR`, `en-US`, `ja-JP`, `zh-CN`, `es-MX`, `fr-FR`, `pl-PL`, `pt-PT`, `cs-CZ`, `ru-RU`, `uk-UA`, `sv-SE`, `nb-NO`, `fi-FI`, `lt-LT`, `et-EE`, `de-CH`, `it-CH`, `fr-CH`, `en-IN`, `hi-IN`, `he-IL`, `ar-EG-u-nu-latn` and `ar-MA`.

### `/text`

```ts
import { parseBoolean, toSlug, truncateText } from '@antoniocorraliza/foundry-utils/text';

truncateText('Factura de marzo', 10, { suffix: '...' }); // 'Factura...'
toSlug('Canción de Ángel Pérez'); // 'cancion-de-angel-perez'
parseBoolean('sí'); // true; parseBoolean('nope') gives null
```

`truncateText` counts visible characters, so it never splits an emoji or a letter with its accent, and its suffix counts inside the limit. Its default suffix is the ellipsis character.

### `/case`

```ts
import { toCamelCaseKeys, toSnakeCaseKeys } from '@antoniocorraliza/foundry-utils/case';

toCamelCaseKeys({ user_id: 7, created_at: '2026-03-01', lines: [{ unit_price: 10 }] });
// { userId: 7, createdAt: '2026-03-01', lines: [{ unitPrice: 10 }] }, also in the type
toSnakeCaseKeys({ userId: 7 }); // { user_id: 7 }
```

Only the keys of plain objects and arrays change: dates, maps, sets, files and class instances are kept by reference. Two keys that convert to the same key throw `FoundryKeyCollisionError`, unless `onCollision` is `'keepFirst'` or `'keepLast'`. Type the response with the shape that the backend sends (snake_case) and let the converted type give the camelCase model. A canonical key comes back from a round trip, except when a one-letter word is followed by a word without a lower-case second letter, such as `pos_x_y`.

### `/object`

```ts
import { getObjectDifferences, isDeepEqual, moveArrayItem, removeEmptyValues } from '@antoniocorraliza/foundry-utils/object';

isDeepEqual({ due: new Date(2026, 2, 1) }, { due: new Date(2026, 2, 1) }); // true
getObjectDifferences({ name: 'Ana', city: 'Soria' }, { name: 'Ana', city: 'Teruel' });
// [{ path: ['city'], kind: 'changed', previous: 'Soria', current: 'Teruel' }]
removeEmptyValues({ name: 'Ana', phone: null }); // { name: 'Ana' }
const reordered = moveArrayItem(rows, 0, 2); // a new array; rows does not change
```

`deepClone` throws `FoundryCloneError` instead of returning a copy that differs from the value, such as one without its functions or with a class instance turned into a plain object; files and blobs are kept by reference. `removeEmptyValues` keeps the `null` items and the holes of arrays unless `removeEmptyArrayItems` is `true`.

`pickProperties` and `omitProperties` take plain objects only, and throw a `TypeError` with a class instance. In NestJS with `ValidationPipe({ transform: true })`, the body arrives as an instance of its DTO class: turn it into a plain object first, for example with `instanceToPlain` of `class-transformer`.

### `/csv`

```ts
import { createCsvBlob, excelSpanishCsvOptions, readCsvFile, toCsv } from '@antoniocorraliza/foundry-utils/csv';

const text = toCsv(invoices, {
  columns: [
    { header: 'Customer', value: 'customer' },
    { header: 'Total', value: 'total' },
  ],
});
const blob = createCsvBlob(invoices, excelSpanishCsvOptions); // semicolons and decimal commas, in UTF-8 with its byte order mark
const table = await readCsvFile(file); // { delimiter, headers, rows }
```

Every line ends with CRLF and a cell is quoted only when it needs it. A text that a spreadsheet would run as a formula gets an apostrophe in front; a number never does. A cell holding an object without a `format` function throws a `TypeError`. `readCsvFile` chooses the separator from the first lines and the encoding from the first bytes. A row with more or fewer cells than the headers throws `FoundryCsvParseError` with its line, unless `relaxColumnCount` is `true`, which fills missing cells and drops extra empty ones. Headers are not trimmed unless `trimCells` is `true`.

### `/browser`

```ts
import { createCsvBlob } from '@antoniocorraliza/foundry-utils/csv';
import { downloadBlob } from '@antoniocorraliza/foundry-utils/browser';

downloadBlob(createCsvBlob(invoices), 'Factura 2026/03.csv'); // saved as 'Factura 2026-03.csv'
```

`downloadBlob` replaces the characters that a file name cannot have with `-`, removes final spaces and dots, and puts `_` in front of a reserved name of Windows (`CON.csv` is saved as `_CON.csv`). Without `document`, `URL.createObjectURL` or `URL.revokeObjectURL`, as on Node, it throws `FoundryBrowserApiUnavailableError`.

### `/validation`

```ts
import { createControlValidator, isDniOrNie, isUrl, normalizePhoneNumber, normalizeUrl } from '@antoniocorraliza/foundry-utils/validation';

isDniOrNie('12.345.678-Z'); // true
isUrl('javascript:alert(1)'); // false
normalizePhoneNumber('0034 600 000 000'); // '+34600000000'
normalizeUrl('www.empresa.es', { allowMissingProtocol: true }); // 'https://www.empresa.es/'

const dniValidator = createControlValidator(isDniOrNie, 'dni'); // null for an empty or valid value, { dni: true } otherwise
```

The `is...` functions of this entry never throw, whatever they receive. Those without options can be passed to `filter` (`values.filter(isEmail)`); with options, TypeScript rejects it, because `filter` would pass the index as the options. A validator of `createControlValidator` accepts an empty value: add `Validators.required` when the field is required.

### `/random`

```ts
import { createRandomCode, createTemporaryId, createUuidV4 } from '@antoniocorraliza/foundry-utils/random';

createUuidV4(); // a version 4 UUID
createRandomCode(6); // six characters of A-Z, a-z and 0-9, all equally likely
createTemporaryId(); // a negative integer, for a row that is not saved yet
```

`createUuidV4` uses `crypto.randomUUID` and, where it is missing, such as on plain HTTP, `crypto.getRandomValues`. Without `crypto`, the three functions throw `FoundryCryptoUnavailableError`.

### `/hash`

```ts
import { sha256 } from '@antoniocorraliza/foundry-utils/hash';

await sha256('abc'); // 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
```

A text is encoded as UTF-8 without normalizing or trimming it: a composed and a decomposed `ñ` give different hashes. `sha256` and `sha512` never throw: every error, also a wrong argument, comes as a rejected promise.

### `/timing`

```ts
import { createDebouncer, sleep } from '@antoniocorraliza/foundry-utils/timing';

const autosave = createDebouncer((draft: Draft) => saveDraft(draft), 500);
autosave.schedule(draft); // runs 500 ms after the last schedule, with its arguments
autosave.flush(); // runs the pending call now
autosave.dispose(); // when the screen closes: the pending call and later schedules do nothing

await sleep(1000, { signal: controller.signal }); // rejects with the reason of the signal when it aborts
```

Each debouncer has its own timer, and its methods work on their own, such as `observable.subscribe(autosave.schedule)`. In Angular, `debounceTime` of RxJS is the usual way to wait inside a stream; `createDebouncer` is for a callback outside an Observable, such as an autosave or a DOM event.

### `/form-data`

```ts
import { createFormData } from '@antoniocorraliza/foundry-utils/form-data';

const body = createFormData({
  subject: 'Broken printer',
  priority: 2,
  attachments: files,
  photo: { file: blob, fileName: 'photo.jpg', contentType: 'image/jpeg' },
  metadata: { json: { source: 'web' } },
});
```

Numbers and booleans are sent as text, and `null` and `undefined` are left out. Each item of a list is a part with the same key (`'brackets'` in `arrayKeyStyle` gives `attachments[]`). Each file keeps its own name, and a Blob without one is named `blob`. An object travels only as JSON, with `{ json }`; a `Date`, a `Map` or any other value outside the type throws a `TypeError` with its key.

## How it is tested

Every entry has its tests in Vitest, next to its code, and runs on Node 22 and 24. Besides:

- `/date` and `/csv` run in four time zones, each in its own process: `Europe/Madrid`, `America/Mexico_City`, `America/Santiago` (its clock changes at midnight) and `UTC`. `Pacific/Apia`, which skipped 30 December 2011, and `Australia/Lord_Howe`, whose clock moves 30 minutes, run the cases of those time zones. The other entries do not depend on the time zone and run in `UTC`.
- The arithmetic of calendar days is compared with a reference on every day from 0001-01-01 to 9999-12-31, and local date and times on every minute from 2020 to 2030, in the four time zones.
- Property tests with fast-check generate the inputs of the round trips (dates, CSV, keys and decimals) and compare `roundToDecimals` with an exact reference.
- The entries that depend on the engine run in Chromium, Firefox and WebKit from Playwright, in `Europe/Madrid` and `America/Santiago`: `/date`, `/number`, `/text`, `/csv`, `/browser`, `/random`, `/hash`, `/form-data`, the reading of URLs and `deepClone`.
- Vitest with jsdom runs the functions that take objects of jsdom: `deepClone`, `readCsvFile`, `createFormData` and `downloadBlob`.
- Two apps install the packed library: one runs it under Jest 30 with jsdom and the recipe above, and the other compiles it with TypeScript 5.5, 6.0 and 7.0.
- CSV files were checked by hand in LibreOffice Calc and Google Sheets with Spanish settings, and downloads in Chrome, Firefox, and Safari on iPhone and iPad.

Not tested, besides the environments of the compatibility notes:

- Microsoft Excel.
- Downloads in Safari on macOS.
- The recipe of a JSON part with Spring.
- The recipe of a DTO with NestJS and `class-transformer`.

## Known limits

Dates:

- On clock changes whose offset has seconds, which is local mean time before about 1900, `repeatedTime: 'later'` returns the first reading, and `toIsoStringWithOffset` throws a `RangeError`.
- For a language tag without a region, or with an old region code, the result of `getFirstDayOfWeek` depends on the data of the engine (`maximize()` and the aliases of `Intl.Locale`). WebKit, for example, does not read `BU` as `MM`.

Numbers and validation:

- `parseDecimal` reads Latin digits only: Arabic, Persian, Bengali and other digits are not read.
- `getParseDecimalOptions` reads the data of the engine, which can change between engines and versions. `parseDecimal` does not depend on it.
- `formatCurrency` accepts any well-formed ISO 4217 code that `Intl` accepts. Utils has no table of currencies.
- `isPhoneNumber` without `country` checks the international format (8 to 15 digits), not the numbering plan of each country. To validate other countries strictly, use a dedicated library such as `libphonenumber-js`.
- `isUrl` and `normalizeUrl` reject a host that the URL parser would percent-encode: Chromium accepts a space in a host, the other engines do not.
- `normalizeUrl` returns the canonical form of the URL parser (lower-case scheme and host, punycode, a final `/`): fit to store and compare, not to show as the user wrote it.
- `isDniOrNie` checks personal documents only (DNI and NIE), not the NIF K, L and M nor a company CIF.
- `normalizeUrl` with `allowMissingProtocol` does not accept a host with a port, such as `localhost:4200`: it reads `localhost:` as a scheme and returns `null`. Write the protocol in front.

Objects and keys:

- The functions of `/case` and `/object` walk nested data recursively. From about 2,000 levels of nesting, or fewer in some functions and engines, they run out of call stack and throw the `RangeError` of the engine, also `isDeepEqual` and `hasEmptyValue`, which throw nothing else.
- An exotic object, such as a revoked `Proxy`, makes `isPlainObject`, `isDeepEqual`, `hasEmptyValue` and `hasValue` throw the `TypeError` of the engine.

CSV and spreadsheets:

- Use `excelSpanishCsvOptions` for spreadsheets with Spanish settings: with the default options, decimal numbers may open as text.
- LibreOffice Calc shows the apostrophe that escapes a formula; Google Sheets hides it, because it takes it as a text mark.
- Spreadsheets may read a text made only of digits as a number (a phone number without spaces, a postal code with a leading zero). Write phone numbers with spaces, or import those columns as text.
- With an explicit `encoding`, a byte order mark of another encoding is not interpreted: it stays in the text.

Browser:

- In Vitest with jsdom, `downloadBlob` creates and clicks the link but downloads nothing, because jsdom uses the `URL` of Node. Spy on it in tests.

Random, hash, timing and forms:

- The ids of `createTemporaryId` are for local use only, such as rows not yet saved or list keys. Never send them to a backend as real ids: they do not fit in a 32-bit integer.
- In a browser, `sha256` and `sha512` need `crypto.subtle`, which only exists in a secure context (HTTPS or `localhost`); without it they reject with a `FoundryCryptoUnavailableError` that says so.
- `flush()` does not wait for an `async` callback nor return its result; if that callback fails, the rejection reaches the global handler.
- `createFormData` follows the order of `Object.keys`: keys shaped like integers go first, and text keys keep the order in which they are written.
- With jsdom, a Blob of Node (`node:buffer`, `fs.openAsBlob`, or `fetch(...).blob()` in Vitest with jsdom) gives a `TypeError` with its key instead of being sent as text. Use the `File` or `Blob` of the same environment as the `FormData`.
- `{ json }` sends the JSON as a text part, without `Content-Type`. For a backend that needs a part of type `application/json`, pass a Blob: `createFormData({ data: new Blob([JSON.stringify(data)], { type: 'application/json' }) })`. The part is named `blob`, as any Blob.

## Coming from 1.x

Every function of 1.x lived in a class of the root; in 2.0 each one is a function of an entry.

| 1.x                                                                                              | 2.0                                                                                                                            |
| :----------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `normalizeResponseObjectNames`, `normalizeResponseCollectionNames`, `normalizeObjectNames`       | `toCamelCaseKeys` (`/case`)                                                                                                    |
| `new FoundryDateUtils(x)`, `toJavascriptFormat(x)`                                               | `parseDate(x)` (`/date`)                                                                                                       |
| `toStringDate(x, 'JAP' \| 'EU' \| 'USA')`                                                        | `formatDate(date, { format: 'iso' \| 'eu' \| 'us' })`                                                                          |
| `toStringHours(x)`                                                                               | `formatTime(date)`                                                                                                             |
| `toPhpFormat(date)`                                                                              | `toIsoStringWithOffset(date)`                                                                                                  |
| `secondsConverter(seconds)`                                                                      | `splitDuration(seconds)`, `formatDuration(seconds)`                                                                            |
| `getDaysByQuantity(count, date)`                                                                 | `getConsecutiveDays(date, count)`                                                                                              |
| `getDaysFromInterval(start, end, step)`                                                          | `getDaysInRange(start, end, { stepInDays: step })`                                                                             |
| `getDaysFromWeeks(count, date)`, `getDaysBy(date, 'weekly')`                                     | `getCalendarWeek(date, { weeks: count })`                                                                                      |
| `getDaysBy(date, 'monthly')`                                                                     | `getCalendarMonthGrid(date)`                                                                                                   |
| `getWeek(date)`, `getWeek(date, 'monthly')`                                                      | `getIsoWeek(date).week`, `getIsoWeeksOfMonth(date)`                                                                            |
| `yearList(years)`                                                                                | `getYearRange({ yearsBefore: years, yearsAfter: years })`                                                                      |
| `round`, `clamp`, `padNumber(value)`, `formatCurrency(x, 'EUR', 'es-ES')`                        | `roundToDecimals`, `clampNumber`, `padNumber(value, 2)`, `formatCurrency(x, { currency: 'EUR', locale: 'es-ES' })` (`/number`) |
| `capitalize`, `truncate(text, length, suffix)`, `normalizeBoolean(value)`                        | `capitalizeFirstLetter`, `truncateText(text, length, { suffix })`, `parseBoolean(value) ?? false` (`/text`)                    |
| `compareObjects`, `cloneObject`, `cleanObject`, `hasEmptyValues(x, fields)`                      | `isDeepEqual`, `deepClone`, `removeEmptyValues`, `hasEmptyValue(x, { fields })` (`/object`)                                    |
| `getObjectSubset`, `getObjectWithoutProperties`                                                  | `pickProperties`, `omitProperties`                                                                                             |
| `exportToCsv(name, data, mappings)`                                                              | `downloadBlob(createCsvBlob(data, { columns }), name + '.csv')` (`/csv` and `/browser`)                                        |
| `importFromCsv({ file })`                                                                        | `readCsvFile(file)`                                                                                                            |
| `isValidEmail`, `isValidUrl`, `isValidPhoneNumber`, `isValidUUID`, `isValidDNI`, `isValidJSON`   | `isEmail`, `isUrl`, `isPhoneNumber`, `isUuid`, `isDniOrNie`, `isValidJson` (`/validation`)                                     |
| `generateUuid`, `randomCode(length)`, `randomId`                                                 | `createUuidV4`, `createRandomCode(length)`, `createTemporaryId` (`/random`)                                                    |
| `sha256`, `sha512`                                                                               | `sha256`, `sha512` (`/hash`)                                                                                                   |
| `sleep(ms)`, `simpleDebouncer(fn, ms)`, `formDebouncer(...)`                                     | `sleep(ms)`, `createDebouncer(fn, ms).schedule(...)` (`/timing`)                                                               |
| `setFormData([{ key, data, fileName }])`                                                         | `createFormData({ [key]: { file: data, fileName } })` (`/form-data`)                                                           |
| `hexadecimalEncrypt`, `hexadecimalDecrypt`, `convertArrayToObject`, `removeScapeChars`, `logOut` | Removed                                                                                                                        |

Some replacements compile and return something else. An invalid date gives `null` instead of today, and `'2026-03-01'` is 1 March in every time zone. Weeks follow ISO 8601. `roundToDecimals(4.015, 2)` is `4.02`. `user_id` becomes `userId`, not `idUser`. `moveArrayItem` returns a new array and leaves the old one as it was. A CSV uses `,` between cells unless `excelSpanishCsvOptions` is passed. `parseBoolean('sí')` is `true`. The JSDoc of each function describes its result.

## License

[MIT](LICENSE) © 2026 Antonio Corraliza León.

The first day of the week of `getFirstDayOfWeek` comes from Unicode CLDR 48, under the [Unicode License v3](UNICODE-LICENSE.txt).
