import type { Association, ExtraRecipient, AddExtraRecipientRequest } from '../entities/association';

export interface AssociationRepository {
  getAll(): Promise<Association[]>;
  getByUnion(unionId: string): Promise<Association[]>;
  updateMyDeadline(token: string, day: number): Promise<Association>;
  getExtraRecipients(token: string, associationId: string): Promise<ExtraRecipient[]>;
  addExtraRecipient(token: string, associationId: string, data: AddExtraRecipientRequest): Promise<ExtraRecipient>;
  removeExtraRecipient(token: string, associationId: string, recipientId: string): Promise<void>;
}
