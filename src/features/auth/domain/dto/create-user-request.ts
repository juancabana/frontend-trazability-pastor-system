import type { UserRole } from '../entities/user-role';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  associationId: string;
  districtId?: string;
  position?: string;
  phone?: string;
}
