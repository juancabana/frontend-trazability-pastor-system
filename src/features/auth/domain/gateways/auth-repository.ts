import type { AuthToken } from '../entities/auth-token';
import type { AuthMe } from '../entities/auth-me';
import type { UserAccount } from '../entities/user-account';
import type { LoginRequest } from '../dto/login-request';
import type { CreateUserRequest } from '../dto/create-user-request';
import type { UpdateUserRequest } from '../dto/update-user-request';

export interface AuthRepository {
  login(data: LoginRequest): Promise<AuthToken>;
  getMe(token: string): Promise<AuthMe>;
  getUsers(token: string, associationId?: string): Promise<UserAccount[]>;
  createUser(token: string, data: CreateUserRequest): Promise<UserAccount>;
  updateUser(token: string, id: string, data: UpdateUserRequest): Promise<UserAccount>;
  deleteUser(token: string, id: string): Promise<void>;
  changeOwnPassword(token: string, newPassword: string): Promise<void>;
}
