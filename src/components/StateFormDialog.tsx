'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import UniversalSelect from './UniversalSelect';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormField } from './ui/form-field';
import { StSelect } from './st-select';
import { Button } from './ui/button';

interface Country {
  id: string;
  name: string;
  code: string;
}

interface State {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  country?: Country;
}

interface StateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  state?: State;
  onSuccess: () => void;
}

export function StateFormDialog({ open, onOpenChange, mode, state, onSuccess }: StateFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    countryId: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCountries();
      
      if (mode === 'edit' && state) {
        setFormData({
          name: state.name,
          code: state.code,
          countryId: state.country?.id || '',
          isActive: state.isActive,
        });
      } else if (mode === 'create') {
        setFormData({
          name: '',
          code: '',
          countryId: '',
          isActive: true,
        });
      }
    }
  }, [open, mode, state]);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const res = await fetch('/api/locations/countries');
      if (res.ok) {
        const data = await res.json();
        setCountries(data);
      }
    } catch {
      toast.error('Erro ao carregar países');
    } finally {
      setLoadingCountries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = mode === 'create' 
        ? '/api/locations/all-states' 
        : `/api/locations/states/${state?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`Estado ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso!`);
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await res.text();
        toast.error(error || `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} estado`);
      }
    } catch {
      toast.error(`Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} estado`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--card))] border-[hsl(var(--border))] shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">
            {mode === 'create' ? 'Novo Estado' : 'Editar Estado'}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))]">
            {mode === 'create' 
              ? 'Preencha os dados do novo estado'
              : 'Atualize os dados do estado'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              htmlFor="name"
              label="Nome"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              placeholder="Código de 2 letras (ex: SP, RJ, MG)"
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Código de 2 letras (ex: SP, RJ, MG)
            </p>
          </div>

          <div className="space-y-2">
            <StSelect
              label="País"
              htmlFor='country'
              loading={loadingCountries}
              value={formData.countryId}
              onChange={(value) => setFormData({ ...formData, countryId: value })}
              items={countries.map((c) => ({ id: c.id, description: c.name }))}
              searchable={false}
            />
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
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
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
