'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface CountryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  country?: Country;
  onSuccess: () => void;
}

export function CountryFormDialog({ open, onOpenChange, mode, country, onSuccess }: CountryFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && mode === 'edit' && country) {
      setFormData({
        name: country.name,
        code: country.code,
        isActive: country.isActive,
      });
    } else if (open && mode === 'create') {
      setFormData({
        name: '',
        code: '',
        isActive: true,
      });
    }
  }, [open, mode, country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = mode === 'create' 
        ? '/api/locations/countries' 
        : `/api/locations/countries/${country?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`País ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso!`);
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await res.text();
        toast.error(error || `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} país`);
      }
    } catch {
      toast.error(`Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} país`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0D2744] border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-white">
            {mode === 'create' ? 'Novo País' : 'Editar País'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-400">
            {mode === 'create' 
              ? 'Preencha os dados do novo país'
              : 'Atualize os dados do país'
            }
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
            <Label htmlFor="code" className="text-slate-700 dark:text-gray-300">
              Código <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
              maxLength={3}
              disabled={submitting}
              required
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Código de 2-3 letras (ex: BRA, USA)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600"
              disabled={submitting}
            />
            <Label htmlFor="isActive" className="text-slate-700 dark:text-gray-300 cursor-pointer">
              Ativo
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
