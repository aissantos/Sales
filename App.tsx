import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { MOCK_DATA } from './constants';
import { ClientData } from './types';
import KPICards from './components/KPICards';
import RevenueBarChart from './components/charts/RevenueBarChart';
import MatrixScatterChart from './components/charts/MatrixScatterChart';
import TrendLineChart from './components/charts/TrendLineChart';
import ClientTable from './components/ClientTable';
import AlertPanel from './components/AlertPanel';
import { 
  Download, 
  Share2, 
  LayoutDashboard, 
  UploadCloud, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Users,
  Filter
} from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<ClientData[]>(MOCK_DATA);
  const [dashboardKey, setDashboardKey] = useState(0); 
  const [activeVendor, setActiveVendor] = useState<string>('Todos'); // Filter state
  
  // Upload State
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorNameInput, setVendorNameInput] = useState('');
  
  const [notification, setNotification] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived list of unique vendors
  const uniqueVendors = useMemo(() => {
    const vendors = new Set(data.map(d => d.vendedor || 'Desconhecido'));
    return Array.from(vendors).sort();
  }, [data]);

  // Derived data based on filter
  const displayedData = useMemo(() => {
    if (activeVendor === 'Todos') return data;
    return data.filter(d => d.vendedor === activeVendor);
  }, [data, activeVendor]);

  const cleanKey = (k: string) => k ? k.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  const parseNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      let clean = val.replace(/[R$\s\u00A0]/g, '');
      if (!clean) return 0;
      const lastComma = clean.lastIndexOf(',');
      const lastDot = clean.lastIndexOf('.');
      if (lastComma > lastDot) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: 'idle', message: '' });
    }, 4000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Step 1: User picks file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setVendorNameInput(''); // Reset input
    setShowVendorModal(true); // Open modal to ask for vendor name
    
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  // Step 2: User confirms vendor name and starts processing
  const handleConfirmUpload = () => {
    if (!pendingFile) return;
    if (!vendorNameInput.trim()) {
      alert("Por favor, digite o nome do vendedor.");
      return;
    }
    
    setShowVendorModal(false);
    setNotification({ type: 'loading', message: `Processando dados para ${vendorNameInput}...` });

    setTimeout(() => {
      processFile(pendingFile, vendorNameInput.trim());
      setPendingFile(null);
    }, 500);
  };

  const processFile = (file: File, vendorName: string) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (bstr) {
        try {
          // @ts-ignore
          const lib = XLSX.read ? XLSX : (XLSX.default || XLSX);
          if (!lib.read) throw new Error("Erro ao carregar biblioteca XLSX");

          const wb = lib.read(bstr, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const dataArr = lib.utils.sheet_to_json(ws, { header: 1 }) as any[][];

          if (dataArr && dataArr.length > 0) {
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(dataArr.length, 20); i++) {
                const rowStr = dataArr[i].map((cell: any) => cleanKey(String(cell || '')));
                if (rowStr.some((c: string) => c.includes('cliente') || c.includes('nome') || c.includes('empresa') || c.includes('razaosocial') || c.includes('customer'))) {
                  headerRowIndex = i;
                  break;
                }
            }
            if (headerRowIndex === -1 && dataArr.length > 0) headerRowIndex = 0;

            const headers = dataArr[headerRowIndex].map((h: any) => String(h));
            const rows = dataArr.slice(headerRowIndex + 1);

            const getIndex = (aliases: string[]) => {
                return headers.findIndex(h => {
                  const cleanH = cleanKey(h);
                  return aliases.some(a => cleanKey(a) === cleanH || cleanH.includes(cleanKey(a)));
                });
            };

            const colMap = {
              id: getIndex(['id', 'codigo', 'cod']),
              cliente: getIndex(['cliente', 'nome', 'customer', 'empresa', 'client', 'razaosocial', 'parceiro']),
              type: getIndex(['type', 'tipo', 'categoria', 'natureza']),
              fat_atual: getIndex(['fat_atual', 'fatatual', 'faturamentoatual', 'faturamento', 'atual', 'fat', 'venda', 'total', 'valor']),
              med_ult_3m: getIndex(['med_ult_3m', 'medult3m', 'mediault3m', 'media3m', 'media', 'med']),
              perc: getIndex(['perc', 'percentual', 'performance', 'perf', '%', 'atingimento']),
              part_med: getIndex(['part_med', 'partmed', 'share', 'participacao', 'part']),
              gap: getIndex(['gap', 'diferenca', 'diff']),
              fat_aa: getIndex(['fat_aa', 'fataa', 'fatanoanterior', 'anoanterior', 'aa', 'anopassado']),
              perc_fat_aa: getIndex(['perc_fat_aa', 'percfataa', 'crescimentoaa', 'percaa', '%aa']),
              fat_m1: getIndex(['fat_m1', 'fatm1', 'm1', 'mes1', 'm-1']),
              fat_m2: getIndex(['fat_m2', 'fatm2', 'm2', 'mes2', 'm-2']),
              fat_m3: getIndex(['fat_m3', 'fatm3', 'm3', 'mes3', 'm-3']),
              fat_m4: getIndex(['fat_m4', 'fatm4', 'm4', 'mes4', 'm-4']),
              fat_m5: getIndex(['fat_m5', 'fatm5', 'm5', 'mes5', 'm-5']),
              fat_m6: getIndex(['fat_m6', 'fatm6', 'm6', 'mes6', 'm-6']),
            };

            if (colMap.cliente === -1) {
                showNotification('error', "Coluna 'Cliente' não encontrada. Verifique o cabeçalho.");
                return;
            }

            const newClientData: ClientData[] = rows
              .map((row) => {
                  const getVal = (idx: number) => idx !== -1 ? row[idx] : undefined;
                  const fatAtual = parseNumber(getVal(colMap.fat_atual));
                  const med3m = parseNumber(getVal(colMap.med_ult_3m));
                  const fatAA = parseNumber(getVal(colMap.fat_aa));
                  const perc = colMap.perc !== -1 ? parseNumber(getVal(colMap.perc)) : (med3m > 0 ? (fatAtual / med3m) * 100 : 0);
                  const gap = colMap.gap !== -1 ? parseNumber(getVal(colMap.gap)) : (fatAtual - med3m);
                  const percFatAA = colMap.perc_fat_aa !== -1 ? parseNumber(getVal(colMap.perc_fat_aa)) : (fatAA > 0 ? (fatAtual / fatAA) * 100 : 0);

                  return {
                    id: getVal(colMap.id) || Math.random().toString(36).substr(2, 9),
                    vendedor: vendorName, // Assign the user-provided vendor name
                    cliente: getVal(colMap.cliente) || '',
                    type: (getVal(colMap.type) || 'LTDA') as any,
                    fat_atual: fatAtual,
                    med_ult_3m: med3m,
                    perc: perc,
                    part_med: parseNumber(getVal(colMap.part_med)),
                    gap: gap,
                    fat_aa: fatAA,
                    perc_fat_aa: percFatAA,
                    fat_m1: parseNumber(getVal(colMap.fat_m1)),
                    fat_m2: parseNumber(getVal(colMap.fat_m2)),
                    fat_m3: parseNumber(getVal(colMap.fat_m3)),
                    fat_m4: parseNumber(getVal(colMap.fat_m4)),
                    fat_m5: parseNumber(getVal(colMap.fat_m5)),
                    fat_m6: parseNumber(getVal(colMap.fat_m6)),
                  };
              })
              .filter(item => item.cliente && item.cliente.trim() !== '' && item.cliente !== 'Cliente Desconhecido');

            if (newClientData.length > 0) {
              // MERGE LOGIC: Remove existing data for this vendor, append new data
              setData(prevData => {
                const otherVendorsData = prevData.filter(d => d.vendedor !== vendorName);
                return [...otherVendorsData, ...newClientData];
              });
              
              setDashboardKey(prev => prev + 1);
              setActiveVendor(vendorName); // Auto-switch to the new vendor
              showNotification('success', `Adicionado! ${newClientData.length} clientes para ${vendorName}.`);
            } else {
                showNotification('error', "Nenhum dado válido encontrado.");
            }
          } else {
            showNotification('error', "A planilha está vazia.");
          }
        } catch (error) {
          console.error(error);
          showNotification('error', "Erro técnico ao ler o arquivo.");
        }
      }
    };
    reader.onerror = () => showNotification('error', "Erro ao ler o arquivo.");
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12 relative">
      {/* Notifications */}
      {notification.type !== 'idle' && notification.type !== 'loading' && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
            notification.type === 'success' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-rose-600 text-white border-rose-700'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <span className="font-medium text-lg">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {notification.type === 'loading' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-blue-600 animate-spin" />
            <p className="text-lg font-semibold text-slate-700 animate-pulse">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Vendor Input Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-up">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Identificar Vendedor</h3>
            <p className="text-slate-500 text-sm mb-6">
              Para organizar os dados, informe a quem pertence esta planilha de vendas.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Vendedor</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ex: João Silva"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={vendorNameInput}
                  onChange={(e) => setVendorNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmUpload()}
                />
              </div>
              {uniqueVendors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                   {uniqueVendors.map(v => (
                     <button 
                        key={v}
                        onClick={() => setVendorNameInput(v)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition-colors"
                     >
                        {v}
                     </button>
                   ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setShowVendorModal(false); setPendingFile(null); }}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmUpload}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 transition-all"
              >
                Confirmar e Processar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Sales<span className="text-blue-600">Vision</span></h1>
              <p className="text-xs text-slate-500">Multi-Vendor Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Vendor Filter */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
               <Filter size={16} className="text-slate-400" />
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Visão:</span>
               <select 
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                  value={activeVendor}
                  onChange={(e) => setActiveVendor(e.target.value)}
               >
                  <option value="Todos">Todas as Vendas</option>
                  {uniqueVendors.map(v => (
                     <option key={v} value={v}>{v}</option>
                  ))}
               </select>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <button 
              onClick={handleUploadClick}
              disabled={notification.type === 'loading'}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadCloud size={18} />
              <span className="hidden sm:inline">Adicionar Dados</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" key={dashboardKey}>
        
        {/* Title Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h2 className="text-2xl font-bold text-slate-800">
                  {activeVendor === 'Todos' ? 'Visão Geral (Todos)' : `Painel: ${activeVendor}`}
               </h2>
               {activeVendor !== 'Todos' && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                     Vendedor
                  </span>
               )}
            </div>
            <p className="text-slate-500">
               {displayedData.length} clientes listados nesta visualização.
            </p>
          </div>
          
          {/* Mobile Filter */}
          <div className="md:hidden w-full">
             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Filtrar Vendedor</label>
             <select 
                  className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2.5"
                  value={activeVendor}
                  onChange={(e) => setActiveVendor(e.target.value)}
               >
                  <option value="Todos">Todas as Vendas</option>
                  {uniqueVendors.map(v => (
                     <option key={v} value={v}>{v}</option>
                  ))}
               </select>
          </div>
        </div>

        {displayedData.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <FileSpreadsheet size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600">Nenhum dado encontrado para esta visão</h3>
              <p className="text-slate-400 text-sm mt-1">Faça upload de uma planilha ou mude o filtro.</p>
           </div>
        ) : (
          <>
            {/* KPIs */}
            <KPICards data={displayedData} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <RevenueBarChart data={displayedData} />
                <TrendLineChart data={displayedData} />
              </div>
              
              <div className="flex flex-col gap-6">
                <MatrixScatterChart data={displayedData} />
                <AlertPanel data={displayedData} />
              </div>
            </div>

            {/* Detail Table */}
            <ClientTable data={displayedData} />
          </>
        )}
        
      </main>
    </div>
  );
};

export default App;