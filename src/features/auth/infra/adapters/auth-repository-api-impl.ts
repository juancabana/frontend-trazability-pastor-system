import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import type { AuthRepository } from '../../domain/gateways/auth-repository';
import type { AuthToken } from '../../domain/entities/auth-token';
import type { UserAccount } from '../../domain/entities/user-account';
import type { LoginRequest } from '../../domain/dto/login-request';
import type { CreateUserRequest } from '../../domain/dto/create-user-request';
import type { UpdateUserRequest } from '../../domain/dto/update-user-request';
import { API_ENDPOINTS } from '@/constants/api';

export class AuthRepositoryApiImpl implements AuthRepository {
  constructor(private readonly http: HttpGateway) {}

  login(data: LoginRequest): Promise<AuthToken> {
    return this.http.post<AuthToken>(API_ENDPOINTS.AUTH.LOGIN, data);
  }

  getUsers(token: string, associationId?: string): Promise<UserAccount[]> {
    const url = associationId
      ? `${API_ENDPOINTS.AUTH.USERS}?associationId=${associationId}`
      : API_ENDPOINTS.AUTH.USERS;
    return this.http.get<UserAccount[]>(url, token);
  }

  createUser(token: string, data: CreateUserRequest): Promise<UserAccount> {
    return this.http.post<UserAccount>(API_ENDPOINTS.AUTH.USERS, data, token);
  }

  updateUser(token: string, id: string, data: UpdateUserRequest): Promise<UserAccount> {
    return this.http.patch<UserAccount>(API_ENDPOINTS.AUTH.USER_BY_ID(id), data, token);
  }

  deleteUser(token: string, id: string): Promise<void> {
    return this.http.delete(API_ENDPOINTS.AUTH.USER_BY_ID(id), token);
  }
}
