import type { UserRole } from '@/features/auth/domain/entities/user-role';

export interface SendReportRequest {
  recipientUserIds: string[];
  associationId: string;
  /** Offset del periodo respecto al actual (0=actual). Default 0. */
  periodOffset?: number;
}

export interface SendReportResponse {
  sent: number;
  recipients: string[];
}

export interface AdminRecipient {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

