import type { ConsolidatedResponse, AssociationConsolidatedResponse, UnionConsolidatedResponse } from '../entities/consolidated';
import type { AdminRecipient, SendReportRequest, SendReportResponse } from '../entities/send-report';

export interface ConsolidatedRepository {
  getByPastor(token: string, pastorId: string, periodOffset: number): Promise<ConsolidatedResponse>;
  getByAssociation(token: string, assocId: string, periodOffset: number): Promise<AssociationConsolidatedResponse>;
  getByUnion(token: string, unionId: string, periodOffset: number): Promise<UnionConsolidatedResponse>;
  getByPastors(token: string, pastorIds: string[], periodOffset: number): Promise<AssociationConsolidatedResponse>;
  sendReport(token: string, data: SendReportRequest): Promise<SendReportResponse>;
  getAdminRecipients(token: string, associationId: string): Promise<AdminRecipient[]>;
}
