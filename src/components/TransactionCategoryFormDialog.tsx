'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import UniversalSelect from './UniversalSelect';

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
}

export function TransactionCategoryFormDialog({ open, onOpenChange, mode, category, onSuccess }: Props) {
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
    setSubmitting(true);

    try {
      const url = mode === 'create' ? '/api/transaction-categories' : `/api/transaction-categories/${category?.id}`;
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
      <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--card))] border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">{mode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}</DialogTitle>
          <DialogDescription className="text-[hsl(var(--foreground-clear))]">{mode === 'create' ? 'Crie uma nova categoria' : 'Atualize a categoria'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-[hsl(var(--foreground))]">Nome <span className="text-red-500">*</span></Label>
            <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultDirection" className="text-[hsl(var(--foreground))]">Direção Padrão</Label>
            <UniversalSelect
              value={formData.defaultDirection}
              onChange={(value) => setFormData({ ...formData, defaultDirection: value })}
              placeholder="Selecione uma direção padrão"
              items={directionOptions}
              disabled={submitting}
            />
            <p className="text-xs text-[hsl(var(--foreground-clear))]">
              Quando definida, sub-categorias criadas nesta categoria terão esta direção selecionada por padrão
            </p>
          </div>

          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))] rounded-lg transition-colors" disabled={submitting}>Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] rounded-lg font-medium hover:bg-[hsl(var(--primary-hover))] transition-colors disabled:opacity-50 flex items-center gap-2" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
