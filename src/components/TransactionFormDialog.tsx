'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DateInput } from '@/components/ui/date-input';
import toast from 'react-hot-toast';

interface TransactionType {
  id: string;
  type: string;
  direction: string;
  category: {
    id: string;
    category: string;
  };
}

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionTypes: TransactionType[];
  onSuccess: () => void;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transactionTypes,
  onSuccess,
}: TransactionFormDialogProps) {
  const [typeId, setTypeId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [transactionDate, setTransactionDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [installments, setInstallments] = useState('1');
  const [obs, setObs] = useState('');
  const [isAporte, setIsAporte] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if selected type is Investimento
  const selectedType = transactionTypes.find((t) => t.id === typeId);
  const showAporteCheckbox = selectedType?.direction === 'Investimento';

  useEffect(() => {
    if (!open) {
      // Reset form
      setTypeId('');
      setAmount(0);
      setTransactionDate('');
      setDueDate('');
      setInstallments('1');
      setObs('');
      setIsAporte(false);
    } else {
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      setTransactionDate(today);
      setDueDate(today);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        typeId,
        amount,
        transactionDate,
        dueDate,
        installments: parseInt(installments),
        obs: obs.trim() || undefined,
        isAporte: showAporteCheckbox ? isAporte : undefined,
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Erro ao salvar transação');
        return;
      }

      toast.success('Transação criada com sucesso');
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error('Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#0D2744]">
        <DialogHeader>
          <DialogTitle className="text-[#0A1929] dark:text-white">Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="typeId">Sub-categoria*</Label>
            <select
              id="typeId"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0A1929] dark:text-white"
            >
              <option value="">Selecione...</option>
              {transactionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type} ({type.category.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Valor Total*</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              className='bg-white dark:bg-[#0A1929] border-gray-300 dark:border-gray-600 text-slate-800 dark:text-white'
              onChange={(value) => setAmount(value)}
              required
              placeholder="0,00"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionDate">Data da Transação*</Label>
              <DateInput
                id="transactionDate"
                value={transactionDate}
                onChange={(value) => setTransactionDate(value)}
                required
                disabled={loading}
                placeholder="dd/mm/aaaa"
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Data de Vencimento*</Label>
              <DateInput
                id="dueDate"
                value={dueDate}
                onChange={(value) => setDueDate(value)}
                required
                disabled={loading}
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="installments">Parcelas*</Label>
            <Input
              id="installments"
              type="number"
              min="1"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              required
            />
            {parseInt(installments) > 1 && amount && (
              <p className="text-sm text-gray-500 mt-1">
                {parseInt(installments)} parcelas mensais
              </p>
            )}
          </div>

          {showAporteCheckbox && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="isAporte"
                checked={isAporte}
                onChange={(e) => setIsAporte(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isAporte" className="cursor-pointer text-sm font-normal">
                Dinheiro de disponibilidade? (registra aporte)
              </Label>
            </div>
          )}

          <div>
            <Label htmlFor="obs">Observação</Label>
            <textarea
              id="obs"
              value={obs}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObs(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#0A1929] dark:text-white resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
