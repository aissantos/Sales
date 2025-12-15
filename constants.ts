import { ClientData } from './types';

export const MOCK_DATA: ClientData[] = [
  {
    id: "1",
    cliente: "Supermercado Sao Braz Ltda",
    type: "LTDA",
    fat_atual: 36428,
    med_ult_3m: 93508,
    perc: 38.96,
    part_med: 38.25,
    gap: 57080,
    fat_aa: 49847,
    perc_fat_aa: 73.08,
    fat_m1: 108239,
    fat_m2: 101188,
    fat_m3: 71097,
    fat_m4: 85406,
    fat_m5: 79357,
    fat_m6: 93005
  },
  {
    id: "2",
    cliente: "Comercial Santos EPP",
    type: "EPP",
    fat_atual: 125000,
    med_ult_3m: 105000,
    perc: 119.04,
    part_med: 12.5,
    gap: -20000,
    fat_aa: 98000,
    perc_fat_aa: 127.55,
    fat_m1: 110000,
    fat_m2: 102000,
    fat_m3: 103000,
    fat_m4: 95000,
    fat_m5: 92000,
    fat_m6: 90000
  },
  {
    id: "3",
    cliente: "Mercadinho da Vila ME",
    type: "ME",
    fat_atual: 15400,
    med_ult_3m: 16000,
    perc: 96.25,
    part_med: 5.1,
    gap: 600,
    fat_aa: 14000,
    perc_fat_aa: 110.00,
    fat_m1: 15800,
    fat_m2: 16200,
    fat_m3: 16000,
    fat_m4: 15500,
    fat_m5: 15000,
    fat_m6: 14800
  },
  {
    id: "4",
    cliente: "Hiper Atacado do Norte SA",
    type: "SA",
    fat_atual: 450000,
    med_ult_3m: 380000,
    perc: 118.42,
    part_med: 45.0,
    gap: -70000,
    fat_aa: 350000,
    perc_fat_aa: 128.57,
    fat_m1: 390000,
    fat_m2: 375000,
    fat_m3: 375000,
    fat_m4: 360000,
    fat_m5: 355000,
    fat_m6: 340000
  },
  {
    id: "5",
    cliente: "Padaria Pão Quente",
    type: "ME",
    fat_atual: 8200,
    med_ult_3m: 12000,
    perc: 68.33,
    part_med: 2.5,
    gap: 3800,
    fat_aa: 11000,
    perc_fat_aa: 74.54,
    fat_m1: 11500,
    fat_m2: 12500,
    fat_m3: 12000,
    fat_m4: 11800,
    fat_m5: 11500,
    fat_m6: 11000
  },
  {
    id: "6",
    cliente: "Farmácia Saúde Total",
    type: "LTDA",
    fat_atual: 62000,
    med_ult_3m: 60000,
    perc: 103.33,
    part_med: 18.0,
    gap: -2000,
    fat_aa: 55000,
    perc_fat_aa: 112.72,
    fat_m1: 61000,
    fat_m2: 59000,
    fat_m3: 60000,
    fat_m4: 58000,
    fat_m5: 56000,
    fat_m6: 55000
  },
  {
    id: "7",
    cliente: "Restaurante Sabor Mineiro",
    type: "EPP",
    fat_atual: 28000,
    med_ult_3m: 35000,
    perc: 80.00,
    part_med: 9.5,
    gap: 7000,
    fat_aa: 32000,
    perc_fat_aa: 87.50,
    fat_m1: 34000,
    fat_m2: 36000,
    fat_m3: 35000,
    fat_m4: 33000,
    fat_m5: 31000,
    fat_m6: 30000
  },
  {
    id: "8",
    cliente: "Auto Peças Veloz",
    type: "LTDA",
    fat_atual: 95000,
    med_ult_3m: 80000,
    perc: 118.75,
    part_med: 22.0,
    gap: -15000,
    fat_aa: 70000,
    perc_fat_aa: 135.71,
    fat_m1: 82000,
    fat_m2: 78000,
    fat_m3: 80000,
    fat_m4: 75000,
    fat_m5: 72000,
    fat_m6: 70000
  },
  {
    id: "9",
    cliente: "Livraria Leitura",
    type: "ME",
    fat_atual: 12000,
    med_ult_3m: 18000,
    perc: 66.66,
    part_med: 3.0,
    gap: 6000,
    fat_aa: 19000,
    perc_fat_aa: 63.15,
    fat_m1: 17000,
    fat_m2: 18500,
    fat_m3: 18500,
    fat_m4: 19000,
    fat_m5: 18000,
    fat_m6: 18500
  },
  {
    id: "10",
    cliente: "Tech Solutions SA",
    type: "SA",
    fat_atual: 210000,
    med_ult_3m: 195000,
    perc: 107.69,
    part_med: 25.5,
    gap: -15000,
    fat_aa: 180000,
    perc_fat_aa: 116.66,
    fat_m1: 198000,
    fat_m2: 192000,
    fat_m3: 195000,
    fat_m4: 188000,
    fat_m5: 185000,
    fat_m6: 180000
  }
];

export const COLORS = {
  primary: '#2563eb', // blue-600
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#f43f5e', // rose-500
  neutral: '#64748b', // slate-500
  white: '#ffffff',
  background: '#f8fafc',
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};
