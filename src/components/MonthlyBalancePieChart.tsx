'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface MonthlyBalancePieChartProps {
  incomes: number;
  expenses: number;
}

export function MonthlyBalancePieChart({ incomes, expenses }: MonthlyBalancePieChartProps) {
  const data = [
    { name: 'Saldo Restante', value: incomes || 0 },
    { name: 'Saídas', value: expenses || 0 },
  ];

  const COLORS = {
    'Saldo Restante': '#10b981', // green-500
    Saídas: '#ef4444', // red-500
  };

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / (incomes + expenses)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="w-full h-66 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string, entry: any) => (
              <span className="text-sm text-slate-700 dark:text-gray-300">
                {value}: {formatCurrency(entry.payload.value)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
