import React, { useState, useMemo } from 'react';
import { ClientData, SortField, SortDirection } from '../types';
import { formatCurrency, formatPercent } from '../constants';
import { ChevronDown, ChevronUp, Search, Filter, User } from 'lucide-react';

interface ClientTableProps {
  data: ClientData[];
}

const ClientTable: React.FC<ClientTableProps> = ({ data }) => {
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('fat_atual');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredData = useMemo(() => {
    return data
      .filter(item => 
        item.cliente.toLowerCase().includes(filterText.toLowerCase()) &&
        (filterType === 'ALL' || item.type === filterType)
      )
      .sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        // Handle potentially missing values or robust comparison
        const valA = a[sortField];
        const valB = b[sortField];
        
        if (valA < valB) return -1 * multiplier;
        if (valA > valB) return 1 * multiplier;
        return 0;
      });
  }, [data, filterText, filterType, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4 ml-1 opacity-20"><ChevronDown size={14} /></div>;
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="ml-1 text-blue-600" /> 
      : <ChevronDown size={14} className="ml-1 text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <span className="w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
            Detalhamento de Clientes
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white w-full sm:w-auto"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="SA">S.A.</option>
              <option value="LTDA">Ltda</option>
              <option value="EPP">EPP</option>
              <option value="ME">ME</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('cliente')}>
                <div className="flex items-center">Cliente <SortIcon field="cliente" /></div>
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('vendedor')}>
                <div className="flex items-center">Vendedor <SortIcon field="vendedor" /></div>
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('fat_atual')}>
                <div className="flex items-center justify-end">Fat. Atual <SortIcon field="fat_atual" /></div>
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('med_ult_3m')}>
                <div className="flex items-center justify-end">Méd. 3M <SortIcon field="med_ult_3m" /></div>
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('perc')}>
                <div className="flex items-center justify-end">Perf. (%) <SortIcon field="perc" /></div>
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('gap')}>
                <div className="flex items-center justify-end">GAP (R$) <SortIcon field="gap" /></div>
              </th>
               <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('perc_fat_aa')}>
                <div className="flex items-center justify-end">vs AA (%) <SortIcon field="perc_fat_aa" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{client.cliente}</span>
                    <span className="text-xs text-slate-400">{client.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-slate-600 text-sm">
                    <User size={14} className="mr-1 text-slate-400" />
                    {client.vendedor}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {formatCurrency(client.fat_atual)}
                </td>
                <td className="px-6 py-4 text-right text-slate-500">
                  {formatCurrency(client.med_ult_3m)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    client.perc >= 110 ? 'bg-emerald-100 text-emerald-700' :
                    client.perc >= 90 ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {formatPercent(client.perc)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <span className={`${client.gap > 0 ? 'text-rose-500' : 'text-emerald-500'} font-medium`}>
                        {formatCurrency(client.gap)}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-1">
                        {client.perc_fat_aa > 100 ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-rose-500" />}
                        <span className={`text-sm ${client.perc_fat_aa > 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatPercent(client.perc_fat_aa)}
                        </span>
                   </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  Nenhum cliente encontrado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
         <span>Exibindo {filteredData.length} de {data.length} clientes</span>
      </div>
    </div>
  );
};

export default ClientTable;