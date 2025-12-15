export interface ClientData {
  id: string;
  vendedor: string; // New field to identify the sales rep
  cliente: string;
  type: 'EPP' | 'ME' | 'LTDA' | 'SA';
  fat_atual: number;
  med_ult_3m: number;
  perc: number; // Current vs 3M Avg %
  part_med: number; // Share %
  gap: number;
  fat_aa: number;
  perc_fat_aa: number; // Current vs Last Year %
  fat_m1: number;
  fat_m2: number;
  fat_m3: number;
  fat_m4: number;
  fat_m5: number;
  fat_m6: number;
}

export type SortField = 'cliente' | 'fat_atual' | 'med_ult_3m' | 'perc' | 'gap' | 'perc_fat_aa' | 'vendedor';
export type SortDirection = 'asc' | 'desc';

export interface Alert {
  id: string;
  type: 'danger' | 'success' | 'warning';
  message: string;
  clientName: string;
  value: string;
}