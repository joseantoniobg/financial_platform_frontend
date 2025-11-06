'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface Client {
  id: string;
  login: string;
  name: string;
  email: string;
  contact?: string;
  birthDate?: string;
  clientCategory?: {
    id: string;
    name: string;
  };
  city?: {
    id: string;
    name: string;
    state?: {
      id: string;
      name: string;
      code: string;
    };
  };
  consultancyType?: 'Financeira' | 'Empresarial' | 'Pessoal';
  lastMeeting?: string;
  status: 'active' | 'inactive';
  // New fields
  document?: string;
  plan?: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual' | 'Personalizado';
  planValue?: number;
  contractNumber?: string;
  contractStatus?: 'Ativo' | 'Inativo' | 'Encerrado' | 'Em negociação';
  consultant?: {
    id: string;
    name: string;
  };
  contractStartDate?: string;
  contractEndDate?: string;
  address?: string;
  prospectionOrigin?: 'Indicação' | 'Instagram' | 'Site' | 'Eventos' | 'Outro';
  profession?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ClientesPage() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const router = useRouter();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchClients();
        }
    };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      if (res.ok) {
        setClients(data.users);
        setTotal(data.total);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [page, isAuthenticated]);

  const handleCreateClient = () => {
    router.push('/clientes/novo');
  };

  const handleEditClient = (clientId: string) => {
    router.push(`/clientes/${clientId}`);
  };

  if (!isAuthenticated || !user) return null;

  // Check if user is Administrador
  const isAdmin = user.roles?.some(role => role.name === 'Administrador');
  
  if (!isAdmin) {
    return (
      <DashboardLayout userName={user.name}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Acesso Negado
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Apenas administradores podem acessar esta página.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Gerenciar Clientes
          </h1>
          <button 
            onClick={handleCreateClient}
            className="flex items-center gap-2 px-4 py-2 bg-[#B4F481] text-[#0A1929] rounded-lg font-medium hover:bg-[#9FD96F] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Novo Cliente
          </button>
        </div>

        <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou login..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyUp={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0A1929] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#B4F481] focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Carregando...
            </div>
          ) : clients.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Nenhum cliente encontrado
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo de Consultoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Último Atendimento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">{client.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{client.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">{client.contact || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">
                          {client.clientCategory?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">
                          {client.consultancyType || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">
                          {client.lastMeeting ? formatDate(client.lastMeeting) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-300">
                          {client.city ? `${client.city.name}, ${client.city.state?.code || ''}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {client.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditClient(client.id)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Editar cliente"
                            >
                              <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Mostrando {clients.length} de {total} clientes
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 dark:text-white"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 10 >= total}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 dark:text-white"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
