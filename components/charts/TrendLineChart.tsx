import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ClientData } from '../../types';

interface TrendLineChartProps {
  data: ClientData[];
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({ data }) => {
  // Get top 5 clients by current revenue
  const top5 = [...data].sort((a, b) => b.fat_atual - a.fat_atual).slice(0, 5);

  // Transform data for Recharts [ { month: 'M-6', client1: 100, client2: 200... }, ... ]
  const chartData = [
    { name: 'M-6', ...top5.reduce((acc, curr) => ({ ...acc, [curr.cliente]: curr.fat_m6 }), {}) },
    { name: 'M-5', ...top5.reduce((acc, curr) => ({ ...acc, [curr.cliente]: curr.fat_m5 }), {}) },
    { name: 'M-4', ...top5.reduce((acc, curr) => ({ ...acc, [curr.cliente]: curr.fat_m4 }), {}) },
    { name: 'M-3', ...top5.reduce((acc, curr) => ({ ...acc, [curr.cliente]: curr.fat_m3 }), {}) },
    { name: 'M-2', ...top5.reduce((acc, curr) => ({ ...acc, [curr.cliente]: curr.fat_m2 }), {}) },
    { name: 'M-1', ...top5.reduce((acc, curr) => ({ ...acc, [curr.cliente]: curr.fat_m1 }), {}) },
    { name: 'Atual', ...top5.reduce((acc, curr) => ({ ...acc, [curr.cliente]: curr.fat_atual }), {}) },
  ];

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-md text-xs">
            <p className="font-bold text-slate-800 mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></div>
                    <span className="text-slate-600 truncate max-w-[150px]">{entry.name}:</span>
                    <span className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}</span>
                </div>
            ))}
          </div>
        );
      }
      return null;
    };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
        Evolução Top 5 Clientes (6 Meses)
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            {top5.map((client, index) => (
              <Line
                key={client.id}
                type="monotone"
                dataKey={client.cliente}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendLineChart;