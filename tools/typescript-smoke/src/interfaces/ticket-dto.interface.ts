import type { OwnerDto } from './owner-dto.interface';

export interface TicketDto {
  readonly ticket_id: string;
  readonly created_at: Date;
  readonly owner: OwnerDto | null;
}
