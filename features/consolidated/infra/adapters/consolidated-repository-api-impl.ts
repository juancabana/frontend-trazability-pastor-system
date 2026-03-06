import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { ConsolidatedRepository } from '../../domain/gateways/consolidated-repository';
import type { ConsolidatedResponse, AssociationConsolidatedResponse } from '../../domain/entities/consolidated';
import { API_ENDPOINTS } from '@/constants/api';

export class ConsolidatedRepositoryApiImpl implements ConsolidatedRepository {
  constructor(private readonly http: HttpGateway) {}

  getByPastor(token: string, pastorId: string, month: number, year: number): Promise<ConsolidatedResponse> {
    return this.http.get<ConsolidatedResponse>(
      API_ENDPOINTS.CONSOLIDATED.BY_PASTOR(pastorId, month, year),
      token,
    );
  }

  getByAssociation(token: string, assocId: string, month: number, year: number): Promise<AssociationConsolidatedResponse> {
    return this.http.get<AssociationConsolidatedResponse>(
      API_ENDPOINTS.CONSOLIDATED.BY_ASSOCIATION(assocId, month, year),
      token,
    );
  }
}
