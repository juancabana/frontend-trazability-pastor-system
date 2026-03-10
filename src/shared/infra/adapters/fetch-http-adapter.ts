import type { HttpGateway } from '@/shared/domain/gateways/http-gateway';
import { env } from '@/config/env';

class FetchHttpAdapter implements HttpGateway {
  constructor(private readonly baseUrl: string) {}

  private buildHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(
    response: Response,
    url: string,
  ): Promise<T> {
    if (response.status === 401) {
      localStorage.removeItem('pastor_tracking_token');
      localStorage.removeItem('pastor_tracking_user');
      window.location.href = '/login';
      throw new Error('Sesion expirada');
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `API error ${response.status}: ${response.statusText} — ${url} ${body}`,
      );
    }
    if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    ) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }

  async get<T>(path: string, token?: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: this.buildHeaders(token),
    });
    return this.handleResponse<T>(response, url);
  }

  async post<T>(path: string, data: unknown, token?: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response, url);
  }

  async patch<T>(path: string, data: unknown, token?: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response, url);
  }

  async delete(path: string, token?: string): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(token),
    });
    await this.handleResponse<void>(response, url);
  }
}

export const httpAdapter: HttpGateway = new FetchHttpAdapter(env.backendUrl);
