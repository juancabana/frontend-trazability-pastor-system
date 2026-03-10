import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { ChurchRepository } from '../../domain/gateways/church-repository';
import type { Church } from '../../domain/entities/church';

export class ChurchRepositoryApiImpl implements ChurchRepository {
  constructor(private readonly http: HttpGateway) {}

  getAll(token: string, districtId?: string, associationId?: string): Promise<Church[]> {
    const params = new URLSearchParams();
    if (districtId) params.set('districtId', districtId);
    if (associationId) params.set('associationId', associationId);
    const qs = params.toString();
    return this.http.get<Church[]>(`/churches${qs ? `?${qs}` : ''}`, token);
  }

  create(token: string, data: { name: string; address?: string; districtId: string }): Promise<Church> {
    return this.http.post<Church>('/churches', data, token);
  }

  update(token: string, id: string, data: { name?: string; address?: string }): Promise<Church> {
    return this.http.patch<Church>(`/churches/${id}`, data, token);
  }

  move(token: string, id: string, districtId: string): Promise<Church> {
    return this.http.patch<Church>(`/churches/${id}/move`, { districtId }, token);
  }

  delete(token: string, id: string): Promise<void> {
    return this.http.delete(`/churches/${id}`, token);
  }
}
