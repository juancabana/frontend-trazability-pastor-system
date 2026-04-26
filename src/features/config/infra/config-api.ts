import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import type { BusinessConfig } from '../domain/business-config';

export const configApi = {
  getPublic: (): Promise<BusinessConfig> =>
    httpAdapter.get<BusinessConfig>('/config/public'),
};
