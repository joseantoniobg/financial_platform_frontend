'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import UniversalSelect from './UniversalSelect';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormField } from './ui/form-field';
import { StSelect } from './st-select';
import { StRadioGroup } from './StRadioGroup';
import { StCheckInput } from './StCheckInput';
import { Button } from './ui/button';

interface Category {
  id: string;
  category: string;
  defaultDirection?: string;
}

interface UserTransactionType {
  id: string;
  type: string;
  isFixed: boolean;
  isCredit: boolean;
  direction?: string;
  category?: Category;
  defaultDueDay?: number;
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
  { value: 'Investimento', label: 'Investimento (alocação)' },
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
    defaultDueDay: undefined as number | undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && type) {
        setFormData({
          name: type.type,
          categoryId: type.category?.id || '',
          direction: type.direction || (type.isCredit ? 'Saída' : 'Entrada'),
          isFixed: type.isFixed ?? false,
          defaultDueDay: type.defaultDueDay,
        });
      } else {
        // In create mode, get default direction from selected category
        const selectedCategory = categories.find(c => c.id === initialCategoryId);
        const defaultDirection = selectedCategory?.defaultDirection || 'Entrada';
        
        setFormData({
          name: '',
          categoryId: initialCategoryId || '',
          direction: defaultDirection,
          isFixed: false,
          defaultDueDay: undefined,
        });
      }
    }
  }, [open, mode, type, initialCategoryId, categories]);

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(c => c.id === categoryId);
    const defaultDirection = selectedCategory?.defaultDirection || formData.direction;
    
    setFormData({ 
      ...formData, 
      categoryId,
      direction: defaultDirection
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.name.trim() || !formData.categoryId) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        direction: formData.direction,
        isFixed: formData.isFixed,
        defaultDueDay: formData.defaultDueDay || undefined,
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
      <DialogContent className="sm:max-w-[480px] bg-[hsl(var(--card))] border-[hsl(var(--app-border))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">
            {mode === 'create' ? 'Nova Sub-categoria' : 'Editar Sub-categoria'}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))]">
            Informe os detalhes da sub-categoria que deseja controlar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label='Nome'
            htmlFor='name'
            placeholder='Cartões, Renda Fixa, Salário, etc'
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={submitting}
          />

          <StSelect
            htmlFor='category'
            label='Categoria'
            required
            value={formData.categoryId}
            onChange={handleCategoryChange}
            loading={submitting}
            items={categories.map((category) => ({
              id: category.id,
              description: category.category,
            }))}
          />

          <StRadioGroup
            label='Tipo da Movimentação'
            name='direction'
            options={directionOptions.map((option) => ({ id: option.value, description: option.label }))}
            selected={formData.direction}
            onChange={(value) => setFormData({ ...formData, direction: value })}
            disabled={submitting}
          />

          <StCheckInput
            label='Lançamento Fixo (recorrente)'
            id='isFixed'
            checked={formData.isFixed}
            onChange={(checked) => setFormData({ ...formData, isFixed: checked })}
            disabled={submitting}
          />

          <div className="space-y-2">
            <FormField
              label='Dia de Vencimento Padrão'
              id='defaultDueDay'
              type='number'
              min={1}
              max={31}
              placeholder='Ex: 10 (dia 10 de cada mês)'
              value={formData.defaultDueDay !== undefined ? `${formData.defaultDueDay}` : ''}
              onChange={(e) => setFormData({ ...formData, defaultDueDay: e.target.value ? parseInt(e.target.value) : undefined })}
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ao criar transação, o vencimento será preenchido automaticamente com a próxima data com este dia
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant={'outline'}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
