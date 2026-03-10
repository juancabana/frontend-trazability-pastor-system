import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { UnionRepository } from '../../domain/gateways/union-repository';
import type { Union } from '../../domain/entities/union';

export class UnionRepositoryApiImpl implements UnionRepository {
  constructor(private readonly http: HttpGateway) {}

  getAll(token: string): Promise<Union[]> {
    return this.http.get<Union[]>('/unions', token);
  }
}
