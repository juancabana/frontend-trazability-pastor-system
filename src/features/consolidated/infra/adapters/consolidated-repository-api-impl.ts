import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { ConsolidatedRepository } from '../../domain/gateways/consolidated-repository';
import type { ConsolidatedResponse, AssociationConsolidatedResponse, UnionConsolidatedResponse } from '../../domain/entities/consolidated';
import type { AdminRecipient, SendReportRequest, SendReportResponse } from '../../domain/entities/send-report';
import { API_ENDPOINTS } from '@/constants/api';

export class ConsolidatedRepositoryApiImpl implements ConsolidatedRepository {
  constructor(private readonly http: HttpGateway) {}

  getByPastor(token: string, pastorId: string, periodOffset: number): Promise<ConsolidatedResponse> {
    return this.http.get<ConsolidatedResponse>(
      API_ENDPOINTS.CONSOLIDATED.BY_PASTOR(pastorId, periodOffset),
      token,
    );
  }

  getByAssociation(token: string, assocId: string, periodOffset: number): Promise<AssociationConsolidatedResponse> {
    return this.http.get<AssociationConsolidatedResponse>(
      API_ENDPOINTS.CONSOLIDATED.BY_ASSOCIATION(assocId, periodOffset),
      token,
    );
  }

  getByUnion(token: string, unionId: string, periodOffset: number): Promise<UnionConsolidatedResponse> {
    return this.http.get<UnionConsolidatedResponse>(
      API_ENDPOINTS.CONSOLIDATED.BY_UNION(unionId, periodOffset),
      token,
    );
  }

  getByPastors(token: string, pastorIds: string[], periodOffset: number): Promise<AssociationConsolidatedResponse> {
    return this.http.get<AssociationConsolidatedResponse>(
      API_ENDPOINTS.CONSOLIDATED.BY_PASTORS(pastorIds, periodOffset),
      token,
    );
  }

  sendReport(token: string, data: SendReportRequest): Promise<SendReportResponse> {
    return this.http.post<SendReportResponse>(
      API_ENDPOINTS.CONSOLIDATED.SEND_REPORT,
      data,
      token,
    );
  }

  getAdminRecipients(token: string, associationId: string): Promise<AdminRecipient[]> {
    return this.http.get<AdminRecipient[]>(
      API_ENDPOINTS.ADMIN_RECIPIENTS(associationId),
      token,
    );
  }
}
