'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DateInput } from '@/components/ui/date-input';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';

interface Service {
  id: string;
  service: string;
}

interface Pricing {
  id: string;
  price: number;
  initialDate: string;
  finalDate?: string;
  createdAt: string;
}

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onSuccess: () => void;
}

export function PricingDialog({ open, onOpenChange, service, onSuccess }: PricingDialogProps) {
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    initialDate: '',
    finalDate: '',
  });

  useEffect(() => {
    if (open && service) {
      fetchPricings();
    }
  }, [open, service]);

  const fetchPricings = async () => {
    if (!service) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/services/${service.id}/pricing`);
      if (res.ok) {
        const data = await res.json();
        setPricings(data);
      }
    } catch {
      toast.error('Erro ao carregar precificações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('Informe um preço válido');
      return;
    }

    if (!formData.initialDate) {
      toast.error('Informe a data inicial');
      return;
    }

    if (formData.finalDate && new Date(formData.finalDate) < new Date(formData.initialDate)) {
      toast.error('Data final deve ser maior que a data inicial');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        serviceId: service!.id,
        price: parseFloat(formData.price),
        initialDate: formData.initialDate,
        ...(formData.finalDate && { finalDate: formData.finalDate }),
      };

      const res = await fetch('/api/services/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Precificação adicionada com sucesso!');
        setFormData({ price: '', initialDate: '', finalDate: '' });
        setShowForm(false);
        fetchPricings();
        onSuccess();
      } else {
        toast.error(data.message || 'Erro ao adicionar precificação');
      }
    } catch {
      toast.error('Erro ao adicionar precificação');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isCurrentPrice = (pricing: Pricing) => {
    const today = new Date();
    const initial = new Date(pricing.initialDate);
    const final = pricing.finalDate ? new Date(pricing.finalDate) : null;

    return initial <= today && (!final || final >= today);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-[hsl(var(--card))] border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">
            Gerenciar Precificação - {service?.service}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-gray-400">
            Adicione e visualize o histórico de preços do serviço
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Pricing Button */}
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center"
            >
              <Plus className="h-5 w-5" />
              Adicionar Nova Precificação
            </Button>
          )}

          {/* Add Pricing Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0A1929]">
              <h3 className="font-medium text-slate-800 dark:text-white">Nova Precificação</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[hsl(var(--foreground))]">
                    Preço <span className="text-red-500">*</span>
                  </Label>
                  <CurrencyInput
                    id="price"
                    value={formData.price}
                    onChange={(value) => setFormData({ ...formData, price: value.toString() })}
                    placeholder="0,00"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialDate" className="text-[hsl(var(--foreground))]">
                    Data Inicial <span className="text-red-500">*</span>
                  </Label>
                  <DateInput
                    id="initialDate"
                    value={formData.initialDate}
                    onChange={(value) => setFormData({ ...formData, initialDate: value })}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finalDate" className="text-[hsl(var(--foreground))]">
                    Data Final
                    <span className="text-xs text-gray-500 ml-1">(opcional)</span>
                  </Label>
                  <DateInput
                    id="finalDate"
                    value={formData.finalDate}
                    onChange={(value) => setFormData({ ...formData, finalDate: value })}
                    className="bg-white dark:bg-[#0D2744] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Deixe a data final em branco para definir um preço sem data de término.
                  Ao adicionar uma nova precificação, o preço anterior será automaticamente finalizado.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ price: '', initialDate: '', finalDate: '' });
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Adicionar Precificação
                </button>
              </div>
            </form>
          )}

          {/* Pricing History */}
          <div className="space-y-2">
            <h3 className="font-medium text-[hsl(var(--foreground))]">Histórico de Preços</h3>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--foreground))]" />
              </div>
            ) : pricings.length === 0 ? (
              <div className="text-center p-8 text-[hsl(var(--foreground))] rounded-lg">
                Nenhuma precificação cadastrada
              </div>
            ) : (
              <div className="space-y-2">
                {pricings.map((pricing) => (
                  <div
                    key={pricing.id}
                    className={`p-4 rounded-lg border ${
                      isCurrentPrice(pricing)
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : 'bg-white dark:bg-[#0A1929] border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-[hsl(var(--foreground))]">
                            {formatPrice(pricing.price)}
                          </span>
                          {isCurrentPrice(pricing) && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-[hsl(var(--foreground))] border border-green-300">
                              Preço Atual
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-[hsl(var(--foreground))]">
                          <span className="font-medium">Vigência:</span> {formatDate(pricing.initialDate)}
                          {pricing.finalDate ? ` até ${formatDate(pricing.finalDate)}` : ' (sem data final)'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant={"outline"}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
