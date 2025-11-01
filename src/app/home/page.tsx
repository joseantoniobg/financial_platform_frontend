'use client';

import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { DashBoardCard } from '@/components/ui/dashboard-card';
import { MonthlyBalancePieChart } from '@/components/MonthlyBalancePieChart';

type DashboardData = {
  balances: {
    currentMonth: string;
    sumIncomes: number;
    sumEarnings: number;
    sumExpenses: number;
    sumContributions: number;
    sumWithdrawals: number;
    currentMonthIncomes: number;
    currentMonthEarnings: number;
    currentMonthExpenses: number;
    currentMonthContributions: number;
    currentMonthWithdrawals: number;
    netBalance: number;
    currentMonthNetBalance: number;
  },
  expenses: [
        {
            category: string,
            type: string,
            total: number
        },
  ],
  expensesPerCategory: [
        {
            category: string,
            type: string,
            total: number
        },
  ],
  roles: string[];
}

export default function HomePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [expensesPerCategory, setExpensesPerCategory] = useState<boolean>(true);

  const isAuthenticated = useRequireAuth();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        console.log("Dashboard data fetched:", data);
      } else {
        toast.error('Erro ao carregar dados do dashboard');
      }
    } catch {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  const { 
    currentMonth,
    sumIncomes,
    sumEarnings,
    sumExpenses,
    sumContributions,
    sumWithdrawals,
    currentMonthIncomes,
    currentMonthEarnings,
    currentMonthExpenses,
    currentMonthContributions,
    currentMonthWithdrawals,
    netBalance,
    currentMonthNetBalance, 
  } = dashboardData?.balances ?? {};

  const expenses = expensesPerCategory ? dashboardData?.expensesPerCategory : dashboardData?.expenses;

  const textColor = (currentMonthNetBalance ?? 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <DashboardLayout userName={user.name}>
      <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md pl-5 p-3 border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Bem-vindo(a) à Plataforma Financeira
            </h1>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <DashBoardCard 
              title={`Balanço ${currentMonth}`} 
              items={[
                { label: 'Entradas', value: currentMonthIncomes || 0 },
                { label: 'Resgates', value: currentMonthWithdrawals || 0 },
                { label: 'Evolução da Carteira', value: currentMonthEarnings || 0 },
                { label: 'Saídas', value: currentMonthExpenses || 0 },
                { label: 'Aportes', value: currentMonthContributions || 0 },
              ]} 
              balance={currentMonthNetBalance || 0} 
              textColor={textColor}
              chart={
                <MonthlyBalancePieChart 
                  incomes={currentMonthIncomes || 0} 
                  expenses={currentMonthExpenses || 0} 
                />
              }
            />

            <DashBoardCard title={`Saídas`} total={expenses?.reduce((a, b) => a + b.total, 0)} items={(expenses ?? [])?.map(expense => ({ label: `${expense.category} ${expense.type ? ' - ' + expense.type : ''}`, value: expense.total }))}>
              <div>
                <p className='mb-2'>Exibir por:</p>
                <input type="radio" id="byCategory" name="expenseView" value="byCategory" checked={expensesPerCategory} onChange={() => setExpensesPerCategory(true)} />
                <label htmlFor="byCategory" className="ml-2 mr-4 text-sm">Categoria</label>
                <input type="radio" id="byType" name="expenseView" value="byType" checked={!expensesPerCategory} onChange={() => setExpensesPerCategory(false)} />
                <label htmlFor="byType" className="ml-2 text-sm">Sub-Categoria</label>
              </div>
            </DashBoardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
