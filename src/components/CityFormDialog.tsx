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
}

interface State {
  id: string;
  name: string;
  country?: Country;
}

interface City {
  id: string;
  name: string;
  isActive: boolean;
  state?: State;
}

interface CityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  city?: City;
  onSuccess: () => void;
}

export function CityFormDialog({ open, onOpenChange, mode, city, onSuccess }: CityFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    stateId: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStates();
      
      if (mode === 'edit' && city) {
        setFormData({
          name: city.name,
          stateId: city.state?.id || '',
          isActive: city.isActive,
        });
      } else if (mode === 'create') {
        setFormData({
          name: '',
          stateId: '',
          isActive: true,
        });
      }
    }
  }, [open, mode, city]);

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const res = await fetch('/api/locations/all-states');
      if (res.ok) {
        const data = await res.json();
        setStates(data);
      }
    } catch {
      toast.error('Erro ao carregar estados');
    } finally {
      setLoadingStates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = mode === 'create' 
        ? '/api/locations/all-cities' 
        : `/api/locations/cities/${city?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`Cidade ${mode === 'create' ? 'criada' : 'atualizada'} com sucesso!`);
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await res.text();
        toast.error(error || `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} cidade`);
      }
    } catch {
      toast.error(`Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} cidade`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--card))] border-[hsl(var(--border))] shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">
            {mode === 'create' ? 'Nova Cidade' : 'Editar Cidade'}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))]">
            {mode === 'create' 
              ? 'Preencha os dados da nova cidade'
              : 'Atualize os dados da cidade'
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

          <StSelect
            label="Estado"
            htmlFor="state"
            required
            value={formData.stateId}
            onChange={(value) => setFormData({ ...formData, stateId: value })}
            items={states.map((s) => ({ id: s.id, description: `${s.name} (${s.country?.name ?? ''})` }))}
            loading={loadingStates || submitting}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-[hsl(var(--border))] bg-[hsl(var(--input-background))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-[hsl(var(--background))]"
              disabled={submitting}
            />
            <Label htmlFor="isActive" className="text-[hsl(var(--foreground))] cursor-pointer">
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
