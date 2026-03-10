import type { Union } from '../entities/union';

export interface UnionRepository {
  getAll(token: string): Promise<Union[]>;
}
