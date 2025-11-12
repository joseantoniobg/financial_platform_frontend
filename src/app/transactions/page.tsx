'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TransactionFormDialog } from '@/components/TransactionFormDialog';
import { PaymentDateDialog } from '@/components/PaymentDateDialog';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageTitle } from '@/components/ui/page-title';
import { TopAddButton } from '@/components/ui/top-add-button';
import { MainLoadableContent } from '@/components/ui/main-loadable-content';
import { ExpandableButton } from '@/components/ui/expandable-button';

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
  paymentDate?: string;
  isEarnings?: boolean;
  obs?: string;
  totalInstallments: number;
  installmentNumber: number;
  type: TransactionType;
  calculation: number;
  verb: string;
  action: string;
}

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());

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
        // Filter out Aporte and Resgate types (not user-selectable, created via checkboxes)
        const visibleTypes = data.filter((type: { direction?: string }) => 
          type.direction !== 'Aporte' && type.direction !== 'Resgate'
        );
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

  const handleSetPaymentDate = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPaymentDialogOpen(true);
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

  const toggleTicket = (ticket: number) => {
    setExpandedTickets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ticket)) {
        newSet.delete(ticket);
      } else {
        newSet.add(ticket);
      }
      return newSet;
    });
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
          <PageTitle title={"Transações"} subtitle={"Gerencie suas transações financeiras e parcelas"} />
          <TopAddButton onClick={() => setDialogOpen(true)} label={"Nova Transação"} />
        </div>

        <MainLoadableContent isLoading={loading} length={groupedTransactions.length}>
          <div className="bg-[hsl(var(--card))] rounded-lg shadow-md border border-[hsl(var(--app-border))]/50 divide-y divide-[hsl(var(--app-border))]">
            {groupedTransactions.map((group) => {
              const first = group[0];
              const total = group.reduce((sum, t) => sum + (t.calculation !== 3 ? parseFloat(t.amount.toString()) : 0), 0);
              const isExpanded = expandedTickets.has(first.ticket);
              
              return (
                <div key={first.ticket} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <ExpandableButton isExpanded={isExpanded} onClick={() => toggleTicket(first.ticket)} />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-xs bg-[hsl(var(--primary))]/80 text-[hsl(var(--foreground))] px-1.5 py-0.5 rounded font-semibold">
                          #{first.ticket}
                        </span>
                        <h3 className="font-semibold text-base text-[hsl(var(--foreground))]">
                          {first.type.type}
                        </h3>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--card-accent))] text-[hsl(var(--foreground-clear))] font-medium">
                          {first.type.category.category}
                        </span>
                        <span className="text-xs text-[hsl(var(--foreground))] ml-2">
                          {formatDate(first.date)}
                        </span>
                        {first.obs && (
                          <span className="text-xs text-[hsl(var(--foreground-clear))] ml-2 italic">
                            {first.obs}
                          </span>
                        )}
                        <span className="text-xs text-[hsl(var(--foreground))]">
                          ({group.length} parcela{group.length !== 1 ? 's' : ''})
                        </span>
                        <span className="text-base font-semibold text-[hsl(var(--foreground))] ml-auto">
                          {formatCurrency(total)}
                        </span>
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

                  {isExpanded && (
                    <div className="space-y-1.5 mt-2">
                      {group.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between pl-4 pr-2 h-[35px] bg-[hsl(var(--card-accent))]/50 rounded"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-xs font-medium text-[hsl(var(--foreground-clear))] min-w-[60px]">
                            {transaction.installmentNumber}/{transaction.totalInstallments}
                          </span>
                          <span className="text-xs text-[hsl(var(--foreground-clear))]">
                            Venc: {formatDate(transaction.dueDate)}
                          </span>
                          {transaction.paymentDate && (
                            <span className="text-xs text-[hsl(var(--primary-hover))] dark:text-[hsl(var(--primary))] font-medium">
                              {transaction.verb} em: {formatDate(transaction.paymentDate)}
                            </span>
                          )}
                          {transaction.isEarnings && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--primary))]/70 text-[hsl(var(--foreground-clear))] font-medium">
                              💰 Rendimento
                            </span>
                          )}
                          <span className="text-sm font-semibold text-[hsl(var(--foreground))] dark:text-white ml-auto">
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSetPaymentDate(transaction)}
                            className={`p-1.5 m-1 ml-4 rounded ${
                              transaction.paymentDate ?
                              'text-[hsl(var(--primary))] hover:bg-green-500/10' :
                               'text-orange-400 hover:bg-orange-200'
                            }`}
                            title={transaction.paymentDate ? 'Alterar Pagamento' : 'Pagar'}
                          >
                            <div className='flex p-1 justify-center gap-2 align-center'>
                              {transaction.paymentDate ? (
                                <CheckCircle className="h-4 w-4 mt-1" />
                              ) : (
                                <Circle className="h-4 w-4 mt-1" />
                              )}
                              {transaction.paymentDate ? transaction.verb + '!' : transaction.action}
                            </div>
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </MainLoadableContent>

        <TransactionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          transactionTypes={transactionTypes}
          onSuccess={fetchTransactions}
        />

        <PaymentDateDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          transactionId={selectedTransaction?.id || ''}
          currentPaymentDate={selectedTransaction?.paymentDate}
          onSuccess={fetchTransactions}
        />
      </div>
    </DashboardLayout>
  );
}
