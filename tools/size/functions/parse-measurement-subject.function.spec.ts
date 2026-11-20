import { describe, expect, it } from 'vitest';
import { SIZE_MEASUREMENTS } from '../constants/size-measurements.constant.ts';
import { getEntryMeasurementName } from './get-entry-measurement-name.function.ts';
import { parseMeasurementSubject } from './parse-measurement-subject.function.ts';

describe('parseMeasurementSubject', () => {
  it('reads the package and entry of each kind of name', () => {
    expect(parseMeasurementSubject('utils/date: parseDate')).toEqual({
      packageFolder: 'foundry-utils',
      specifier: '@antoniocorraliza/foundry-utils/date',
    });
    expect(parseMeasurementSubject('core (root)')).toEqual({ packageFolder: 'foundry-core', specifier: '@antoniocorraliza/foundry-core' });
    expect(parseMeasurementSubject('ui: every entry')).toEqual({ packageFolder: 'foundry-ui', specifier: '@antoniocorraliza/foundry-ui' });
    expect(parseMeasurementSubject('ui/form-field')).toEqual({
      packageFolder: 'foundry-ui',
      specifier: '@antoniocorraliza/foundry-ui/form-field',
    });
  });

  it('returns null for a name outside the convention', () => {
    expect(parseMeasurementSubject('date picker')).toBeNull();
  });

  it('matches the package and the entry of every budget row', () => {
    SIZE_MEASUREMENTS.forEach((measurement) => {
      expect(parseMeasurementSubject(measurement.name)?.packageFolder, measurement.name).toBe(measurement.packageFolder);
      if (measurement.imports !== 'every-entry' && measurement.imports.length === 1) {
        const entry: string = measurement.imports[0]?.entry ?? '';
        expect(measurement.name.split(': ')[0], measurement.name).toBe(getEntryMeasurementName(measurement.packageFolder, entry));
      }
    });
  });

  it('gives each budget row its own name', () => {
    const names: Array<string> = SIZE_MEASUREMENTS.map((measurement) => measurement.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
