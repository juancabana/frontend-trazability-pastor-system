export interface HttpGateway {
  get<T>(path: string, token?: string): Promise<T>;
  post<T>(path: string, data: unknown, token?: string): Promise<T>;
  patch<T>(path: string, data: unknown, token?: string): Promise<T>;
  delete(path: string, token?: string): Promise<void>;
}
