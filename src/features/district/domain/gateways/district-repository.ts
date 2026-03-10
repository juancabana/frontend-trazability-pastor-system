import type { District } from '../entities/district';

export interface DistrictRepository {
  getAll(associationId?: string): Promise<District[]>;
  create(token: string, data: { name: string; associationId: string }): Promise<District>;
  update(token: string, id: string, data: { name: string }): Promise<District>;
  delete(token: string, id: string): Promise<void>;
}
