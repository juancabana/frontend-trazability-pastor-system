import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDistricts } from '@/features/district/presentation/hooks/use-district-queries';
import { useCreateDistrict, useUpdateDistrict, useDeleteDistrict } from '@/features/district/presentation/hooks/use-district-mutations';
import { useChurches, useCreateChurch, useUpdateChurch, useMoveChurch, useDeleteChurch } from '@/features/church/presentation/hooks/use-church-queries';
import { useUsers } from '@/features/auth/presentation/hooks/use-auth-queries';
import { useUpdateUser } from '@/features/auth/presentation/hooks/use-auth-mutations';
import { SearchInput } from '@/components/atoms/SearchInput';
import { ConfirmDialog } from '@/components/atoms/ConfirmDialog';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Church,
  Users,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import type { District } from '@/features/district/domain/entities/district';
import type { Church as ChurchEntity } from '@/features/church/domain/entities/church';

export default function AdminDistritosPage() {
  const { token, currentUser } = useAuth();
  const associationId = currentUser?.associationId ?? '';

  const { data: districts = [] } = useDistricts(associationId);
  const { data: churches = [] } = useChurches(token ?? '', undefined, associationId);
  const { data: users = [] } = useUsers(token ?? '', associationId);

  const createDistrict = useCreateDistrict();
  const updateDistrict = useUpdateDistrict();
  const deleteDistrict = useDeleteDistrict();
  const createChurch = useCreateChurch();
  const updateChurch = useUpdateChurch();
  const moveChurch = useMoveChurch();
  const deleteChurch = useDeleteChurch();
  const updateUser = useUpdateUser();

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Modal state
  const [modal, setModal] = useState<{
    type: 'add-district' | 'edit-district' | 'add-church' | 'edit-church' | 'move-church' | 'move-pastor';
    districtId?: string;
    item?: District | ChurchEntity | { id: string; name: string; districtId?: string };
  } | null>(null);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTargetDistrict, setFormTargetDistrict] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'district' | 'church'; item: District | ChurchEntity } | null>(null);

  const pastors = useMemo(() => users.filter((u) => u.role === 'pastor'), [users]);

  const filteredDistricts = useMemo(() => {
    if (!search) return districts;
    const q = search.toLowerCase();
    return districts.filter((d) => d.name.toLowerCase().includes(q));
  }, [districts, search]);

  const churchesByDistrict = useMemo(() => {
    const map = new Map<string, ChurchEntity[]>();
    churches.forEach((c) => {
      const list = map.get(c.districtId) || [];
      list.push(c);
      map.set(c.districtId, list);
    });
    return map;
  }, [churches]);

  const pastorsByDistrict = useMemo(() => {
    const map = new Map<string, typeof pastors>();
    pastors.forEach((p) => {
      if (p.districtId) {
        const list = map.get(p.districtId) || [];
        list.push(p);
        map.set(p.districtId, list);
      }
    });
    return map;
  }, [pastors]);

  const openModal = (
    type: NonNullable<typeof modal>['type'],
    districtId?: string,
    item?: NonNullable<typeof modal>['item'],
  ) => {
    setFormName(item && 'name' in item ? item.name : '');
    setFormAddress(item && 'address' in item ? ((item as ChurchEntity).address ?? '') : '');
    setFormTargetDistrict('');
    setModal({ type, districtId, item });
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async () => {
    if (!token) return;
    try {
      switch (modal?.type) {
        case 'add-district':
          await createDistrict.mutateAsync({ token, data: { name: formName, associationId } });
          toast.success('Distrito creado');
          break;
        case 'edit-district':
          if (modal.item) {
            await updateDistrict.mutateAsync({ token, id: modal.item.id, data: { name: formName } });
            toast.success('Distrito actualizado');
          }
          break;
        case 'add-church':
          if (modal.districtId) {
            await createChurch.mutateAsync({
              token,
              data: { name: formName, address: formAddress || undefined, districtId: modal.districtId },
            });
            toast.success('Iglesia creada');
          }
          break;
        case 'edit-church':
          if (modal.item) {
            await updateChurch.mutateAsync({
              token,
              id: modal.item.id,
              data: { name: formName, address: formAddress || undefined },
            });
            toast.success('Iglesia actualizada');
          }
          break;
        case 'move-church':
          if (modal.item && formTargetDistrict) {
            await moveChurch.mutateAsync({ token, id: modal.item.id, districtId: formTargetDistrict });
            toast.success('Iglesia movida');
          }
          break;
        case 'move-pastor':
          if (modal.item && formTargetDistrict) {
            await updateUser.mutateAsync({
              token,
              id: modal.item.id,
              data: { districtId: formTargetDistrict },
            });
            toast.success('Pastor reasignado');
          }
          break;
      }
      closeModal();
    } catch {
      toast.error('Error al procesar la solicitud');
    }
  };

  const handleDeleteDistrict = (d: District) => {
    const dChurches = churchesByDistrict.get(d.id) || [];
    const dPastors = pastorsByDistrict.get(d.id) || [];
    if (dChurches.length > 0 || dPastors.length > 0) {
      toast.error('No se puede eliminar: el distrito tiene iglesias o pastores');
      return;
    }
    setDeleteTarget({ type: 'district', item: d });
  };

  const handleDeleteChurch = (c: ChurchEntity) => {
    setDeleteTarget({ type: 'church', item: c });
  };

  const confirmDeleteTarget = async () => {
    if (!token || !deleteTarget) return;
    try {
      if (deleteTarget.type === 'district') {
        await deleteDistrict.mutateAsync({ token, id: deleteTarget.item.id });
        toast.success('Distrito eliminado');
      } else {
        await deleteChurch.mutateAsync({ token, id: deleteTarget.item.id });
        toast.success('Iglesia eliminada');
      }
    } catch {
      toast.error(`Error al eliminar ${deleteTarget.type === 'district' ? 'distrito' : 'iglesia'}`);
    }
    setDeleteTarget(null);
  };

  const toggleExpand = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const modalTitle: Record<string, string> = {
    'add-district': 'Agregar Distrito',
    'edit-district': 'Editar Distrito',
    'add-church': 'Agregar Iglesia',
    'edit-church': 'Editar Iglesia',
    'move-church': 'Mover Iglesia',
    'move-pastor': 'Reasignar Pastor',
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Distritos
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Gestionar distritos, iglesias y pastores
          </p>
        </div>
        <button
          onClick={() => openModal('add-district')}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Distrito
        </button>
      </div>

      <div className="mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar distrito..." />
      </div>

      {filteredDistricts.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-5 py-12 text-center text-sm text-gray-400 dark:text-slate-500">
          {search ? 'No se encontraron distritos' : 'Sin distritos creados'}
        </div>
      )}

      {filteredDistricts.map((district, i) => {
        const isExpanded = expanded[district.id] !== false;
        const dChurches = churchesByDistrict.get(district.id) || [];
        const dPastors = pastorsByDistrict.get(district.id) || [];

        return (
          <motion.div
            key={district.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="mb-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            {/* District header */}
            <div className="flex items-center px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <button
                onClick={() => toggleExpand(district.id)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <span className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {district.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">
                    {dChurches.length} iglesias · {dPastors.length} pastores
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal('edit-district', undefined, district)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                </button>
                <button
                  onClick={() => handleDeleteDistrict(district)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400" />
                </button>
                <button onClick={() => toggleExpand(district.id)} className="p-1.5">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 dark:border-slate-800">
                    {/* Churches section */}
                    <div className="px-5 py-3 bg-gray-50/50 dark:bg-slate-950/50 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Church className="w-3 h-3" /> Iglesias ({dChurches.length})
                      </span>
                      <button
                        onClick={() => openModal('add-church', district.id)}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    </div>

                    {dChurches.map((church) => (
                      <div
                        key={church.id}
                        className="px-5 py-2.5 flex items-center gap-3 border-t border-gray-50 dark:border-slate-800 group"
                      >
                        <span className="w-6 h-6 bg-orange-50 dark:bg-orange-900/20 rounded-md flex items-center justify-center shrink-0">
                          <Church className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">{church.name}</p>
                          {church.address && (
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{church.address}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal('edit-church', district.id, church)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                          </button>
                          <button
                            onClick={() => openModal('move-church', district.id, church)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Mover de distrito"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteChurch(church)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {dChurches.length === 0 && (
                      <div className="px-5 py-4 text-center text-[11px] text-gray-400 dark:text-slate-500 border-t border-gray-50 dark:border-slate-800">
                        Sin iglesias en este distrito
                      </div>
                    )}

                    {/* Pastors section */}
                    <div className="px-5 py-3 bg-gray-50/50 dark:bg-slate-950/50 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> Pastores ({dPastors.length})
                      </span>
                    </div>

                    {dPastors.map((pastor) => (
                      <div
                        key={pastor.id}
                        className="px-5 py-2.5 flex items-center gap-3 border-t border-gray-50 dark:border-slate-800 group"
                      >
                        <span className="w-6 h-6 bg-teal-50 dark:bg-teal-900/20 rounded-md flex items-center justify-center shrink-0 text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                          {pastor.name
                            .split(' ')
                            .filter((w) => w.length > 2)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm text-gray-900 dark:text-white truncate">{pastor.name}</p>
                            {pastor.position && (
                              <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${
                                pastor.position === 'Pastor'
                                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                              }`}>
                                {pastor.position}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{pastor.email}</p>
                        </div>
                        <button
                          onClick={() => openModal('move-pastor', district.id, pastor)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-all"
                          title="Reasignar distrito"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                        </button>
                      </div>
                    ))}

                    {dPastors.length === 0 && (
                      <div className="px-5 py-4 text-center text-[11px] text-gray-400 dark:text-slate-500 border-t border-gray-50 dark:border-slate-800">
                        Sin pastores en este distrito
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {modalTitle[modal.type]}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-3">
                {(modal.type === 'add-district' || modal.type === 'edit-district') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                      Nombre del distrito
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ej: Distrito Norte"
                    />
                  </div>
                )}

                {(modal.type === 'add-church' || modal.type === 'edit-church') && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                        Nombre de la iglesia
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ej: Iglesia Central"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                        Direccion (opcional)
                      </label>
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ej: Calle 10 #25-30"
                      />
                    </div>
                  </>
                )}

                {(modal.type === 'move-church' || modal.type === 'move-pastor') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                      {modal.type === 'move-church' ? 'Mover a distrito' : 'Reasignar a distrito'}
                    </label>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mb-2">
                      {modal.type === 'move-church'
                        ? `Iglesia: ${modal.item?.name}`
                        : `Pastor: ${modal.item?.name}`}
                    </p>
                    <select
                      value={formTargetDistrict}
                      onChange={(e) => setFormTargetDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar distrito...</option>
                      {districts
                        .filter((d) => d.id !== modal.districtId)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    (modal.type.includes('district') && !formName.trim()) ||
                    (modal.type.includes('church') && !modal.type.includes('move') && !formName.trim()) ||
                    ((modal.type === 'move-church' || modal.type === 'move-pastor') && !formTargetDistrict)
                  }
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-colors"
                >
                  {modal.type.startsWith('add') ? 'Crear' : modal.type.startsWith('edit') ? 'Guardar' : 'Mover'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Eliminar ${deleteTarget?.type === 'district' ? 'distrito' : 'iglesia'}`}
        message={`¿Esta seguro de eliminar "${deleteTarget?.item.name}"? Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDeleteTarget}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
