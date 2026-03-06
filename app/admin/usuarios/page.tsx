'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Plus, Edit3, Trash2, UserCog } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsuariosPage() {
  const { token, currentUser } = useAuth();
  const { data: users = [] } = useUsers(token ?? '', currentUser?.associationId);
  const { data: districts = [] } = useDistricts(currentUser?.associationId);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('pastor');
  const [formDistrictId, setFormDistrictId] = useState('');

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
    setShowModal(true);
  };

  const openEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormDistrictId(user.districtId || '');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!token || !currentUser) return;
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          token,
          id: editingUser.id,
          data: {
            name: formName || undefined,
            password: formPassword || undefined,
            role: formRole,
            districtId: formDistrictId || undefined,
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
            associationId: currentUser.associationId,
            districtId: formDistrictId || undefined,
          },
        });
        toast.success('Usuario creado');
      }
      setShowModal(false);
    } catch {
      toast.error('Error al guardar usuario');
    }
  };

  const handleDelete = async (user: UserAccount) => {
    if (!token) return;
    if (user.id === currentUser?.id) {
      toast.error('No puede eliminar su propio usuario');
      return;
    }
    try {
      await deleteUser.mutateAsync({ token, id: user.id });
      toast.success('Usuario eliminado');
    } catch {
      toast.error('Error al eliminar usuario');
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter((w) => w.length > 2)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-indigo-600" /> Usuarios
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Gestionar pastores y administradores
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1.5" /> Nuevo
        </Button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar usuario..."
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filteredUsers.map((user) => {
            const rc = ROLE_CONFIG[user.role];
            return (
              <div
                key={user.id}
                className="px-5 py-4 flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0 ${
                    user.role === 'admin'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-teal-50 text-teal-600'
                  }`}
                >
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <Badge
                      variant={user.role === 'admin' ? 'info' : 'primary'}
                    >
                      {rc.label}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(user)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              No se encontraron usuarios
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Nombre
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none"
            />
          </div>
          {!editingUser && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              {editingUser ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena'}
            </label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Rol
            </label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none appearance-none"
            >
              <option value="pastor">Pastor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {formRole === 'pastor' && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Distrito
              </label>
              <select
                value={formDistrictId}
                onChange={(e) => setFormDistrictId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-teal-500 outline-none appearance-none"
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
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
