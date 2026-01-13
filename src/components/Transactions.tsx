import { useRequireAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate, formatUrlParams } from "@/lib/utils";
import { TransactionFilterModel } from "@/models/transaction.filter.model";
import { User } from "@/store/authStore";
import { PaginatedResponseType } from "@/types/paginated.response.type";
import { useEffect, useMemo, useState } from "react";
import toast from 'react-hot-toast';
import { PageTitle } from "./ui/page-title";
import { TopAddButton } from "./ui/top-add-button";
import { FormField } from "./ui/form-field";
import { StCard } from "./StCard";
import { StSelect } from "./st-select";
import StMultiSelect from "./StMultiSelect";
import { Button } from "./ui/button";
import { MainLoadableContent } from "./ui/main-loadable-content";
import { ExpandableButton } from "./ui/expandable-button";
import { CheckCircle, Circle, Trash2 } from "lucide-react";
import Pagination from "./Pagination";
import { TransactionFormDialog } from "./TransactionFormDialog";
import { PaymentDateDialog } from "./PaymentDateDialog";

interface TransactionType {
  id: string;
  type: string;
  direction: string;
  category: {
    id: string;
    category: string;
  };
}

interface TransactionWallet {
  id: string;
  title: string;
}

interface TransactionFinancialGoal {
  id: string;
  title: string;
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
  wallet?: TransactionWallet;
  financialGoal?: TransactionFinancialGoal;
}

