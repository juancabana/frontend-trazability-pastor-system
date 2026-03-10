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

  create(token: string, data: { name: string; associationId: string }): Promise<District> {
    return this.http.post<District>(API_ENDPOINTS.DISTRICTS.LIST, data, token);
  }

  update(token: string, id: string, data: { name: string }): Promise<District> {
    return this.http.patch<District>(`${API_ENDPOINTS.DISTRICTS.LIST}/${id}`, data, token);
  }

  delete(token: string, id: string): Promise<void> {
    return this.http.delete(`${API_ENDPOINTS.DISTRICTS.LIST}/${id}`, token);
  }
}
