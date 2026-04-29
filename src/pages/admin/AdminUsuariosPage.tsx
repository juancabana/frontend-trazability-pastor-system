import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCanWrite } from '@/hooks/use-can-write';
import { SEO } from '@/shared/presentation/SEO';
import { useUsers } from '@/features/auth/presentation/hooks/use-auth-queries';
import {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/features/auth/presentation/hooks/use-auth-mutations';
import { useDistricts } from '@/features/district/presentation/hooks/use-district-queries';
import { ROLE_CONFIG, type UserRole } from '@/features/auth/domain/entities/user-role';
import type { UserAccount } from '@/features/auth/domain/entities/user-account';
import { SearchInput } from '@/components/atoms/SearchInput';
import { Modal } from '@/components/atoms/Modal';
import { ConfirmDialog } from '@/components/atoms/ConfirmDialog';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { ListSkeleton } from '@/components/atoms/Skeleton';
import { Plus, Edit3, Trash2, UserCog, Phone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsuariosPage() {
  const { token, currentUser } = useAuth();
  const canWrite = useCanWrite();
  const { data: users = [], isLoading: loadingUsers } = useUsers(token ?? '', currentUser?.associationId ?? undefined);
  const { data: districts = [] } = useDistricts(currentUser?.associationId ?? undefined);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<UserRole>('pastor');
  const [formDistrictId, setFormDistrictId] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCanEditAllReports, setFormCanEditAllReports] = useState(false);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('pastor');
    setFormDistrictId('');
    setFormPosition('Pastor');
    setFormPhone('');
    setFormCanEditAllReports(false);
    setShowModal(true);
  };

  const openEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormDistrictId(user.districtId || '');
    setFormPosition(user.position || '');
    setFormPhone(user.phone || '');
    setFormCanEditAllReports(user.canEditAllReports ?? false);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!token || !currentUser) return;
    if (!formName.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formEmail.trim()) {
      toast.error('El email es requerido');
      return;
    }
    if (!editingUser && !formPassword) {
      toast.error('La contraseña es requerida');
      return;
    }
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          token,
          id: editingUser.id,
          data: {
            name: formName || undefined,
            email: formEmail !== editingUser.email ? formEmail || undefined : undefined,
            password: formPassword || undefined,
            role: formRole,
            districtId: formDistrictId || undefined,
            position: formPosition || undefined,
            phone: formPhone || undefined,
            canEditAllReports: formRole === 'pastor' ? formCanEditAllReports : undefined,
          },
        });
        toast.success('Usuario actualizado');
      } else {
        await createUser.mutateAsync({
          token,
          data: {
            name: formName,
            email: formEmail,
            password: formPassword,
            role: formRole,
            associationId: currentUser.associationId ?? '',
            districtId: formDistrictId || undefined,
            position: formPosition || undefined,
            phone: formPhone || undefined,
          },
        });
        toast.success('Usuario creado');
      }
      setShowModal(false);
    } catch {
      toast.error('Error al guardar usuario');
    }
  };

  const confirmDelete = async () => {
    if (!token || !userToDelete) return;
    try {
      await deleteUser.mutateAsync({ token, id: userToDelete.id });
      toast.success('Usuario eliminado');
    } catch {
      toast.error('Error al eliminar usuario');
    }
    setUserToDelete(null);
  };

  const handleDelete = (user: UserAccount) => {
    if (user.id === currentUser?.id) {
      toast.error('No puede eliminar su propio usuario');
      return;
    }
    setUserToDelete(user);
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter((w) => w.length > 2)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  const getAvatarClasses = (role: UserRole) => {
    if (role === 'admin') return 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
    if (role === 'admin_readonly') return 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400';
    return 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400';
  };

  const getBadgeVariant = (role: UserRole) => {
    if (role === 'admin') return 'info' as const;
    if (role === 'admin_readonly') return 'info' as const;
    return 'primary' as const;
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <SEO title="Usuarios" noIndex />
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Usuarios
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            {canWrite ? 'Gestionar pastores y administradores' : 'Vista de pastores y administradores'}
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1.5" /> Nuevo
          </Button>
        )}
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar usuario..."
        />
      </div>

      {loadingUsers && users.length === 0 ? (
        <ListSkeleton rows={5} withHeader={false} withMetrics={false} />
      ) : (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {filteredUsers.map((user) => {
            const rc = ROLE_CONFIG[user.role] ?? ROLE_CONFIG['pastor'];
            return (
              <div
                key={user.id}
                className="px-5 py-4 flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarClasses(user.role)}`}
                >
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <Badge variant={getBadgeVariant(user.role)}>
                      {user.position || rc.label}
                    </Badge>
                    {user.canEditAllReports && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        title="Puede editar informes de periodos vencidos"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Excepción
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{user.email}</p>
                    {user.phone && (
                      <span className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>
                {canWrite && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-2 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filteredUsers.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-gray-400 dark:text-slate-500">
              No se encontraron usuarios
            </div>
          )}
        </div>
      </div>
      )}

      {/* Create/Edit Modal — solo visible para admin con escritura */}
      {canWrite && (
        <>
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          >
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                  {editingUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                  Rol
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none appearance-none dark:text-white"
                >
                  <option value="pastor">Pastor</option>
                  <option value="admin_readonly">Solo Lectura</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {formRole === 'pastor' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                    Posicion
                  </label>
                  <select
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none appearance-none dark:text-white"
                  >
                    <option value="Pastor">Pastor</option>
                    <option value="Ministro">Ministro</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                  Celular
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Ej: 311 660 0185"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none dark:text-white"
                />
              </div>
              {formRole === 'pastor' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">
                    Distrito
                  </label>
                  <select
                    value={formDistrictId}
                    onChange={(e) => setFormDistrictId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none appearance-none dark:text-white"
                  >
                    <option value="">Sin distrito</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formRole === 'pastor' && editingUser && (
                <div className="flex items-start justify-between gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      Excepción de edición
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                      Permite al pastor editar informes de cualquier periodo vencido.
                    </p>
                    <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-1">
                      El cambio aplica desde el próximo inicio de sesión del pastor.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormCanEditAllReports((v) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      formCanEditAllReports ? 'bg-amber-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={formCanEditAllReports}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        formCanEditAllReports ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={createUser.isPending || updateUser.isPending}>
                  {(createUser.isPending || updateUser.isPending) ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </Modal>

          <ConfirmDialog
            isOpen={!!userToDelete}
            title="Eliminar usuario"
            message={`¿Esta seguro de eliminar a ${userToDelete?.name}? Esta accion no se puede deshacer.`}
            confirmLabel="Eliminar"
            onConfirm={confirmDelete}
            onCancel={() => setUserToDelete(null)}
          />
        </>
      )}
    </div>
  );
}
