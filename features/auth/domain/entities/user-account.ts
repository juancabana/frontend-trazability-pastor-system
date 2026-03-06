import type { UserRole } from './user-role';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  associationId: string;
  districtId?: string;
  createdAt: string;
}
