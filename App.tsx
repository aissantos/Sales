import React, { useState, useRef } from 'react';
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
  XCircle 
} from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<ClientData[]>(MOCK_DATA);
  const [dashboardKey, setDashboardKey] = useState(0); // Used to force re-render/reset of components
  const [notification, setNotification] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const cleanKey = (k: string) => k ? k.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  const parseNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      // Remove 'R$', space, non-breaking space
      let clean = val.replace(/[R$\s\u00A0]/g, '');
      if (!clean) return 0;
      
      // Handle PT-BR format (1.234,56) vs US format (1,234.56)
      // Heuristic: If comma appears after the last dot, or comma exists but no dot, treat as decimal separator (PT-BR)
      const lastComma = clean.lastIndexOf(',');
      const lastDot = clean.lastIndexOf('.');

      if (lastComma > lastDot) {
        // Likely PT-BR: 1.000,00 or 1000,00
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        // Likely US: 1,000.00 or 1000.00 or 1000
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set loading state
    setNotification({ type: 'loading', message: 'Carregando dados...' });

    // Wait a brief moment to ensure UI updates before heavy processing
    setTimeout(() => {
      // Clear existing data immediately to ensure we only work with the new file's data
      setData([]);

      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        if (bstr) {
          try {
            // Robustly access XLSX library (handle ESM vs CommonJS default exports)
            // @ts-ignore
            const lib = XLSX.read ? XLSX : (XLSX.default || XLSX);
            
            if (!lib.read) {
               throw new Error("Erro ao carregar biblioteca XLSX");
            }

            const wb = lib.read(bstr, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            
            // Get data as array of arrays
            const dataArr = lib.utils.sheet_to_json(ws, { header: 1 }) as any[][];
            
            console.log("Raw Excel Data (Arrays):", dataArr);

            if (dataArr && dataArr.length > 0) {
              // SMART HEADER DETECTION
              // Look for a row that contains "cliente", "nome", or "empresa" to identify the header row
              let headerRowIndex = -1;
              
              for (let i = 0; i < Math.min(dataArr.length, 20); i++) {
                 const rowStr = dataArr[i].map((cell: any) => cleanKey(String(cell || '')));
                 if (rowStr.some((c: string) => c.includes('cliente') || c.includes('nome') || c.includes('empresa') || c.includes('razaosocial') || c.includes('customer'))) {
                    headerRowIndex = i;
                    break;
                 }
              }

              // Fallback: If no header found, try row 0
              if (headerRowIndex === -1 && dataArr.length > 0) headerRowIndex = 0;

              console.log("Header found at index:", headerRowIndex);

              const headers = dataArr[headerRowIndex].map((h: any) => String(h));
              const rows = dataArr.slice(headerRowIndex + 1);

              // Create a map of column aliases to indices
              const getIndex = (aliases: string[]) => {
                 return headers.findIndex(h => {
                   const cleanH = cleanKey(h);
                   return aliases.some(a => cleanKey(a) === cleanH || cleanH.includes(cleanKey(a)));
                 });
              };

              // Calculate indices once
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

              console.log("Column Mapping:", colMap);

              // Check if at least 'cliente' and 'fat_atual' (or similar) were found to proceed safely
              if (colMap.cliente === -1) {
                 showNotification('error', "Coluna 'Cliente' não encontrada. Verifique o cabeçalho.");
                 return;
              }

              const processedData: ClientData[] = rows
                .map((row) => {
                   const getVal = (idx: number) => idx !== -1 ? row[idx] : undefined;
                   
                   // Basic data extraction
                   const fatAtual = parseNumber(getVal(colMap.fat_atual));
                   const med3m = parseNumber(getVal(colMap.med_ult_3m));
                   const fatAA = parseNumber(getVal(colMap.fat_aa));

                   // Auto-calculate derived metrics if missing in Excel
                   const perc = colMap.perc !== -1 ? parseNumber(getVal(colMap.perc)) : (med3m > 0 ? (fatAtual / med3m) * 100 : 0);
                   const gap = colMap.gap !== -1 ? parseNumber(getVal(colMap.gap)) : (fatAtual - med3m);
                   const percFatAA = colMap.perc_fat_aa !== -1 ? parseNumber(getVal(colMap.perc_fat_aa)) : (fatAA > 0 ? (fatAtual / fatAA) * 100 : 0);

                   return {
                      id: getVal(colMap.id) || Math.random().toString(36).substr(2, 9),
                      cliente: getVal(colMap.cliente) || '',
                      type: (getVal(colMap.type) || 'LTDA') as any,
                      fat_atual: fatAtual,
                      med_ult_3m: med3m,
                      perc: perc,
                      part_med: parseNumber(getVal(colMap.part_med)), // If missing, user might want to calculate total share later, but keeping 0 for now
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
                // Filter out empty rows or rows where client name was not found
                .filter(item => item.cliente && item.cliente.trim() !== '' && item.cliente !== 'Cliente Desconhecido');

              console.log("Processed Data:", processedData);
              
              if (processedData.length > 0) {
                setData(processedData);
                setDashboardKey(prev => prev + 1);
                showNotification('success', `Sucesso! ${processedData.length} registros importados.`);
              } else {
                 showNotification('error', "Nenhum dado válido encontrado. Verifique se a coluna 'Cliente' existe.");
              }
            } else {
              showNotification('error', "A planilha está vazia.");
            }
          } catch (error) {
            console.error("Erro ao processar arquivo:", error);
            showNotification('error', "Erro técnico ao ler o arquivo.");
          }
        }
      };
      
      reader.onerror = () => {
         showNotification('error', "Erro ao ler o arquivo.");
      };

      reader.readAsArrayBuffer(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12 relative">
      {/* Notifications / Toast */}
      {notification.type !== 'idle' && notification.type !== 'loading' && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-700' 
              : 'bg-rose-600 text-white border-rose-700'
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

      {/* Hidden File Input */}
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Sales<span className="text-blue-600">Vision</span></h1>
              <p className="text-xs text-slate-500">Performance Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleUploadClick}
              disabled={notification.type === 'loading'}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadCloud size={16} />
              <span className="hidden sm:inline">Upload Excel</span>
            </button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors">
              <Share2 size={16} />
              Compartilhar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all">
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" key={dashboardKey}>
        
        {/* Title Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Visão Geral de Faturamento</h2>
            <p className="text-slate-500 mt-1">Análise de desempenho mensal vs metas e histórico.</p>
          </div>
          {data === MOCK_DATA && (
             <div className="hidden md:flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                <FileSpreadsheet size={14} />
                Visualizando dados de exemplo. Faça upload para ver seus dados.
             </div>
          )}
        </div>

        {/* KPIs */}
        <KPICards data={data} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Charts - Takes up 2 columns */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <RevenueBarChart data={data} />
            <TrendLineChart data={data} />
          </div>
          
          {/* Sidebar Charts - Takes up 1 column */}
          <div className="flex flex-col gap-6">
            <MatrixScatterChart data={data} />
            <AlertPanel data={data} />
          </div>
        </div>

        {/* Detail Table */}
        <ClientTable data={data} />
        
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2024 SalesVision Analytics. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;