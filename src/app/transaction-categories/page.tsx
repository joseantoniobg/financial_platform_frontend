'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { TransactionCategoryFormDialog } from '@/components/TransactionCategoryFormDialog';
import { UserTransactionTypeFormDialog } from '@/components/UserTransactionTypeFormDialog';

interface Category {
  id: string;
  category: string;
  createdAt: string;
}

interface UserTransactionType {
  id: string;
  type: string;
  isFixed: boolean;
  isCredit: boolean;
  direction?: string;
  category?: Category;
}

export default function TransactionCategoriesPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [transactionTypes, setTransactionTypes] = useState<UserTransactionType[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  // sub-category (transaction type) dialog state
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subDialogMode, setSubDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedType, setSelectedType] = useState<UserTransactionType | undefined>();
  const [initialCategoryId, setInitialCategoryId] = useState<string | undefined>(undefined);

  const isClient = user?.roles?.some(r => r.name === 'Cliente');

  useEffect(() => {
    if (isAuthenticated && isClient) {
      fetchCategories();
      fetchTransactionTypes();
    }
  }, [isAuthenticated, isClient]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transaction-categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        toast.error('Erro ao carregar categorias');
      }
    } catch {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionTypes = async () => {
    try {
      const res = await fetch('/api/user-transaction-types');
      if (res.ok) {
        const data = await res.json();
        setTransactionTypes(data);
      } else {
        toast.error('Erro ao carregar sub-categorias');
      }
    } catch {
      toast.error('Erro ao carregar sub-categorias');
    }
  };

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  const handleCreateSub = (categoryId: string) => {
    setSubDialogMode('create');
    setSelectedType(undefined);
    setInitialCategoryId(categoryId);
    setSubDialogOpen(true);
  };

  const handleEdit = (c: Category) => {
    setDialogMode('edit');
    setSelectedCategory(c);
    setDialogOpen(true);
  };

  const handleEditSub = (t: UserTransactionType) => {
    setSubDialogMode('edit');
    setSelectedType(t);
    setInitialCategoryId(undefined);
    setSubDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta categoria?')) return;
    try {
      const res = await fetch(`/api/transaction-categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Categoria removida');
        fetchCategories();
      } else {
        toast.error('Erro ao remover categoria');
      }
    } catch {
      toast.error('Erro ao remover categoria');
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta sub-categoria?')) return;
    try {
      const res = await fetch(`/api/user-transaction-types/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Sub-categoria removida');
        fetchTransactionTypes();
      } else {
        toast.error('Erro ao remover sub-categoria');
      }
    } catch {
      toast.error('Erro ao remover sub-categoria');
    }
  };

  if (!isAuthenticated) return null;
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
            <h1 className="text-3xl font-bold text-[#0A1929] dark:text-white">Categorias</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie as categorias usadas em transações</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 bg-[#B4F481] text-[#0A1929] px-4 py-2 rounded-lg font-medium hover:bg-[#9FD96F] transition-colors">
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma categoria cadastrada</div>
        ) : (
          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((c) => {
                  const typesForCategory = transactionTypes.filter(t => t.category?.id === c.id);
                  return (
                    <>
                      <tr key={`cat-${c.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-[#0A1929] dark:text-white">{c.category}</td>
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleCreateSub(c.id)} className="flex items-center gap-2 bg-[#B4F481] text-[#0A1929] px-4 py-2 rounded-lg font-medium hover:bg-[#9FD96F] transition-colors" title="Adicionar Sub-categoria">Adicionar Sub-Categoria</button>
                            <button onClick={() => handleEdit(c)} className="p-2 text-[#B4F481] hover:bg-[#B4F481]/10 rounded-lg transition-colors" title="Editar"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Remover"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>

                      <tr key={`types-${c.id}`}>
                        <td colSpan={2} className="px-6 py-2 bg-gray-50 dark:bg-gray-900/60">
                          {typesForCategory.length === 0 ? (
                            <div className="text-sm text-gray-500 dark:text-gray-400">Nenhuma sub-categoria</div>
                          ) : (
                            <div className="space-y-2 border-1 rounded-sm">
                              {typesForCategory.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0D2744]">
                                  <div>
                                    <div className="text-sm font-medium text-slate-800 dark:text-white">{t.type}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{t.direction || (t.isCredit ? 'Saída' : 'Entrada')} • {t.isFixed ? 'Fixo' : 'Variável'}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditSub(t)} className="p-2 text-[#B4F481] hover:bg-[#B4F481]/10 rounded-lg transition-colors" title="Editar"><Edit className="h-4 w-4" /></button>
                                    <button onClick={() => handleDeleteSub(t.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Remover"><Trash2 className="h-4 w-4" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <TransactionCategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} mode={dialogMode} category={selectedCategory} onSuccess={fetchCategories} />
        <UserTransactionTypeFormDialog
          open={subDialogOpen}
          onOpenChange={setSubDialogOpen}
          mode={subDialogMode}
          type={selectedType}
          categories={categories}
          initialCategoryId={initialCategoryId}
          onSuccess={() => { fetchTransactionTypes(); fetchCategories(); }}
        />
      </div>
    </DashboardLayout>
  );
}
