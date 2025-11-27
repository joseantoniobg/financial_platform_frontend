'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import toast from 'react-hot-toast';
import { StSelect } from './st-select';
import { FormField } from './ui/form-field';
import { useAuthStore } from '@/store/authStore';

interface TransactionType {
  id: string;
  type: string;
  direction: string;
  defaultDueDay?: number;
  category: {
    id: string;
    category: string;
  };
}

interface Wallet {
  id: string;
  title: string;
  description?: string;
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
  const { user } = useAuthStore();

  const [typeId, setTypeId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [transactionDate, setTransactionDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [installments, setInstallments] = useState('1');
  const [obs, setObs] = useState('');
  const [isAporte, setIsAporte] = useState(false);
  const [isEarnings, setIsEarnings] = useState(false);
  const [isResgate, setIsResgate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletId, setWalletId] = useState('');

  // Check if selected type is Investimento
  const selectedType = transactionTypes.find((t) => t.id === typeId);
  const showInvestimentoOptions = selectedType?.direction === 'Investimento';

  // Calculate next future date with specific day
  const getNextDateWithDay = (day: number): string => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let targetDate = new Date(currentYear, currentMonth, day);

    // If the target day in current month has passed, move to next month
    if (day < currentDay) {
      targetDate = new Date(currentYear, currentMonth + 1, day);
    }

    // Handle invalid dates (e.g., day 31 in February)
    // JavaScript will roll over to the next valid date
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(targetDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${dayStr}`;
  };

  // Handle type selection change
  useEffect(() => {
    if (typeId && selectedType?.defaultDueDay) {
      const nextDueDate = getNextDateWithDay(selectedType.defaultDueDay);
      setDueDate(nextDueDate);
    }
  }, [typeId, selectedType]);

  useEffect(() => {
    const fetchUserAndWallets = async () => {
      try {
          const walletsRes = await fetch(`/api/wallets/user/${user?.sub}`);
          if (walletsRes.ok) {
            const walletsData = await walletsRes.json();
            setWallets(walletsData);
          }
      } catch (error) {
        console.error('Error fetching user or wallets:', error);
      }
    };

    if (open) {
      fetchUserAndWallets();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Reset form
      setTypeId('');
      setAmount(0);
      setTransactionDate('');
      setDueDate('');
      setPaymentDate('');
      setInstallments('1');
      setObs('');
      setIsAporte(false);
      setIsEarnings(false);
      setIsResgate(false);
      setWalletId('');
    } else {
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      setTransactionDate(today);
      setDueDate(today);
      setPaymentDate(today);
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
        paymentDate: paymentDate || undefined,
        installments: parseInt(installments),
        obs: obs.trim() || undefined,
        isEarnings: showInvestimentoOptions ? isEarnings : undefined,
        isAporte: showInvestimentoOptions ? isAporte : undefined,
        isResgate: showInvestimentoOptions ? isResgate : undefined,
        walletId: walletId || undefined,
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
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--foreground))]">Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="typeId">Sub-categoria*</Label>
            <StSelect
              label='Categoria'
              loading={false}
              value={typeId}
              onChange={(e) => setTypeId(e)}
              required
              htmlFor='transaction-type'
              items={transactionTypes.map((tt) => ({ id: tt.id, description: `${tt.type} (${tt.category.category})` }))}
            />
          </div>

          <div>
            <StSelect
              label='Carteira'
              loading={false}
              value={walletId}
              onChange={(e) => setWalletId(e)}
              required={false}
              htmlFor='wallet-select'
              items={wallets.map((w) => ({ id: w.id, description: w.title }))}
              searchable={false}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Organize suas transações em diferentes carteiras
            </p>
          </div>

          <div>
            <Label htmlFor="amount">Valor Total*</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onChange={(value) => setAmount(value)}
              required
              placeholder="0,00"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionDate">Data da Transação*</Label>
              <DatePickerInput
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
              <DatePickerInput
                id="dueDate"
                value={dueDate}
                onChange={(value) => setDueDate(value)}
                required
                disabled={loading}
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="paymentDate">Data de Pagamento</Label>
              <DatePickerInput
                id="paymentDate"
                value={paymentDate}
                onChange={(value) => setPaymentDate(value)}
                disabled={loading}
                placeholder="dd/mm/aaaa"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Opcional - quando foi efetivamente pago
              </p>
            </div>
          </div>

          {showInvestimentoOptions && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <input
                  type="checkbox"
                  id="isEarnings"
                  checked={isEarnings}
                  onChange={(e) => setIsEarnings(e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <Label htmlFor="isEarnings" className="cursor-pointer text-sm font-normal">
                  Rendimento do investimento? (juros/crescimento da carteira)
                </Label>
              </div>

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

              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <input
                  type="checkbox"
                  id="isResgate"
                  checked={isResgate}
                  onChange={(e) => setIsResgate(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500"
                />
                <Label htmlFor="isResgate" className="cursor-pointer text-sm font-normal">
                  💰 Resgate do ativo? (retira dinheiro do investimento)
                </Label>
              </div>
            </div>
          )}

          <FormField
            id="obs"
            value={obs}
            onChangeTextArea={(e) => setObs(e.target.value)}
            placeholder="Observações adicionais..."
            textArea
            rows={3}
            label='Observações'
          /> 
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
