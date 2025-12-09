import { formatCurrency } from '@/lib/utils';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

const IncomeExpenseChart = ({ months, selectedYear }: { months?: { paymentMonth: string, sumIncomes: number, sumExpenses: number }[]; selectedYear?: number }) => {
  const currentMonths = [
    `01/${selectedYear}`, `02/${selectedYear}`, `03/${selectedYear}`, `04/${selectedYear}`, `05/${selectedYear}`, `06/${selectedYear}`, `07/${selectedYear}`, `08/${selectedYear}`, `09/${selectedYear}`, `10/${selectedYear}`, `11/${selectedYear}`, `12/${selectedYear}`
  ];

  const totalMonths = currentMonths.map(month => {
    const monthData = months?.find(m => m.paymentMonth === month);
    return {
      paymentMonth: month,
      sumIncomes: monthData ? monthData.sumIncomes : 0,
      sumExpenses: monthData ? monthData.sumExpenses : 0,
    };
  });

  const formatMonth = (monthStr: string) => {
    const [month, year] = monthStr.split('/');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`;
  };

  const CustomLabel = (props: { x?: number; y?: number; width?: number; value?: number }) => {
    const { x, y, width, value } = props;
    return (
      <text 
        x={x! + width! / 2} 
        y={y! - 5} 
        fill="#333" 
        textAnchor="middle" 
        fontSize="12"
        fontWeight="500"
      >
        {formatCurrency(value)}
      </text>
    );
  };

  return (
    <div className="w-full h-[350px] bg-white p-8">      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={totalMonths}
          margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
          barGap={8}
          layout='horizontal'
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="paymentMonth" 
            tickFormatter={formatMonth}
            tick={{ fontSize: 14 }}
            style={{ fontWeight: 'bold' }}
          />
          <YAxis 
            tick={{ fontSize: 14 }}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(value as number)}
            labelFormatter={formatMonth}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => value === 'sumIncomes' ? 'Entradas' : 'Saídas'}
          />
          
          <Bar 
            dataKey="sumIncomes" 
            fill="#16a085" 
            radius={[8, 8, 0, 0]}
            maxBarSize={80}
            minPointSize={5}
          >
            <LabelList content={<CustomLabel />} />
          </Bar>
          <Bar 
            dataKey="sumExpenses" 
            fill="#e74c3c" 
            radius={[8, 8, 0, 0]}
            maxBarSize={80}
            minPointSize={5}
          >
            <LabelList content={<CustomLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;