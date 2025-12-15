import React from 'react';
import { ClientData } from '../types';
import { formatCurrency, formatPercent } from '../constants';
import { DollarSign, TrendingUp, Users, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardsProps {
  data: ClientData[];
}

const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const totalFatAtual = data.reduce((acc, curr) => acc + curr.fat_atual, 0);
  const totalFat3M = data.reduce((acc, curr) => acc + curr.med_ult_3m, 0);
  const totalFatAA = data.reduce((acc, curr) => acc + curr.fat_aa, 0);
  
  const growth3M = ((totalFatAtual - totalFat3M) / totalFat3M) * 100;
  const growthAA = ((totalFatAtual - totalFatAA) / totalFatAA) * 100;

  const Card = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
          <Icon size={24} />
        </div>
      </div>
      {subtext && (
        <div className="mt-4 flex items-center text-sm">
           {trend === 'up' && <ArrowUpRight size={16} className="text-emerald-500 mr-1" />}
           {trend === 'down' && <ArrowDownRight size={16} className="text-rose-500 mr-1" />}
           <span className={`${trend === 'up' ? 'text-emerald-600 font-semibold' : trend === 'down' ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
             {subtext}
           </span>
           <span className="text-slate-400 ml-1">vs anterior</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card 
        title="Faturamento Atual" 
        value={formatCurrency(totalFatAtual)} 
        icon={DollarSign}
        trend={growthAA >= 0 ? 'up' : 'down'}
        subtext={formatPercent(Math.abs(growthAA))}
      />
      <Card 
        title="Cresc. vs Média 3M" 
        value={formatPercent(growth3M)} 
        icon={TrendingUp}
        trend={growth3M >= 0 ? 'up' : 'down'}
        subtext={`${growth3M > 0 ? '+' : ''}${formatPercent(growth3M)}`}
      />
      <Card 
        title="Cresc. vs Ano Anterior" 
        value={formatPercent(growthAA)} 
        icon={BarChart3}
        trend={growthAA >= 0 ? 'up' : 'down'}
        subtext={`${growthAA > 0 ? '+' : ''}${formatPercent(growthAA)}`}
      />
      <Card 
        title="Total de Clientes" 
        value={data.length} 
        icon={Users}
        trend="neutral"
        subtext="Ativos na carteira"
      />
    </div>
  );
};

export default KPICards;