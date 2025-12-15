import React from 'react';
import { ClientData } from '../types';
import { AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { formatPercent, formatCurrency } from '../constants';

interface AlertPanelProps {
  data: ClientData[];
}

const AlertPanel: React.FC<AlertPanelProps> = ({ data }) => {
  // Logic: Negative GAP > 20% (perf < 80%) OR Growth > 50%
  const alerts = data.reduce((acc: any[], client) => {
    if (client.perc < 80) {
      acc.push({
        id: `gap-${client.id}`,
        type: 'danger',
        client: client.cliente,
        message: 'Desempenho Crítico',
        detail: `Apenas ${formatPercent(client.perc)} da média`,
        value: client.gap
      });
    } else if (client.perc_fat_aa > 150) {
      acc.push({
        id: `growth-${client.id}`,
        type: 'success',
        client: client.cliente,
        message: 'Crescimento Exponencial',
        detail: `Cresceu ${formatPercent(client.perc_fat_aa)} vs AA`,
        value: client.perc_fat_aa
      });
    }
    return acc;
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Bell className="mr-2 text-slate-600" size={18} />
          Painel de Alertas
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
          {alerts.length}
        </span>
      </div>
      
      <div className="overflow-y-auto max-h-[500px] p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Nenhum alerta automático gerado.
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-3 rounded-lg border-l-4 text-sm ${
                alert.type === 'danger' 
                  ? 'border-rose-500 bg-rose-50' 
                  : 'border-emerald-500 bg-emerald-50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold text-xs uppercase ${
                   alert.type === 'danger' ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {alert.message}
                </span>
                {alert.type === 'danger' ? (
                  <AlertTriangle size={14} className="text-rose-500" />
                ) : (
                  <TrendingUp size={14} className="text-emerald-500" />
                )}
              </div>
              <p className="font-semibold text-slate-800 mb-1">{alert.client}</p>
              <p className="text-slate-600 text-xs">{alert.detail}</p>
              {alert.type === 'danger' && (
                 <p className="text-rose-600 text-xs mt-1 font-medium">Gap: {formatCurrency(alert.value)}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertPanel;