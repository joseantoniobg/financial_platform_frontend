import { Pie, PieChart } from 'recharts';

const data = [
  { name: 'Group A', value: 400, fill: '#0088FE' },
  { name: 'Group B', value: 300, fill: '#00C49F' },
  { name: 'Group C', value: 300, fill: '#FFBB28' },
  { name: 'Group D', value: 200, fill: '#FF8042' },
];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#00E396', '#775DD0', '#FEB019', '#FF66C3', '#0046', '#FF8C00'];

export default function PieChartHome({ isAnimationActive = true, items }: { isAnimationActive?: boolean, items?: { name: string; value: number; }[] }) {
  if (!items || items.length === 0 || items.every(item => item.value === 0)) {
    isAnimationActive = false;
    items = [{ name: 'Nenhuma', value: 100 }];
  }

  return (
    <PieChart style={{ maxWidth: '400px', maxHeight: '400px', aspectRatio: 1 }} responsive>
      <Pie
        data={items.map((item, index) => ({ ...item, fill: item.name === 'Nenhuma' ? '#CCCCCC' : COLORS[index % COLORS.length] }))}
        cx="50%"
        cy="50%"
        innerRadius="80%"
        outerRadius="100%"
        cornerRadius="50%"
        fill="#8884d8"
        paddingAngle={2}
        dataKey="value"
        isAnimationActive={isAnimationActive}
      />
    </PieChart>
  );
}