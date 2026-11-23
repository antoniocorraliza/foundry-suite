import type { FoundryBinaryInput, FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import type { FoundryCamelCaseKeys } from '@antoniocorraliza/foundry-utils/case';
import { toCamelCaseKeys, toSnakeCaseKeys } from '@antoniocorraliza/foundry-utils/case';
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
import type { FoundryObjectDifference } from '@antoniocorraliza/foundry-utils/object';
import { deepClone, getObjectDifferences, isDeepEqual, removeEmptyValues } from '@antoniocorraliza/foundry-utils/object';
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
  ];
}
