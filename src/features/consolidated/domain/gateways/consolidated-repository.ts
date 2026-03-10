import type { ConsolidatedResponse, AssociationConsolidatedResponse, UnionConsolidatedResponse } from '../entities/consolidated';

export interface ConsolidatedRepository {
  getByPastor(token: string, pastorId: string, month: number, year: number): Promise<ConsolidatedResponse>;
  getByAssociation(token: string, assocId: string, month: number, year: number): Promise<AssociationConsolidatedResponse>;
  getByUnion(token: string, unionId: string, month: number, year: number): Promise<UnionConsolidatedResponse>;
}
