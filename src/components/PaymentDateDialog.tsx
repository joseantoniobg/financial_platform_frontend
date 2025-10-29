'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DateInput } from '@/components/ui/date-input';
import toast from 'react-hot-toast';

interface PaymentDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  currentPaymentDate?: string;
  onSuccess: () => void;
}

export function PaymentDateDialog({
  open,
  onOpenChange,
  transactionId,
  currentPaymentDate,
  onSuccess,
}: PaymentDateDialogProps) {
  const [paymentDate, setPaymentDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (currentPaymentDate) {
        setPaymentDate(currentPaymentDate);
      } else {
        // Default to today's date
        const today = new Date().toISOString().split('T')[0];
        setPaymentDate(today);
      }
    }
  }, [open, currentPaymentDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentDate }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Erro ao atualizar data de pagamento');
        return;
      }

      toast.success('Data de pagamento atualizada com sucesso');
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error('Erro ao atualizar data de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleClearPayment = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentDate: null }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Erro ao limpar data de pagamento');
        return;
      }

      toast.success('Data de pagamento removida com sucesso');
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error('Erro ao limpar data de pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0D2744]">
        <DialogHeader>
          <DialogTitle className="text-[#0A1929] dark:text-white">
            {currentPaymentDate ? 'Atualizar Data de Pagamento' : 'Registrar Pagamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="paymentDate">Data do Pagamento*</Label>
            <DateInput
              id="paymentDate"
              value={paymentDate}
              onChange={(value) => setPaymentDate(value)}
              required
              disabled={loading}
              placeholder="dd/mm/aaaa"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Informe quando a transação foi efetivamente paga
            </p>
          </div>

          <DialogFooter className="gap-2">
            {currentPaymentDate && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearPayment}
                disabled={loading}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
              >
                Limpar Pagamento
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800 dark:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#B4F481] text-[#0A1929] hover:bg-[#9FD96F] cursor-pointer border-0 dark:text-[#0A1929]"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
