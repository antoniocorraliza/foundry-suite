import type { FoundryBinaryInput, FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import { FoundryUtilsError } from '@antoniocorraliza/foundry-utils';
import type { FoundryCamelCaseKeys } from '@antoniocorraliza/foundry-utils/case';
import { toCamelCaseKeys, toSnakeCaseKeys } from '@antoniocorraliza/foundry-utils/case';
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
  return [createdAt, firstName, bytes, path, differences, isDeepEqual(dto, ticket), removeEmptyValues(dto), toSnakeCaseKeys(ticket), error];
}
