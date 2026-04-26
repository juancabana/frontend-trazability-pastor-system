import type { UserRole } from './user-role';

export interface AuthMe {
  role: UserRole;
  displayName: string;
  email: string;
  userId: string;
  associationId: string | null;
  unionId: string | null;
  associationName?: string;
  unionName?: string;
  reportDeadlineDay?: number;
  position?: string;
  mustChangePassword: boolean;
  canEditAllReports?: boolean;
}
