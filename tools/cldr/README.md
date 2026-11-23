# CLDR table of the first day of the week

`getFirstDayOfWeek` in Utils reads its own table, `date/src/constants/first-day-of-week.cldr.constant.ts`, instead of the week data of the engine, so that every engine and the server give the same day. The table is generated from the CLDR data of Node:

```bash
npm run generate:cldr
```

It lists, for each weekday, the two-letter regions whose week starts on it; Monday, the default, is empty. Two tests guard it:

- `tools/cldr/functions/create-first-day-of-week-source.function.spec.ts`: the generated text is the file in the repository.
- `date/src/constants/first-day-of-week.cldr.constant.spec.ts`: `getFirstDayOfWeek` agrees with the engine (`getWeekInfo()` or `weekInfo`) for every two-letter region, in Node and in the browsers.

When a new Node or browser brings another CLDR and a test fails, run the script, check the differences and release them as a minor version. The data has the Unicode license: the package carries `UNICODE-LICENSE.txt` and its `"license"` is `"MIT AND Unicode-3.0"`.
