import { formatCurrency } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Button } from './ui/button';

const IncomeExpenseChart = ({ months, selectedYear }: { months?: { paymentMonth: string, sumIncomes: number, sumExpenses: number }[]; selectedYear?: number }) => {
  const currentMonths = [
    `01/${selectedYear}`, `02/${selectedYear}`, `03/${selectedYear}`, `04/${selectedYear}`, `05/${selectedYear}`, `06/${selectedYear}`, `07/${selectedYear}`, `08/${selectedYear}`, `09/${selectedYear}`, `10/${selectedYear}`, `11/${selectedYear}`, `12/${selectedYear}`
  ];

  const [isMobile, setIsMobile] = useState(false);
  const [monthSet, setMonthSet] = useState(3);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalMonths = currentMonths.map(month => {
    const monthData = months?.find(m => m.paymentMonth === month);
    return {
      paymentMonth: month,
      sumIncomes: monthData ? monthData.sumIncomes : 0,
      sumExpenses: monthData ? monthData.sumExpenses : 0,
    };
  }).slice(isMobile ? 3 * monthSet : 0, isMobile ? 3 * monthSet + 3 : 12);

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
        {formatCurrency(value).replace('R$ ', '')}
      </text>
    );
  };

  return (
    <div className={`w-full h-[350px] bg-white p-4`}>      
      <ResponsiveContainer width="100%" height={isMobile ? "90%" : "100%"}>
        <BarChart
          data={totalMonths}
          barGap={4}
          layout='horizontal'
          margin={{ top: 20, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="paymentMonth" 
            tickFormatter={formatMonth}
            tick={{ fontSize: 14 }}
            style={{ fontWeight: 'bold' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value).replace('R$ ', '').split(',')[0]}
            width={35}
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
      {isMobile && (
        <div className="flex justify-center mt-4 gap-4">
          <Button
            variant={'outline'}
            onClick={() => setMonthSet((prev) => Math.max(prev - 1, 0))}
            disabled={monthSet === 0}
          >
            Anterior
          </Button>
          <Button
            variant={'outline'}
            onClick={() => setMonthSet((prev) => Math.min(prev + 1, 3))}
            disabled={monthSet === 3}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseChart;