'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TransactionFormDialog } from '@/components/TransactionFormDialog';
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

interface Transaction {
  id: string;
  ticket: number;
  amount: number;
  date: string;
  dueDate: string;
  obs?: string;
  totalInstallments: number;
  installmentNumber: number;
  type: TransactionType;
  calculation: number;
}

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isClient = useMemo(() => {
    return user?.roles?.some((role) => role.name === 'Cliente');
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && isClient) {
      fetchTransactions();
      fetchTransactionTypes();
    }
  }, [isAuthenticated, isClient]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        toast.error('Erro ao carregar transações');
      }
    } catch {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionTypes = async () => {
    try {
      const res = await fetch('/api/user-transaction-types');
      if (res.ok) {
        const data = await res.json();
        // Filter out Aporte types (not user-selectable)
        const visibleTypes = data.filter((type: { direction?: string }) => type.direction !== 'Aporte');
        setTransactionTypes(visibleTypes);
      }
    } catch {
      toast.error('Erro ao carregar tipos de transação');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Transação excluída');
        fetchTransactions();
      } else {
        toast.error('Erro ao excluir transação');
      }
    } catch {
      toast.error('Erro ao excluir transação');
    }
  };

  const handleDeleteByTicket = async (ticket: number) => {
    const count = transactions.filter(t => t.ticket === ticket).length;
    if (!confirm(`Deseja realmente excluir todas as ${count} parcelas desta transação?`)) return;

    try {
      const res = await fetch(`/api/transactions/ticket/${ticket}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Transações excluídas');
        fetchTransactions();
      } else {
        toast.error('Erro ao excluir transações');
      }
    } catch {
      toast.error('Erro ao excluir transações');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Group transactions by ticket
  const groupedTransactions = useMemo(() => {
    const groups: { [key: number]: Transaction[] } = {};
    transactions.forEach(transaction => {
      if (!groups[transaction.ticket]) {
        groups[transaction.ticket] = [];
      }
      groups[transaction.ticket].push(transaction);
    });
    return Object.values(groups).map(group => group.sort((a, b) => a.installmentNumber - b.installmentNumber));
  }, [transactions]);

  if (!isAuthenticated) {
    return null;
  }

  if (!isClient) {
    return (
      <DashboardLayout userName={user?.name || ''}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Esta página está disponível apenas para clientes.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user?.name || ''}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white">Transações</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie suas transações financeiras e parcelas
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 bg-[#B4F481] text-[#0A1929] px-4 py-2 rounded-lg font-medium hover:bg-[#9FD96F] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : groupedTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma transação cadastrada
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {groupedTransactions.map((group) => {
              const first = group[0];
              const total = group.reduce((sum, t) => sum + (t.calculation !== 3 ? parseFloat(t.amount.toString()) : 0), 0);
              
              return (
                <div key={first.ticket} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs bg-[#B4F481]/20 text-[#0A1929] dark:text-[#B4F481] px-1.5 py-0.5 rounded font-semibold">
                          #{first.ticket}
                        </span>
                        <h3 className="font-semibold text-base text-[#0A1929] dark:text-white">
                          {first.type.type}
                        </h3>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400">
                          {first.type.category.category}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                          {formatDate(first.date)}
                        </span>
                        {first.obs && (
                          <span className="text-xs text-gray-500 dark:text-gray-500 ml-2 italic">
                            {first.obs}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-semibold text-[#0A1929] dark:text-white">
                        {formatCurrency(total)}
                      </div>
                    </div>
                    {group.length > 1 && (
                      <button
                        onClick={() => handleDeleteByTicket(first.ticket)}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir Grupo
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {group.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">
                            {transaction.installmentNumber}/{transaction.totalInstallments}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.dueDate)}
                          </span>
                           <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                            {transaction.calculation === 3 ? '(Aporte)' : ''}
                          </span>
                          <span className="text-sm font-semibold text-[#0A1929] dark:text-white ml-auto">
                            {formatCurrency(parseFloat((transaction.amount * (transaction.calculation === 3 ? -1 : 1)).toString()))}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors ml-2"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <TransactionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          transactionTypes={transactionTypes}
          onSuccess={fetchTransactions}
        />
      </div>
    </DashboardLayout>
  );
}
