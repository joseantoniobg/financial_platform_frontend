'use client';

import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { use, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { DashBoardCard } from '@/components/ui/dashboard-card';
import { MonthlyBalancePieChart } from '@/components/MonthlyBalancePieChart';
import { StCard } from '@/components/StCard';
import { ArrowBigDown, ArrowBigUp, ArrowDownIcon, ArrowDownToDot, ArrowLeft, ArrowLeftIcon, ArrowRightIcon, ArrowUpAZ, ArrowUpFromDotIcon, ArrowUpIcon, LineChartIcon } from 'lucide-react';
import { formatCurrency, formatUrlParams, groupSum, formatDate, formatDateWithTime } from '../../lib/utils';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { StSelect } from '@/components/st-select';
import { set } from 'date-fns';
import PieChartHome, { COLORS } from '@/components/pie-chart-home';
import { Card } from '@/components/ui/card';
import { PageTitle } from '@/components/ui/page-title';
import IncomeExpenseChart from '@/components/incomes-expenses-chart';
import { StTable } from '@/components/st-table';

type DashboardData = {
  currentMonth: string;
  balances: [{
    sumIncomes: number;
    sumEarnings: number;
    sumExpenses: number;
    sumContributions: number;
    sumWithdrawals: number;
    category: string;
    type: string;
    paymentMonth: string;
  }],
  expenses: [
        {
            category: string,
            type: string,
            total: number,
            paymentMonth: string
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

type ConsultantDashboardData = {
  activeUsers: number;
  monthMeetings: number;
  futureSchedules: number;
  alerts: {id: string, name: string, meeting_date: string, subject: string, type: string }[];
}

export default function HomePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [consultantData, setConsultantData] = useState<ConsultantDashboardData | null>(null);
  const [filters, setFilters] = useState<{ initialDate?: string; finalDate?: string, selectedRole: number }>({ initialDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], finalDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0], selectedRole: user?.roles[0].id || 0 });
  const [filterType, setFilterType] = useState<string>('1');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedBottomYear, setSelectedBottomYear] = useState<number>(new Date().getFullYear());
  const [yearlyComparisonData, setYearlyComparisonData] = useState<DashboardData | null>(null); 

  const initialYearDate = new Date(selectedBottomYear, 0, 1).toISOString().split('T')[0];
  const finalYearDate = new Date(selectedBottomYear, 11, 31).toISOString().split('T')[0];

  const handleFilters = (value: string) => {
    if (filterType === '1') {
      const year = new Date().getFullYear();
      const month = parseInt(value) - 1;
      const initialDate = new Date(year, month, 1).toISOString().split('T')[0];
      const finalDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      setFilters(curr => ({ ...curr, initialDate, finalDate }));
    } else if (filterType === '2') {
      const year = parseInt(value);
      const initialDate = new Date(year, 0, 1).toISOString().split('T')[0];
      const finalDate = new Date(year, 11, 31).toISOString().split('T')[0];
      setFilters(curr => ({ ...curr, initialDate, finalDate }));
    }
  }

  const fetchYearData = useCallback(async () => {
    if (filters.selectedRole !== 2) return;
    setLoading(true);
    try {
      const params = formatUrlParams({ selectedRole: filters.selectedRole, initialDate: initialYearDate, finalDate: finalYearDate });
      const res = await fetch(`/api/dashboard?${params}`);
      if (res.ok) {
        const data = await res.json();
        setYearlyComparisonData(data);
      } else {
        toast.error('Erro ao carregar dados do dashboard');
      }
    } catch {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [initialYearDate, finalYearDate]);

  useEffect(() => {
    handleFilters(filterType === '1' ? (selectedMonth || (new Date().getMonth() + 1).toString()) : (selectedYear || new Date().getFullYear().toString()));
  }, [filterType, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchYearData();
  }, [selectedBottomYear, fetchYearData]);

  const isAuthenticated = useRequireAuth();

  const fetchDashboardData = async () => {
    if (!filters.selectedRole) return;
    setLoading(true);
    try {
      const params = formatUrlParams(filters);
      const res = await fetch(`/api/dashboard?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (filters.selectedRole === 3) {
          setConsultantData(data);
        } else {
          setDashboardData(data);
        }
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
    fetchYearData();
  }, [filters]);

  if (!isAuthenticated || !user) {
    return null;
  }

 
  let sumIncomes = 0;
  let sumExpenses = 0;
  let sumEarnings = 0;
  let sumContributions = 0;
  let sumWithdrawals = 0;
  let currentMonthNetBalance = 0;

  if (filters.selectedRole === 2) {
    sumIncomes = dashboardData?.balances.reduce((a, b) => a + Number(b.sumIncomes), 0) || 0;
    sumExpenses = dashboardData?.balances.reduce((a, b) => a + Number(b.sumExpenses), 0) || 0;
    sumEarnings = dashboardData?.balances.reduce((a, b) => a + Number(b.sumEarnings), 0) || 0;
    sumContributions = dashboardData?.balances.reduce((a, b) => a + Number(b.sumContributions), 0) || 0;
    sumWithdrawals = dashboardData?.balances.reduce((a, b) => a + Number(b.sumWithdrawals), 0) || 0;
    currentMonthNetBalance = (sumIncomes + sumEarnings) - (sumExpenses + sumWithdrawals);
  }

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const currentYear = new Date().getFullYear();

  const years = [];
  for (let year = 2010; year <= currentYear + 100; year++) {
    years.push(year);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
          <Card className='flex justify-between items-center p-4'>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Bem-vindo(a) à Plataforma Financeira
            </h1>
            {user?.roles.length > 1 && <StSelect
              label="Visão"
              htmlFor="roleSelect"
              horizontal
              items={user.roles.map(role => ({ id: `${role.id}`, description: role.name }))}
              value={`${filters.selectedRole}`}
              onChange={(value) => { setFilters(curr => ({ ...curr, selectedRole: parseInt(value) })); }}
              loading={false}
              searchable={false}
            />}
         </Card>
    {filters.selectedRole === 3 && (<>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <StCard>
              <div className='flex flex-col'>
                <span className='text-sm mb-1'>Clientes Ativos</span> 
                <span className='text-center text-[1.5rem] font-bold'>{consultantData?.activeUsers || 0}</span>
              </div>
            </StCard>
            <StCard>
              <div className='flex flex-col'>
                <span className='text-sm mb-1'>Consultorias Realizadas no Mês</span> 
                <span className='text-center text-[1.5rem] font-bold'>{consultantData?.monthMeetings || 0}</span>
              </div>
            </StCard>
            <StCard>
              <div className='flex flex-col'>
                <span className='text-sm mb-1'>Reuniões Futuras</span> 
                <span className='text-center text-[1.5rem] font-bold'>{consultantData?.futureSchedules || 0}</span>
              </div>
            </StCard>
          </div>
          <div>
            <StCard className='p-3'>
              <PageTitle title="Alertas" fontSize='text-lg' className='ml-4' />
              <div className='mt-2'>
                {consultantData?.alerts.length === 0 && <span>Nenhum alerta pendente.</span>}
                {consultantData?.alerts && consultantData?.alerts.length > 0 && <StTable 
                  colunmNames={['Nome', 'Data', 'Assunto']}
                  items={consultantData?.alerts.map((alert) => ({
                    name: alert.name,
                    date: alert.type === 'anniversary' ? formatDate(alert.meeting_date) : formatDateWithTime(alert.meeting_date),
                    subject: alert.subject,
                  }))}
                />}
              </div>
            </StCard>
          </div>
        </>)}
    {filters.selectedRole === 2 && (
         <>
          <div className='grid grid-cols-1 lg:flex lg:justify-between'>
            <div className='flex gap-3 m-2'>
              <StSelect
                label="Período"
                htmlFor="expensesPer"
                items={[
                  { id: '1', description: 'Mensal' },
                  { id: '2', description: 'Anual' },
                  { id: '3', description: 'Específico' },
                ]}
                value={filterType}
                onChange={(value) => { setFilterType(value); }}
                loading={false}
                searchable={false}
              />
              {filterType !== '3' && <StSelect
                label="Período"
                htmlFor="expensesPer"
                items={filterType === '1' ? months.map((month, index) => ({ id: (index + 1).toString(), description: month + `/${currentYear}` })) : years.map(year => ({ id: year.toString(), description: year.toString() }))}
                value={filterType === '1' ? (selectedMonth || (new Date().getMonth() + 1).toString()) : (selectedYear || currentYear.toString())}
                onChange={(value) => { if(filterType === '1') setSelectedMonth(value); else setSelectedYear(value); handleFilters(value); }}
                loading={false}
                searchable={false}
              />}
              {filterType === '3' && (<><FormField
                label="Data Inicial"
                htmlFor="initialDate"
                date
                value={filters.initialDate || ''}
                onChangeValue={(e) => setFilters({ ...filters, initialDate: `${e}` })}
              />
              <FormField
                label="Data Final"
                htmlFor="finalDate"
                date
                value={filters.finalDate || ''}
                onChangeValue={(e) => setFilters({ ...filters, finalDate: `${e}` })}
              /></>)}
              <Button onClick={fetchDashboardData} className='self-end'>Aplicar Filtros</Button>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:w-120'>
              <StCard>
                <div className='flex flex-col'>
                  <span className='text-sm mb-1'><ArrowUpIcon className="inline-block w-4 h-4 text-green-500" /> Entradas:</span> 
                  <span className='text-center text-[1.1rem] font-bold'>{formatCurrency(sumIncomes)}</span>
                </div>
              </StCard>
              <StCard>
                <div className='flex flex-col'>
                  <span className='text-sm mb-1'><ArrowDownIcon className="inline-block w-4 h-4 text-red-500" /> Saídas:</span> 
                  <span className='text-center text-[1.1rem] font-bold'>{formatCurrency(sumExpenses)}</span>
                </div>
              </StCard>
              <StCard>
                <div className='flex flex-col'>
                  <span className='text-sm mb-1'><LineChartIcon className="inline-block w-4 h-4 text-blue-500" /> Saldo:</span> 
                  <span className='text-center text-[1.1rem] font-bold'>{formatCurrency(sumIncomes - sumExpenses)}</span>
                </div>
              </StCard>
            </div>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <StCard className='p-10'>
              <PageTitle title={<span><ArrowUpFromDotIcon className="inline-block w-9 h-9 text-green-500" /> Entradas</span>} />
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <PieChartHome items={dashboardData?.balances.filter(balance => balance.sumIncomes !== 0).map(balance => ({ name: balance.category, value: balance.sumIncomes }))} />
                <div className='flex flex-col justify-center'>
                  {dashboardData?.balances.filter(balance => balance.sumIncomes !== 0).length === 0 && <span className='text-center'>Nenhuma entrada registrada neste período.</span>}
                  {dashboardData?.balances.filter(balance => balance.sumIncomes !== 0).map((balance, index) => (
                    <div key={index} className='flex justify-between my-2'>
                      <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded-sm' style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{balance.type}</span>
                      </div>
                      <span>{formatCurrency(balance.sumIncomes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StCard>
            <StCard className='p-10'>
              <PageTitle title={<span><ArrowDownToDot className="inline-block w-9 h-9 text-red-500" /> Saídas</span>} />
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <PieChartHome items={dashboardData?.expenses.map(expense => ({ name: expense.category, value: expense.total }))} />
                <div className='flex flex-col justify-center'>
                  {dashboardData?.expenses.filter(expense => expense.total !== 0).length === 0 && <span className='text-center'>Nenhuma saída registrada neste período.</span>}
                  {dashboardData?.expenses.filter(expense => expense.total !== 0).map((expense, index) => (
                    <div key={index} className='flex justify-between my-2'>
                      <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded-sm' style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{expense.type}</span>
                      </div>
                      <span>{formatCurrency(expense.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StCard>
          </div>
          <div>
            <Card>
              <div className='m-4'>
                <div className='flex justify-between'>
                  <div className='flex gap-6 items-center'>
                    <StSelect
                      label="Ano"
                      htmlFor="year"
                      items={years.map(year => ({ id: year.toString(), description: year.toString() }))}
                      value={selectedBottomYear.toString()}
                      onChange={(value) => setSelectedBottomYear(parseInt(value))}
                      loading={false}
                      searchable={false}
                      horizontal
                    />
                    <PageTitle title="Comparativo Anual de Entradas e Saídas" fontSize='text-lg' />
                  </div>
                  <div className='flex gap-2'>
                    <Button size="sm" onClick={() => setSelectedBottomYear((curr) => curr - 1)}><ArrowLeftIcon className="w-5 h-5" /></Button>
                    <Button size="sm" onClick={() => setSelectedBottomYear((curr) => curr + 1)}><ArrowRightIcon className="w-5 h-5" /></Button>
                  </div>
                </div>
                <IncomeExpenseChart selectedYear={selectedBottomYear} months={groupSum(yearlyComparisonData?.balances || [], 'paymentMonth', 'sumIncomes', 'sumExpenses') as { paymentMonth: string, sumIncomes: number, sumExpenses: number }[]} />
              </div>
            </Card>
          </div>
        </>)}
      </div>
    </DashboardLayout>
  );
}
