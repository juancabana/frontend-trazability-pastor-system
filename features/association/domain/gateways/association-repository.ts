import type { Association } from '../entities/association';

export interface AssociationRepository {
  getAll(): Promise<Association[]>;
}
