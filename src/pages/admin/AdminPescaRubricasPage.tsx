import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  RotateCcw,
  Plus,
  X,
  Check,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/atoms/ConfirmDialog';
import { toast } from 'sonner';
import { SEO } from '@/shared/presentation/SEO';
import { useAuth } from '@/context/AuthContext';
import { useActivityCategories } from '@/features/activity-category/presentation/hooks/use-activity-category-queries';
import {
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
  useRestoreSubcategory,
} from '@/features/activity-category/presentation/hooks/use-activity-category-mutations';
import type {
  SubCategory,
  SubCategoryUnit,
} from '@/features/activity-category/domain/entities/activity-category';
import type { CreateSubcategoryPayload, UpdateSubcategoryPayload } from '@/features/activity-category/domain/gateways/activity-category-repository';

const UNIT_LABELS: Record<SubCategoryUnit, string> = {
  cantidad: 'Cantidad',
  horas: 'Horas',
  veces: 'Veces',
  dias: 'Días',
  noches: 'Noches',
};

const UNIT_OPTIONS: { value: SubCategoryUnit; label: string }[] = [
  { value: 'cantidad', label: 'Cantidad' },
  { value: 'horas', label: 'Horas' },
  { value: 'veces', label: 'Veces' },
  { value: 'dias', label: 'Días' },
  { value: 'noches', label: 'Noches' },
];

// ── Sub-form (create / edit) ────────────────────────────────────────────────

interface SubcategoryFormState {
  name: string;
  unit: SubCategoryUnit;
  hasHours: boolean;
  description: string;
}

const DEFAULT_FORM: SubcategoryFormState = {
  name: '',
  unit: 'cantidad',
  hasHours: false,
  description: '',
};

interface SubcategoryFormProps {
  initial?: SubcategoryFormState;
  isPending: boolean;
  onSubmit: (data: SubcategoryFormState) => void;
  onCancel: () => void;
  submitLabel: string;
}

