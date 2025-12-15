import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Cell } from 'recharts';
import { ClientData } from '../../types';
import { COLORS } from '../../constants';

interface MatrixChartProps {
  data: ClientData[];
}

const MatrixScatterChart: React.FC<MatrixChartProps> = ({ data }) => {
  // Logic: 
  // X: % Crescimento vs Ano Anterior (perc_fat_aa)
  // Y: % Participação na Média (part_med) - Simplified share proxy
  
  // Classify quadrants based on arbitrary thresholds for demo (e.g., 100% growth, 20% share)
  const MID_X = 100;
  const MID_Y = 20;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-md text-xs z-50">
          <p className="font-bold text-slate-800">{data.cliente}</p>
          <p className="text-slate-600">Cresc. AA: <span className="font-semibold">{data.perc_fat_aa.toFixed(1)}%</span></p>
          <p className="text-slate-600">Part. Média: <span className="font-semibold">{data.part_med.toFixed(1)}%</span></p>
          <p className="text-blue-600 font-medium mt-1">Fat: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.fat_atual)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center justify-between">
        <div className="flex items-center">
            <span className="w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
            Matriz de Oportunidades
        </div>
      </h3>
      <div className="text-xs text-slate-500 mb-4 flex gap-4">
        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> Estrelas (Alta Part / Alto Cresc)</span>
        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> Diamantes (Alta Part / Baixo Cresc)</span>
        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div> Oportunidades (Baixa Part / Alto Cresc)</span>
        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-500 mr-1"></div> Cuidado (Baixa Part / Baixo Cresc)</span>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="perc_fat_aa" 
              name="Cresc. AA" 
              unit="%" 
              tick={{ fontSize: 10 }}
              label={{ value: '% Crescimento vs AA', position: 'bottom', offset: 0, fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              dataKey="part_med" 
              name="Part. Média" 
              unit="%" 
              tick={{ fontSize: 10 }}
              label={{ value: '% Participação', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <ReferenceLine x={MID_X} stroke="#94a3b8" strokeDasharray="3 3" />
            <ReferenceLine y={MID_Y} stroke="#94a3b8" strokeDasharray="3 3" />
            
            {/* Quadrant Labels */}
            <ReferenceLine x={140} stroke="none" label={{ position: 'top', value: 'Estrelas / Oportunidades', fontSize: 10, fill: '#cbd5e1' }} />
            
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Clientes" data={data} fill="#8884d8">
              {data.map((entry, index) => {
                 let fill = COLORS.neutral;
                 if (entry.perc_fat_aa >= MID_X && entry.part_med >= MID_Y) fill = COLORS.success; // Star
                 else if (entry.perc_fat_aa < MID_X && entry.part_med >= MID_Y) fill = COLORS.primary; // Cow/Diamond
                 else if (entry.perc_fat_aa >= MID_X && entry.part_med < MID_Y) fill = COLORS.warning; // Opportunity
                 else fill = COLORS.danger; // Dog/Care
                 
                 return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MatrixScatterChart;