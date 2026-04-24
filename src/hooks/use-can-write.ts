import { useAuth } from '@/context/AuthContext';

/**
 * Retorna true si el usuario autenticado puede realizar operaciones de escritura
 * (crear, editar, eliminar). El rol admin_readonly solo tiene acceso de lectura.
 */
export function useCanWrite(): boolean {
  const { role } = useAuth();
  return role === 'admin' || role === 'super_admin';
}
