import type { ConsolidatedResponse, AssociationConsolidatedResponse } from '../entities/consolidated';

export interface ConsolidatedRepository {
  getByPastor(token: string, pastorId: string, month: number, year: number): Promise<ConsolidatedResponse>;
  getByAssociation(token: string, assocId: string, month: number, year: number): Promise<AssociationConsolidatedResponse>;
}
