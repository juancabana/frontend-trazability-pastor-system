import type { UserRole } from './user-role';

export interface AuthToken {
  access_token: string;
  role: UserRole;
  displayName: string;
  email: string;
  userId: string;
  associationId: string | null;
  unionId: string | null;
  associationName?: string;
  unionName?: string;
  reportDeadlineDay?: number;
}
