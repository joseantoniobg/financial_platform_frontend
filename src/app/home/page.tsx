'use client';

import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function HomePage() {
  const { user } = useAuthStore();
  
  const isAuthenticated = useRequireAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout userName={user.name}>
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Bem-vindo(a) à Plataforma Financeira
          </h1>
          <p className="text-slate-600 dark:text-gray-300">
            Você está logado como <span className="font-semibold text-[#B4F481]">{user.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Nome</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{user.username}</p>
          </div>

          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Perfil</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              {user.roles && user.roles[0] ? user.roles[0].name : 'Usuário'}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Status</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">Ativo</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
