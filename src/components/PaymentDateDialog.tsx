'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import toast from 'react-hot-toast';
import { User } from '@/store/authStore';

interface PaymentDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  currentPaymentDate?: string;
  onSuccess: () => void;
  user: User;
}

export function PaymentDateDialog({
  open,
  onOpenChange,
  transactionId,
  currentPaymentDate,
  onSuccess,
  user,
}: PaymentDateDialogProps) {
  const [paymentDate, setPaymentDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (currentPaymentDate) {
        setPaymentDate(currentPaymentDate);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setPaymentDate(today);
      }
    }
  }, [open, currentPaymentDate]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentDate, userId: user.sub }),
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
        body: JSON.stringify({ paymentDate: null, userId: user.sub }),
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
      <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--background))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">
            {currentPaymentDate ? 'Atualizar Data de Pagamento' : 'Registrar Pagamento'}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div>
            <Label htmlFor="paymentDate">Data do Pagamento*</Label>
            <DatePickerInput
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
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
