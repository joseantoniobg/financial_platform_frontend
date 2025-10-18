'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserTransactionTypeFormDialog } from '@/components/UserTransactionTypeFormDialog';

interface Category {
  id: string;
  category: string;
}

interface UserTransactionType {
  id: string;
  type: string;
  isFixed: boolean;
  isCredit: boolean;
  category?: Category;
}

export default function UserTransactionTypesPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();

  const [transactionTypes, setTransactionTypes] = useState<UserTransactionType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedType, setSelectedType] = useState<UserTransactionType | undefined>();

  const isClient = useMemo(() => {
    return user?.roles?.some((role) => role.name === 'Cliente');
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && isClient) {
      fetchTransactionTypes();
      fetchCategories();
    }
  }, [isAuthenticated, isClient]);

  const fetchTransactionTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user-transaction-types');
      if (res.ok) {
        const data = await res.json();
        setTransactionTypes(data);
      } else {
        toast.error('Erro ao carregar tipos de transação');
      }
    } catch {
      toast.error('Erro ao carregar tipos de transação');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/transaction-categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      toast.error('Erro ao carregar categorias');
    }
  };

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedType(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (item: UserTransactionType) => {
    setDialogMode('edit');
    setSelectedType(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este tipo de transação?')) return;

    try {
      const res = await fetch(`/api/user-transaction-types/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Tipo de transação removido');
        fetchTransactionTypes();
      } else {
        toast.error('Erro ao remover tipo de transação');
      }
    } catch {
      toast.error('Erro ao remover tipo de transação');
    }
  };

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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Meus Tipos de Transação</h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1">Cadastre categorias personalizadas para suas entradas e saídas.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#B4F481] text-[#0A1929] px-4 py-2 rounded-lg font-medium hover:bg-[#9FD96F] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Tipo
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : transactionTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum tipo cadastrado ainda</div>
        ) : (
          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fixo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactionTypes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">{item.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{item.category?.category ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{item.isCredit ? 'Saída' : 'Entrada'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{item.isFixed ? 'Sim' : 'Não'}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-[#B4F481] hover:bg-[#B4F481]/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <UserTransactionTypeFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={dialogMode}
          type={selectedType}
          categories={categories}
          onSuccess={fetchTransactionTypes}
        />
      </div>
    </DashboardLayout>
  );
}
