import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { AssociationRepositoryApiImpl } from '../infra/adapters/association-repository-api-impl';
import { consolidatedKeys } from '@/features/consolidated/infra/consolidated-key-factory';
import { useAuth } from '@/context/AuthContext';

const repo = new AssociationRepositoryApiImpl(httpAdapter);

export function useUpdateDeadline() {
  const { token, updateDeadlineDay } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (day: number) => repo.updateMyDeadline(token!, day),
    onSuccess: (data) => {
      updateDeadlineDay(data.reportDeadlineDay);
      // Cambiar el dia de cierre redefine el periodo activo, por lo que los
      // consolidados (compliance, dias del periodo, etc.) deben recalcularse.
      void queryClient.invalidateQueries({ queryKey: consolidatedKeys.all });
      toast.success(`Día de vencimiento actualizado al día ${data.reportDeadlineDay}`);
    },
    onError: () => toast.error('Error al actualizar el día de vencimiento'),
  });
}
