'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { TransactionCategoryFormDialog } from '@/components/TransactionCategoryFormDialog';

interface Category {
  id: string;
  category: string;
  createdAt: string;
}

export default function TransactionCategoriesPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  const isAdmin = user?.roles?.some(r => r.name === 'Administrador');

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchCategories();
  }, [isAuthenticated, isAdmin]);

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

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (c: Category) => {
    setDialogMode('edit');
    setSelectedCategory(c);
    setDialogOpen(true);
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

  if (!isAuthenticated) return null;
  if (!isAdmin) {
    return (
      <DashboardLayout userName={user?.name || ''}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Categorias de Transação</h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1">Gerencie as categorias usadas em transações</p>
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
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">{c.category}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(c)} className="p-2 text-[#B4F481] hover:bg-[#B4F481]/10 rounded-lg transition-colors" title="Editar"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Remover"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <TransactionCategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} mode={dialogMode} category={selectedCategory} onSuccess={fetchCategories} />
      </div>
    </DashboardLayout>
  );
}
