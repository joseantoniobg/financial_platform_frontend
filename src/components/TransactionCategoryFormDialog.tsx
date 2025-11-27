'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import UniversalSelect from './UniversalSelect';
import { FormField } from './ui/form-field';
import { StSelect } from './st-select';
import { Button } from './ui/button';

const directionOptions = [
  { value: 'Entrada', label: 'Entrada (recebimento)' },
  { value: 'Saída', label: 'Saída (pagamento)' },
  { value: 'Investimento', label: 'Investimento (alocação)' },
];

interface Category {
  id: string;
  category: string;
  defaultDirection?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  category?: Category;
  onSuccess: () => void;
  userId?: string;
}

export function TransactionCategoryFormDialog({ open, onOpenChange, mode, category, onSuccess, userId }: Props) {
  const [formData, setFormData] = useState({ 
    category: '',
    defaultDirection: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && mode === 'edit' && category) {
      setFormData({ 
        category: category.category,
        defaultDirection: category.defaultDirection || ''
      });
    } else if (open && mode === 'create') {
      setFormData({ 
        category: '',
        defaultDirection: ''
      });
    }
  }, [open, mode, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSubmitting(true);

    try {
      const url = mode === 'create' ? `/api/transaction-categories${userId ? `?userId=${userId}` : ''}` : `/api/transaction-categories/${category?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(mode === 'create' ? 'Categoria criada' : 'Categoria atualizada');
        onSuccess();
        onOpenChange(false);
      } else {
        const text = await res.text();
        toast.error(text || 'Erro ao salvar categoria');
      }
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">{mode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}</DialogTitle>
          <DialogDescription className="text-[hsl(var(--foreground-clear))]">{mode === 'create' ? 'Crie uma nova categoria' : 'Atualize a categoria'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label='Nome'
            id='category'
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />

          <div className="space-y-2">
            <StSelect
              label="Direção Padrão"
              required
              value={formData.defaultDirection}
              onChange={(value) => setFormData({ ...formData, defaultDirection: value })}
              items={directionOptions.map(option => ({ id: option.value, description: option.value }))}
              loading={submitting}
              htmlFor='direction'
            />
            <p className="text-xs text-[hsl(var(--foreground-clear))]">
              Quando definida, sub-categorias criadas nesta categoria terão esta direção selecionada por padrão
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant={'outline'} onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
