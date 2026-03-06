import type { UserRole } from '../entities/user-role';

export interface UpdateUserRequest {
  name?: string;
  password?: string;
  role?: UserRole;
  districtId?: string;
}
