import type { ConsolidatedResponse, AssociationConsolidatedResponse, UnionConsolidatedResponse } from '../entities/consolidated';
import type { AdminRecipient, SendReportRequest, SendReportResponse } from '../entities/send-report';

export interface ConsolidatedRepository {
  getByPastor(token: string, pastorId: string, month: number, year: number): Promise<ConsolidatedResponse>;
  getByAssociation(token: string, assocId: string, month: number, year: number): Promise<AssociationConsolidatedResponse>;
  getByUnion(token: string, unionId: string, month: number, year: number): Promise<UnionConsolidatedResponse>;
  getByPastors(token: string, pastorIds: string[], month: number, year: number): Promise<AssociationConsolidatedResponse>;
  sendReport(token: string, data: SendReportRequest): Promise<SendReportResponse>;
  getAdminRecipients(token: string, associationId: string): Promise<AdminRecipient[]>;
}
