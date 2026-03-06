import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { AssociationRepository } from '../../domain/gateways/association-repository';
import type { Association } from '../../domain/entities/association';
import { API_ENDPOINTS } from '@/constants/api';

export class AssociationRepositoryApiImpl implements AssociationRepository {
  constructor(private readonly http: HttpGateway) {}

  getAll(): Promise<Association[]> {
    return this.http.get<Association[]>(API_ENDPOINTS.ASSOCIATIONS.LIST);
  }
}