function SubcategoryForm({
  initial = DEFAULT_FORM,
  isPending,
  onSubmit,
  onCancel,
  submitLabel,
}: SubcategoryFormProps) {
  const [form, setForm] = useState<SubcategoryFormState>(initial);

  const isValid = form.name.trim().length > 0;

  return (
    <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 space-y-3 bg-indigo-50/40 dark:bg-indigo-900/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nombre */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
            Nombre de la sección
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej. Estudios Bíblicos"
            maxLength={100}
            disabled={isPending}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 disabled:opacity-50 transition"
          />
        </div>

        {/* Unidad */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
            Unidad de medida
          </label>
          <select
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value as SubCategoryUnit }))}
            disabled={isPending}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 disabled:opacity-50 transition"
          >
            {UNIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Registra horas */}
        <div>
          <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
            Registra horas
          </span>
          <div className="flex gap-2">
            {[
              { value: false, label: 'No' },
              { value: true, label: 'Sí' },
            ].map(({ value, label }) => {
              const selected = form.hasHours === value;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={isPending}
                  onClick={() => setForm((f) => ({ ...f, hasHours: value }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                    selected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Descripción */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
            Descripción <span className="font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Descripción corta"
            maxLength={255}
            disabled={isPending}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 disabled:opacity-50 transition"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => isValid && onSubmit(form)}
          disabled={!isValid || isPending}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

// ── Row for each subcategory ────────────────────────────────────────────────

interface SubcategoryRowProps {
  categoryId: string;
  sub: SubCategory;
  token: string;
}

function SubcategoryRow({ categoryId, sub, token }: SubcategoryRowProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isActive = sub.isActive !== false;

  const updateMutation = useUpdateSubcategory(categoryId);
  const deleteMutation = useDeleteSubcategory(categoryId);
  const restoreMutation = useRestoreSubcategory(categoryId);

  function handleUpdate(form: SubcategoryFormState) {
    const data: UpdateSubcategoryPayload = {
      name: form.name.trim(),
      unit: form.unit,
      hasHours: form.hasHours,
      description: form.description.trim() || undefined,
    };
    updateMutation.mutate(
      { subcategoryId: sub.id, data, token },
      {
        onSuccess: () => {
          toast.success('Sección actualizada');
          setEditing(false);
        },
        onError: () => toast.error('No se pudo actualizar la sección'),
      },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(
      { subcategoryId: sub.id, token },
      {
        onSuccess: () => {
          toast.success(`"${sub.name}" desactivada`);
          setConfirmingDelete(false);
        },
        onError: () => toast.error('No se pudo desactivar la sección'),
      },
    );
  }

  function handleRestore() {
    restoreMutation.mutate(
      { subcategoryId: sub.id, token },
      {
        onSuccess: () => toast.success(`"${sub.name}" reactivada`),
        onError: () => toast.error('No se pudo reactivar la sección'),
      },
    );
  }

  if (editing) {
    return (
      <div className="px-4 py-3">
        <SubcategoryForm
          initial={{
            name: sub.name,
            unit: sub.unit as SubCategoryUnit,
            hasHours: sub.hasHours,
            description: sub.description ?? '',
          }}
          isPending={updateMutation.isPending}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Guardar cambios"
        />
      </div>
    );
  }

  const anyPending =
    deleteMutation.isPending || restoreMutation.isPending;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
        isActive ? '' : 'opacity-50'
      }`}
    >
      {/* Color dot + info */}
      <div className="flex-1 min-w-0 flex items-center gap-2.5">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
            isActive
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
              : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-800'
          }`}
        >
          {isActive ? UNIT_LABELS[sub.unit as SubCategoryUnit] ?? sub.unit : 'Inactiva'}
        </span>
        <span className={`text-sm truncate ${isActive ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500 line-through'}`}>
          {sub.name}
        </span>
        {sub.hasHours && (
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium hidden sm:inline">
            + hrs
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isActive ? (
          <>
            <button
              onClick={() => setEditing(true)}
              disabled={anyPending}
              title="Editar sección"
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-40 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmingDelete(true)}
              disabled={anyPending}
              title="Desactivar sección"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={handleRestore}
            disabled={anyPending}
            title="Reactivar sección"
            className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmingDelete}
        title="Desactivar sección"
        message={`¿Desactivar "${sub.name}"? Quedará oculta en nuevos reportes, pero los reportes históricos seguirán mostrándola correctamente.`}
        confirmLabel="Desactivar"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

// ── Category card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    color: string;
    bgColor: string;
    borderColor: string;
    subcategories: SubCategory[];
  };
  token: string;
}

function CategoryCard({ category, token }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);

  const createMutation = useCreateSubcategory(category.id);

  const activeCount = category.subcategories.filter((s) => s.isActive !== false).length;
  const total = category.subcategories.length;

  function handleCreate(form: SubcategoryFormState) {
    const data: CreateSubcategoryPayload = {
      name: form.name.trim(),
      unit: form.unit,
      hasHours: form.hasHours,
      description: form.description.trim() || undefined,
    };
    createMutation.mutate(
      { data, token },
      {
        onSuccess: () => {
          toast.success('Sección agregada');
          setAdding(false);
        },
        onError: () => toast.error('No se pudo agregar la sección'),
      },
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            {category.name}
          </span>
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {activeCount === total
              ? `${total} secciones`
              : `${activeCount} activas · ${total - activeCount} inactivas`}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
        )}
      </button>

      {expanded && (
        <>
          {/* Subcategory list */}
          {category.subcategories.length === 0 ? (
            <p className="px-5 py-3 text-sm text-gray-400 dark:text-slate-500">
              Esta categoría no tiene secciones todavía.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800 border-t border-gray-100 dark:border-slate-800">
              {category.subcategories.map((sub) => (
                <SubcategoryRow
                  key={sub.id}
                  categoryId={category.id}
                  sub={sub}
                  token={token}
                />
              ))}
            </div>
          )}

          {/* Add section */}
          <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-3">
            {adding ? (
              <SubcategoryForm
                isPending={createMutation.isPending}
                onSubmit={handleCreate}
                onCancel={() => setAdding(false)}
                submitLabel="Agregar sección"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar sección
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPescaRubricasPage() {
  const { token } = useAuth();
  const { data: categories = [], isLoading, isError } = useActivityCategories();

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <SEO title="Rúbricas PESCAR" noIndex />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Rúbricas PESCAR
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administra las secciones de cada categoría de actividad
          </p>
        </div>
      </div>

      {/* Info notice */}
      <div className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
        <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
        <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
          Desactivar una sección la oculta en nuevos reportes, pero los reportes históricos
          que ya la usaron siguen mostrando sus datos correctamente.
        </p>
      </div>

      {/* Category cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500 dark:text-red-400">
          No se pudieron cargar las categorías. Intenta recargar la página.
        </p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              token={token ?? ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}
