'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DateInput } from '@/components/ui/date-input';
import { SessionTitle } from '@/components/ui/session-title';
import { StTable } from './st-table';
import { FormField } from './ui/form-field';
import { formatCurrency } from '../lib/utils';

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  startDate: string;
  targetDate: string;
  expectedReturnRate: number;
  monthlyContribution: number;
  notes?: string;
}

interface FinancialGoalsSectionProps {
  goals: FinancialGoal[];
  isClient?: boolean;
  showGoalForm: boolean;
  goalForm: {
    title: string;
    targetAmount: string;
    startDate: string;
    targetDate: string;
    expectedReturnRate: string;
    notes: string;
  };
  editingGoalId: string | null;
  onAddGoal: () => void;
  onEditGoal: (goal: FinancialGoal) => void;
  onSaveGoal: () => void;
  onDeleteGoal: (id: string) => void;
  onCancelGoalForm: () => void;
  setGoalForm: (form: {
    title: string;
    targetAmount: string;
    startDate: string;
    targetDate: string;
    expectedReturnRate: string;
    notes: string;
  }) => void;
}

export function FinancialGoalsSection(props: FinancialGoalsSectionProps) {
  const {
    goals,
    showGoalForm,
    isClient,
    goalForm,
    editingGoalId,
    onAddGoal,
    onEditGoal,
    onSaveGoal,
    onDeleteGoal,
    onCancelGoalForm,
    setGoalForm
  } = props;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const calculateMonths = (startDate: string, targetDate: string) => {
    const start = new Date(startDate);
    const target = new Date(targetDate);
    const months = (target.getFullYear() - start.getFullYear()) * 12 + 
                   (target.getMonth() - start.getMonth());
    return Math.max(1, months);
  };

   const calculateMonthlyContribution = (
    targetAmount: number,
    startDate: string,
    targetDate: string,
    expectedReturnRate: number,
  ): number => {
    const start = new Date(startDate);
    const target = new Date(targetDate);
    
    const months = (target.getFullYear() - start.getFullYear()) * 12 + 
                   (target.getMonth() - start.getMonth());
    
    if (months <= 0) {
      return targetAmount; // Se não há prazo, retorna o valor total
    }

    const monthlyRate = expectedReturnRate / 100;

    if (monthlyRate === 0) {
      return targetAmount / months;
    }

    const monthlyContribution = targetAmount * (monthlyRate / (Math.pow(1 + monthlyRate, months) - 1));

    return Math.round(monthlyContribution * 100) / 100;
  }

  return (
    <div className="space-y-4">
      <SessionTitle title={isClient ? "Meus objetivos para o futuro" : "Objetivos Financeiros"} subTitle={isClient ? "Aqui você pode acompanhar e gerenciar seus objetivos financeiros pessoais" : "Gerenciar os objetivos financeiros"} leftContents={!showGoalForm && (
        <Button type="button" size="sm" onClick={onAddGoal}>
          Adicionar Objetivo Financeiro
        </Button>
      )} />
      
      {goals.length > 0 && (
        <div className="overflow-x-auto">
            <StTable
                colunmNames={['Objetivo', 'Valor Alvo', 'Início', 'Data Alvo', 'Prazo', 'Rent. Mensal', 'Aporte Mensal', 'Ações']}
                items={goals.map(goal => ({
                    objective: (<><div className="font-medium">{goal.title}</div>
                                    {goal.notes && (
                                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">{goal.notes}</div>
                                    )}
                                </>),
                    targetValue: formatCurrency(goal.targetAmount),
                    start: formatDate(goal.startDate),
                    targetDate: formatDate(goal.targetDate),
                    term: `${calculateMonths(goal.startDate, goal.targetDate)} ${calculateMonths(goal.startDate, goal.targetDate) === 1 ? 'mês' : 'meses'}`,
                    monthlyReturn: `${goal.expectedReturnRate}%`,
                    monthlyContribution: formatCurrency(goal.monthlyContribution),
                    actions: (<div className="flex justify-end gap-2">
                      <Button type="button" variant="edit" size="sm" onClick={() => onEditGoal(goal)}>
                        Editar
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => onDeleteGoal(goal.id)}>
                        Excluir
                      </Button>
                    </div>),
                }))}
            />
        </div>
      )}
      
      {showGoalForm && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg space-y-4">
          <h4 className="font-medium text-2xl text-[hsl(var(--foreground))]">
            {editingGoalId ? 'Editar Objetivo' : 'Adicionar Objetivo'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                label='Título do Objetivo'
                required 
                value={goalForm.title} 
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="Ex: Carro Novo, Viagem, Aposentadoria"
            />
            <FormField
                label='Valor Alvo'
                currency
                required
                value={goalForm.targetAmount} 
                onChangeValue={(e) => setGoalForm({ ...goalForm, targetAmount: `${e}` })}
                placeholder="R$ 10.000,00"
            />
            <FormField
                label='Rentabilidade Mensal Esperada (%)'
                type='number'
                step='0.01'
                required
                value={goalForm.expectedReturnRate} 
                onChange={(e) => setGoalForm({ ...goalForm, expectedReturnRate: e.target.value })}
                placeholder="1.0"
                helpText="Padrão: 1% ao mês (aproximadamente 12,68% ao ano com juros compostos)"
            />
            <FormField
                label='Data de Início'
                required
                date
                value={goalForm.startDate} 
                onChangeValue={(e) => setGoalForm({ ...goalForm, startDate: `${e}` })}
            />
            <FormField
                label='Data Alvo'
                required
                date
                value={goalForm.targetDate} 
                onChangeValue={(e) => setGoalForm({ ...goalForm, targetDate: `${e}` })}
            />
            {goalForm.startDate && goalForm.targetDate && goalForm.targetAmount && goalForm.expectedReturnRate && (
              <div className="md:col-span-2 p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg">
                <div className="text-sm text-[hsl(var(--foreground))]">
                  <p className="font-medium mb-2">Resumo do Planejamento:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Prazo: {calculateMonths(goalForm.startDate, goalForm.targetDate)} meses</li>
                    <li>• Valor a ser alcançado: {formatCurrency(parseFloat(goalForm.targetAmount) || 0)}</li>
                    <li>• Rentabilidade mensal: {goalForm.expectedReturnRate}%</li>
                    <li className="font-bold text-[hsl(var(--green))] text-base mt-2">
                      • Aporte mensal estimado: {formatCurrency(calculateMonthlyContribution(
                        parseFloat(goalForm.targetAmount),
                        goalForm.startDate,
                        goalForm.targetDate,
                        parseFloat(goalForm.expectedReturnRate)
                      ))}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-700 dark:text-gray-300">Observações</Label>
              <Textarea 
                value={goalForm.notes} 
                onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                rows={2}
                placeholder="Detalhes adicionais sobre o objetivo..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={onSaveGoal} size="sm">Salvar</Button>
            <Button type="button" variant="outline" onClick={onCancelGoalForm} size="sm">Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
