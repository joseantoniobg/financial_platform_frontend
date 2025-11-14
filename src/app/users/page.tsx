'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserFormDialog } from '@/components/UserFormDialog';
import { PageTitle } from '@/components/ui/page-title';
import { TopAddButton } from '@/components/ui/top-add-button';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  login: string;
  name: string;
  email: string;
  roles: Array<{ id: string; name: string }>;
  status: 'active' | 'inactive';
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotal(data.total);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchUsers();
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/toggle-status`, { method: 'PATCH' });
      if (res.ok) {
        toast.success('Status atualizado');
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleCreateUser = () => {
    setDialogMode('create');
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchUsers();
  };

  if (!isAuthenticated || !user) return null;

  return (
    <DashboardLayout userName={user.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <PageTitle title='Gerenciar Usuários' />
          <TopAddButton onClick={handleCreateUser} label='Novo Usuário' />
        </div>

        <UserFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={dialogMode}
          user={selectedUser}
          onSuccess={handleDialogSuccess}
        />

        <div className="bg-white dark:bg-[hsl(var(--card-accent))] rounded-lg shadow-md border border-[hsl(var(--app-border))]">
          <div className="p-4 border-b border-[hsl(var(--app-border))]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou login..."
                value={search}
                onKeyDown={handleSearch}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--app-border))] rounded-lg bg-white dark:bg-[hsl(var(--card))] text-slate-800 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[hsl(var(--foreground))]">
              Carregando...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Nenhum usuário encontrado
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[hsl(var(--card))]/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">Perfil</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-[hsl(var(--foreground))]">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-[hsl(var(--foreground))]">{u.login}</td>
                        <td className="px-6 py-4 text-sm text-[hsl(var(--foreground))]">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-[hsl(var(--foreground))]">
                          {u.roles && u.roles[0] ? u.roles[0].name : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.status === 'active' 
                              ? 'bg-[hsl(var(--green))]/40 text-[hsl(var(--green))]'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {u.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditUser(u)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Editar usuário"
                            >
                              <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(u.id)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              title={u.status === 'active' ? 'Inativar usuário' : 'Ativar usuário'}
                            >
                              <Power className={`h-4 w-4 ${
                                u.status === 'active' 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-green-600 dark:text-green-400'
                              }`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Mostrando {users.length} de {total} usuários
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                   >
                    Anterior
                  </Button>
                  <span className="px-3 py-1.5 text-sm text-[hsl(var(--foreground))]">
                    Página {page}
                  </span>
                  <Button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 10 >= total}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
