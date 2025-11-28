'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormField } from './ui/form-field';
import { Button } from './ui/button';

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
      <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--card))] border-[hsl(var(--border))] shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">
            {mode === 'create' ? 'Novo País' : 'Editar País'}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))]">
            {mode === 'create' 
              ? 'Preencha os dados do novo país'
              : 'Atualize os dados do país'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label='Nome'
              htmlFor='name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={submitting}
            />

          <div className="space-y-2">
            <FormField
              label='Código'
              htmlFor='code'
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              disabled={submitting}
              placeholder="Código de 2-3 letras (ex: BRA, USA)"
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Código de 2-3 letras (ex: BRA, USA)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-[hsl(var(--border))] dark:border-[hsl(var(--border))]"
              disabled={submitting}
            />
            <Label htmlFor="isActive" className="text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))] cursor-pointer">
              Ativo
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
