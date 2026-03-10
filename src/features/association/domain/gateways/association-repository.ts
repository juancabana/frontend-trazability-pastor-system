import type { Association } from '../entities/association';

export interface AssociationRepository {
  getAll(): Promise<Association[]>;
  getByUnion(unionId: string): Promise<Association[]>;
}
