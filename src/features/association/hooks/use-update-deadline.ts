import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpAdapter } from '@/shared/infra/adapters/fetch-http-adapter';
import { AssociationRepositoryApiImpl } from '../infra/adapters/association-repository-api-impl';
import { useAuth } from '@/context/AuthContext';

const repo = new AssociationRepositoryApiImpl(httpAdapter);

export function useUpdateDeadline() {
  const { token, updateDeadlineDay } = useAuth();

  return useMutation({
    mutationFn: (day: number) => repo.updateMyDeadline(token!, day),
    onSuccess: (data) => {
      updateDeadlineDay(data.reportDeadlineDay);
      toast.success(`Día de vencimiento actualizado al día ${data.reportDeadlineDay}`);
    },
    onError: () => toast.error('Error al actualizar el día de vencimiento'),
  });
}
