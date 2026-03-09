import type { District } from '../entities/district';

export interface DistrictRepository {
  getAll(associationId?: string): Promise<District[]>;
}
