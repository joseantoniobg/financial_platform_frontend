'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import UniversalSelect from './UniversalSelect';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  category: string;
}

interface UserTransactionType {
  id: string;
  type: string;
  isFixed: boolean;
  isCredit: boolean;
  category?: Category;
}

interface UserTransactionTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  type?: UserTransactionType;
  categories: Category[];
  onSuccess: () => void;
  /** Optional category id to pre-select when opening in create mode */
  initialCategoryId?: string;
}

const directionOptions = [
  { value: 'Entrada', label: 'Entrada (recebimento)' },
  { value: 'Saída', label: 'Saída (pagamento)' },
];

export function UserTransactionTypeFormDialog({
  open,
  onOpenChange,
  mode,
  type,
  categories,
  onSuccess,
  initialCategoryId,
}: UserTransactionTypeFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    direction: 'Entrada',
    isFixed: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && type) {
        setFormData({
          name: type.type,
          categoryId: type.category?.id || '',
          direction: type.isCredit ? 'Saída' : 'Entrada',
          isFixed: type.isFixed ?? false,
        });
      } else {
        setFormData({
          name: '',
          categoryId: initialCategoryId || '',
          direction: 'Entrada',
          isFixed: false,
        });
      }
    }
  }, [open, mode, type, initialCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.categoryId) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        isCredit: formData.direction === 'Saída',
        isFixed: formData.isFixed,
      };

      const url = mode === 'create'
        ? '/api/user-transaction-types'
        : `/api/user-transaction-types/${type?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Sub-categoria ${mode === 'create' ? 'criada' : 'atualizada'} com sucesso!`);
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await res.text();
        toast.error(error || 'Erro ao salvar sub-categoria');
      }
    } catch {
      toast.error('Erro ao salvar sub-categoria');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-[#0D2744] border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-white">
            {mode === 'create' ? 'Nova Sub-categoria' : 'Editar Sub-categoria'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-400">
            Informe os detalhes da sub-categoria que deseja controlar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-gray-300">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700 dark:text-gray-300">
              Categoria <span className="text-red-500">*</span>
            </Label>
            <UniversalSelect
              value={formData.categoryId}
              onChange={(value) => setFormData({ ...formData, categoryId: value })}
              placeholder="Selecione uma categoria"
              items={categories.map((category) => ({ value: category.id, label: category.category }))}
              searchable
              searchPlaceholder="Buscar categoria..."
              disabled={submitting}
              triggerClassName="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
              contentClassName="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-gray-300">Tipo da movimentação</Label>
            <div className="flex flex-col gap-2">
              {directionOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="direction"
                    value={option.value}
                    checked={formData.direction === option.value}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                    disabled={submitting}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFixed"
              checked={formData.isFixed}
              onChange={(e) => setFormData({ ...formData, isFixed: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600"
              disabled={submitting}
            />
            <Label htmlFor="isFixed" className="text-slate-700 dark:text-gray-300 cursor-pointer">
              Lançamento Fixo (recorrente)
            </Label>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B4F481] text-[#0A1929] rounded-lg font-medium hover:bg-[#9FD96F] transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