export function Transactions({ user, showSubTitle }: { user: User, showSubTitle?: boolean }) {
  const isAuthenticated = useRequireAuth();

  const [transactions, setTransactions] = useState<PaginatedResponseType<Transaction>>();
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());
  const [wallets, setWallets] = useState<TransactionWallet[]>([]);
  const [filters, setFilters] = useState<TransactionFilterModel>(new TransactionFilterModel(!showSubTitle ? user.sub : undefined));

  const isClient = useMemo(() => {
    return user?.roles?.some((role) => role.name === 'Cliente');
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && isClient) {
      fetchTransactions();
      fetchTransactionTypes();
      fetchWallets();
    }
  }, [isAuthenticated, isClient, filters.page, filters.size]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = formatUrlParams(filters);

      const res = await fetch('/api/transactions?' + params);
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
        const visibleTypes = data.filter((type: { direction?: string }) => 
          type.direction !== 'Aporte' && type.direction !== 'Resgate'
        );
        setTransactionTypes(visibleTypes);
      }
    } catch {
      toast.error('Erro ao carregar tipos de transação');
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories: { [key: string]: string } = {};
    transactionTypes.forEach((type) => {
      uniqueCategories[type.category.id] = type.category.category;
    });
    return Object.entries(uniqueCategories).map(([id, category]) => ({ id, category }));
  }, [transactionTypes]);

  const selectedTransactionTypes = useMemo(() => {
    return transactionTypes.filter((type) => filters.categoryIds.includes(type.category.id));
  }, [filters.categoryIds, transactionTypes]);

  const fetchWallets = async () => {
    try {
      const res = await fetch(`/api/wallets/user/${user?.sub}`);
      if (res.ok) {
        const data = await res.json();
        setWallets(data);
      } else {
        toast.error('Erro ao carregar carteiras');
        return [];
      }
    } catch {
      toast.error('Erro ao carregar carteiras');
      return [];
    }
  }

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
    const count = transactions?.content.filter(t => t.ticket === ticket).length;
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

  const groupedTransactions = useMemo(() => {
    const groups: { [key: number]: Transaction[] } = {};
    transactions?.content.forEach(transaction => {
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
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Esta página está disponível apenas para clientes.</p>
            </div>
        </div>
    );
  }

  return (
      <div className="flex flex-col gap-6 min-h-[95vh]">
        <div className="flex justify-between items-center">
          <PageTitle title={"Transações"} subtitle={showSubTitle ? "Gerencie suas transações financeiras e parcelas" : undefined} />
          <TopAddButton id="topAddButtonNewTransaction" onClick={() => setDialogOpen(true)} label={"Nova Transação"} />
        </div>

        <StCard>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              label="Data Inicial"
              htmlFor="initialDate"
              date
              value={filters.initialDate}
              onChangeValue={(value) => setFilters({ ...filters, initialDate: `${value}` })}
            />
            <FormField
              label="Data Final"
              htmlFor="finalDate"
              date
              value={filters.finalDate}
              onChangeValue={(value) => setFilters({ ...filters, finalDate: `${value}` })}
            />
            <StSelect
              label="Carteira"
              htmlFor="wallet"
              loading={loading}
              searchable={false}
              items={[{ id: 'None', description: 'Todas' }, ...wallets.map((wallet) => ({ id: wallet.id, description: wallet.title }))]}
              value={filters.walletId}
              onChange={(value) => setFilters({ ...filters, walletId: value })}
            />
            <StMultiSelect
              label="Categorias"
              htmlFor="categories"
              items={categories.map((category) => ({ id: category.id, label: category.category }))}
              onChange={(selectedItems) => {
                const selectedIds = selectedItems.map(item => item.id);
                setFilters({ ...filters, categoryIds: selectedIds });
              }}
            />
            {selectedTransactionTypes?.length > 0 && (<StMultiSelect
              label="Subcategoria"
              htmlFor="subcategory"
              items={[...selectedTransactionTypes.map((type) => ({ id: type.id, label: type.type }))]}
              onChange={(selectedItems) => {
                const selectedIds = selectedItems.map(item => item.id);
                setFilters({ ...filters, typeIds: selectedIds });
              }}
            />)} 
            <Button className='self-end' onClick={fetchTransactions}>Filtrar</Button>
          </div>
        </StCard>

        <MainLoadableContent isLoading={loading} noItems={groupedTransactions.length === 0 ? "Nenhuma transação cadastrada" : ""}>
          <div className="bg-[hsl(var(--card))] rounded-lg shadow-md border border-[hsl(var(--app-border))]/50 divide-y divide-[hsl(var(--app-border))] mb-[-15px]">
            {groupedTransactions.map((group) => {
              const first = group[0];
              const total = group.reduce((sum, t) => sum + (t.calculation !== 3 ? parseFloat(t.amount.toString()) : 0), 0);
              const isExpanded = expandedTickets.has(first.ticket);
              
              return (
                <div key={first.ticket} className="p-4">
                  <div className="flex items-center justify-between mb-0">
                    <div className="flex items-center gap-2 flex-1">
                      <ExpandableButton isExpanded={isExpanded} onClick={() => toggleTicket(first.ticket)} />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-xs bg-[hsl(var(--primary))]/80 text-[hsl(var(--nav-foreground))] px-1.5 py-0.5 rounded font-semibold">
                          #{first.ticket}
                        </span>
                        {first.wallet &&  
                            <span className="p-0.5 pl-2 pr-2 text-xs rounded bg-[hsl(var(--cyan))] text-[hsl(var(--foreground))] font-medium">
                              {first.wallet.title}
                            </span>}
                        {first.financialGoal && 
                            <span className="p-0.5 pl-2 pr-2 text-xs rounded bg-purple-500/80 text-white font-medium">
                              🎯 {first.financialGoal.title}
                            </span>}
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
                            <span className="text-xs text-[hsl(var(--green))] font-medium">
                              {transaction.verb} em: {formatDate(transaction.paymentDate)}
                            </span>
                          )}
                          {transaction.isEarnings && (
                            <span className="text-xs rounded bg-[hsl(var(--green))]/70 text-[hsl(var(--foreground-clear))] font-medium">
                              💰 Rendimento
                            </span>
                          )}
                          <span className="text-sm font-semibold text-[hsl(var(--foreground))] ml-auto">
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSetPaymentDate(transaction)}
                            className={`p-1.5 m-1 ml-4 rounded ${
                              transaction.paymentDate ?
                              'text-[hsl(var(--green))] hover:bg-green-500/10' :
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
          <Pagination
            totalPages={transactions?.totalPages}
            currentPage={filters.page}
            totalRecords={transactions?.totalRecords}
            setPage={setFilters}
          />
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
      </div>);
}