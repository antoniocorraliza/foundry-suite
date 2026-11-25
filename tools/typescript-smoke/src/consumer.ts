import type { FoundryBinaryInput, FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import { downloadBlob, FoundryBrowserApiUnavailableError } from '@antoniocorraliza/foundry-utils/browser';
import type { FoundryCamelCaseKeys } from '@antoniocorraliza/foundry-utils/case';
import { toCamelCaseKeys, toSnakeCaseKeys } from '@antoniocorraliza/foundry-utils/case';
import type { FoundryCsvColumn, FoundryCsvTable } from '@antoniocorraliza/foundry-utils/csv';
import {
  createCsvBlob,
  excelSpanishCsvOptions,
  FoundryCsvParseError,
  parseCsv,
  readCsvFile,
  toCsv,
} from '@antoniocorraliza/foundry-utils/csv';
import type { FoundryCalendarDay, FoundryInstantRange, FoundryLocalDateTime, FoundryWeekday } from '@antoniocorraliza/foundry-utils/date';
import {
  formatDate,
  getFirstDayOfWeek,
  isCalendarDay,
  localDateTimeToDate,
  parseCalendarDay,
  parseLocalDateTime,
  toInstantRange,
} from '@antoniocorraliza/foundry-utils/date';
import type { FoundryFormDataEntries, FoundryFormDataFile } from '@antoniocorraliza/foundry-utils/form-data';
import { createFormData } from '@antoniocorraliza/foundry-utils/form-data';
import { sha256, sha512 } from '@antoniocorraliza/foundry-utils/hash';
import type { FoundryCurrencyFormatOptions, FoundryParseDecimalOptions } from '@antoniocorraliza/foundry-utils/number';
import { createCurrencyFormatter, getParseDecimalOptions, parseDecimal, roundToDecimals } from '@antoniocorraliza/foundry-utils/number';
import type { FoundryObjectDifference } from '@antoniocorraliza/foundry-utils/object';
import { deepClone, getObjectDifferences, isDeepEqual, removeEmptyValues } from '@antoniocorraliza/foundry-utils/object';
import { createRandomCode, createTemporaryId, createUuidV4 } from '@antoniocorraliza/foundry-utils/random';
import { toSlug, truncateText } from '@antoniocorraliza/foundry-utils/text';
import type { FoundryDebouncer } from '@antoniocorraliza/foundry-utils/timing';
import { createDebouncer, sleep } from '@antoniocorraliza/foundry-utils/timing';
import type { FoundryValidatableControl, FoundryValidationErrors } from '@antoniocorraliza/foundry-utils/validation';
import { createControlValidator, isDniOrNie, isEmail } from '@antoniocorraliza/foundry-utils/validation';
import type { TicketDto } from './interfaces/ticket-dto.interface';

export function useUtils(dto: TicketDto): ReadonlyArray<unknown> {
  const ticket: FoundryCamelCaseKeys<TicketDto> = toCamelCaseKeys(dto);
  const createdAt: Date = ticket.createdAt;
  const firstName: string | undefined = ticket.owner?.firstName;
  const bytes: FoundryBinaryInput = new Uint8Array([1]);
  const path: FoundryObjectPath = ['items', 0];
  const differences: ReadonlyArray<FoundryObjectDifference> = getObjectDifferences(dto, deepClone(dto));
  const error: FoundryUtilsError = new FoundryUtilsError('[typescript-smoke]: compiled');
  const createdLabel: string = formatDate(createdAt, { format: 'eu', time: 'minutes' });
  const day: FoundryCalendarDay | null = parseCalendarDay('06/09/2026', { format: 'eu' });
  const range: FoundryInstantRange | null = day === null ? null : toInstantRange(day);
  const meeting: FoundryLocalDateTime | null = parseLocalDateTime('2026-11-14 09:30');
  const meetingStart: Date | null = meeting === null ? null : localDateTimeToDate(meeting, { repeatedTime: 'later' });
  const days: Array<string> = ['2026-09-06', 3].filter(isCalendarDay);
  const firstDayOfWeek: FoundryWeekday = getFirstDayOfWeek('es-ES');
  const euros: FoundryCurrencyFormatOptions = { locale: 'es-ES', currency: 'EUR' };
  const formatEuros: (amount: number | null | undefined) => string = createCurrencyFormatter(euros);
  const decimalOptions: FoundryParseDecimalOptions = getParseDecimalOptions('fr-FR');
  const amount: number | null = parseDecimal('1234,5', decimalOptions);
  const total: string = formatEuros(amount === null ? null : roundToDecimals(amount, 2));
  const slug: string = toSlug(truncateText('Hola Mundo', 8, { suffix: '' }));
  const dniValidator: (control: FoundryValidatableControl) => FoundryValidationErrors | null = createControlValidator(isDniOrNie, 'dni');
  const emails: Array<unknown> = ['ana@example.com', 3].filter(isEmail);
  const columns: ReadonlyArray<FoundryCsvColumn<TicketDto>> = [
    { header: 'Id', value: 'ticket_id' },
    { header: 'Created', value: (row) => row.created_at, format: (value) => String(value) },
  ];
  const csv: string = toCsv([dto], { ...excelSpanishCsvOptions, columns });
  const table: FoundryCsvTable = parseCsv(csv, { delimiter: 'auto', duplicateHeaders: 'suffix' });
  const blob: Blob = createCsvBlob([dto], { columns, byteOrderMark: false });
  const readTable: Promise<FoundryCsvTable> = readCsvFile(blob, { encoding: 'windows-1252' });
  const isCsvError: boolean = new Error('[typescript-smoke]: compiled') instanceof FoundryCsvParseError;
  const isBrowserError: boolean = error instanceof FoundryBrowserApiUnavailableError;
  const download: (file: Blob, fileName: string) => void = downloadBlob;
  const uuid: string = createUuidV4();
  const code: string = createRandomCode(6, { alphabet: 'abcdef0123456789' });
  const temporaryId: number = createTemporaryId();
  const digests: Promise<Array<string>> = Promise.all([sha256('abc'), sha512(new Uint8Array([97, 98, 99]))]);
  const controller: AbortController = new AbortController();
  const waiting: Promise<void> = sleep(10, { signal: controller.signal });
  const saveDraft: FoundryDebouncer<[draft: TicketDto]> = createDebouncer((draft: TicketDto) => draft, 500);
  saveDraft.schedule(dto);
  const attachment: FoundryFormDataFile = { file: blob, fileName: 'tickets.csv', contentType: 'text/csv' };
  const fields: FoundryFormDataEntries = { subject: 'Hola', priority: 2, attachments: [blob, attachment], metadata: { json: dto } };
  const body: FormData = createFormData(fields, { arrayKeyStyle: 'brackets' });
  return [
    createdAt,
    firstName,
    bytes,
    path,
    differences,
    isDeepEqual(dto, ticket),
    removeEmptyValues(dto),
    toSnakeCaseKeys(ticket),
    error,
    createdLabel,
    range,
    meetingStart,
    days,
    firstDayOfWeek,
    total,
    slug,
    dniValidator({ value: '12345678Z' }),
    emails,
    table.rows[0]?.['Id'],
    readTable,
    isCsvError,
    isBrowserError,
    download,
    uuid,
    code,
    temporaryId,
    digests,
    waiting,
    saveDraft.isPending(),
    body,
  ];
}
