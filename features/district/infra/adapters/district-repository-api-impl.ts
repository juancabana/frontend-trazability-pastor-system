import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { DistrictRepository } from '../../domain/gateways/district-repository';
import type { District } from '../../domain/entities/district';
import { API_ENDPOINTS } from '@/constants/api';

export class DistrictRepositoryApiImpl implements DistrictRepository {
  constructor(private readonly http: HttpGateway) {}

  getAll(associationId?: string): Promise<District[]> {
    const url = associationId
      ? API_ENDPOINTS.DISTRICTS.BY_ASSOCIATION(associationId)
      : API_ENDPOINTS.DISTRICTS.LIST;
    return this.http.get<District[]>(url);
  }
}
