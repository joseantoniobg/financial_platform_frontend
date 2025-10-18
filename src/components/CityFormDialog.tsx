'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import UniversalSelect from './UniversalSelect';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0D2744] border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-white">
            {mode === 'create' ? 'Nova Cidade' : 'Editar Cidade'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-400">
            {mode === 'create' 
              ? 'Preencha os dados da nova cidade'
              : 'Atualize os dados da cidade'
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
            <Label htmlFor="state" className="text-slate-700 dark:text-gray-300">
              Estado <span className="text-red-500">*</span>
            </Label>
            <UniversalSelect
              value={formData.stateId}
              onChange={(value) => setFormData({ ...formData, stateId: value })}
              items={states.map((s) => ({ value: s.id, label: `${s.name} (${s.country?.name ?? ''})` }))}
              placeholder="Selecione um estado"
              searchable
              searchPlaceholder="Buscar estado..."
              disabled={loadingStates || submitting}
              triggerClassName="w-full bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
              contentClassName="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600 max-h-[40vh] overflow-auto p-1"
              itemClassName="text-slate-800 dark:text-white whitespace-normal break-words py-1"
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
