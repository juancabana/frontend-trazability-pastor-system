import type { Church } from '../entities/church';

export interface ChurchRepository {
  getAll(token: string, districtId?: string, associationId?: string): Promise<Church[]>;
  create(token: string, data: { name: string; address?: string; districtId: string }): Promise<Church>;
  update(token: string, id: string, data: { name?: string; address?: string }): Promise<Church>;
  move(token: string, id: string, districtId: string): Promise<Church>;
  delete(token: string, id: string): Promise<void>;
}
