import { useState, useCallback } from 'react';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { ConsolidatedRepositoryApiImpl } from '../infra/adapters/consolidated-repository-api-impl';
import type { ResolvedRecipient, SendProgress } from '../domain/entities/send-report';

const repo = new ConsolidatedRepositoryApiImpl(httpAdapter);

const IDLE: SendProgress = { status: 'idle', current: 0, total: 0, failed: [] };

export const useSendReport = () => {
  const [progress, setProgress] = useState<SendProgress>(IDLE);

  const send = useCallback(
    async (
      token: string,
      base: { associationId: string; periodOffset?: number; includedPastorIds?: string[] },
      recipients: ResolvedRecipient[],
    ): Promise<void> => {
      if (recipients.length === 0) return;

      setProgress({ status: 'sending', current: 0, total: recipients.length, failed: [] });
      const failed: string[] = [];

      for (let i = 0; i < recipients.length; i++) {
        const r = recipients[i];
        // Actualizar antes de enviar para que el dialogo muestre el destinatario activo
        setProgress({ status: 'sending', current: i, total: recipients.length, failed: [...failed] });
        try {
          await repo.sendReport(token, {
            ...base,
            recipientUserIds: r.type === 'user' ? [r.id] : [],
            extraRecipientIds: r.type === 'extra' ? [r.id] : [],
            includedPastorIds: base.includedPastorIds,
          });
        } catch {
          failed.push(r.email);
        }
      }

      setProgress({ status: 'done', current: recipients.length - failed.length, total: recipients.length, failed });
    },
    [],
  );

  const reset = useCallback(() => setProgress(IDLE), []);

  return { send, progress, reset };
};
