import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ClientData } from '../../types';
import { COLORS } from '../../constants';

interface RevenueBarChartProps {
  data: ClientData[];
}

const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ data }) => {
  // Sort by revenue descending for better visualization and take top 10
  const chartData = [...data].sort((a, b) => b.fat_atual - a.fat_atual).slice(0, 10);

  const getBarColor = (actual: number, average: number) => {
    const ratio = actual / average;
    if (ratio > 1.1) return COLORS.success;
    if (ratio < 0.9) return COLORS.danger;
    return COLORS.warning;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-md text-sm">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <p className="text-blue-600">Atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}</p>
          <p className="text-slate-500">Média 3M: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].payload.med_ult_3m)}</p>
          <p className={`font-semibold mt-1 ${payload[0].payload.perc >= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
            Perf: {payload[0].payload.perc.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
        Top 10 - Faturamento Atual vs Média 3M
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="cliente" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="fat_atual" name="Fat. Atual" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.fat_atual, entry.med_ult_3m)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueBarChart;