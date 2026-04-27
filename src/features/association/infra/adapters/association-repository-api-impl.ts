import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { AssociationRepository } from '../../domain/gateways/association-repository';
import type { Association, ExtraRecipient, AddExtraRecipientRequest } from '../../domain/entities/association';
import { API_ENDPOINTS } from '@/constants/api';

export class AssociationRepositoryApiImpl implements AssociationRepository {
  constructor(private readonly http: HttpGateway) {}

  getAll(): Promise<Association[]> {
    return this.http.get<Association[]>(API_ENDPOINTS.ASSOCIATIONS.LIST);
  }

  getByUnion(unionId: string): Promise<Association[]> {
    return this.http.get<Association[]>(`${API_ENDPOINTS.ASSOCIATIONS.LIST}?unionId=${unionId}`);
  }

  updateMyDeadline(token: string, day: number): Promise<Association> {
    return this.http.patch<Association>(
      API_ENDPOINTS.ASSOCIATIONS.MY_DEADLINE,
      { reportDeadlineDay: day },
      token,
    );
  }

  getExtraRecipients(token: string, associationId: string): Promise<ExtraRecipient[]> {
    return this.http.get<ExtraRecipient[]>(
      API_ENDPOINTS.ASSOCIATIONS.EXTRA_RECIPIENTS(associationId),
      token,
    );
  }

  addExtraRecipient(
    token: string,
    associationId: string,
    data: AddExtraRecipientRequest,
  ): Promise<ExtraRecipient> {
    return this.http.post<ExtraRecipient>(
      API_ENDPOINTS.ASSOCIATIONS.EXTRA_RECIPIENTS(associationId),
      data,
      token,
    );
  }

  removeExtraRecipient(
    token: string,
    associationId: string,
    recipientId: string,
  ): Promise<void> {
    return this.http.delete(
      API_ENDPOINTS.ASSOCIATIONS.EXTRA_RECIPIENT_BY_ID(associationId, recipientId),
      token,
    );
  }
}
