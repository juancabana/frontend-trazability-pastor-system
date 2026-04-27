import type { UserRole } from '@/features/auth/domain/entities/user-role';

export interface SendReportRequest {
  recipientUserIds?: string[];
  extraRecipientIds?: string[];
  /** IDs de los pastores cuyos Excel individuales se adjuntarán. Vacío = todos. */
  includedPastorIds?: string[];
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

export interface SendProgress {
  status: 'idle' | 'sending' | 'done';
  current: number;
  total: number;
  failed: string[];
}

/** Un destinatario normalizado listo para mostrar progreso en la UI */
export interface ResolvedRecipient {
  id: string;
  type: 'user' | 'extra';
  name: string;
  email: string;
}
