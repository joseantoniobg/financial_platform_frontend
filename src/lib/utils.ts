import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string | undefined) => {
  if (!date) return '';
  const dateStr = new Date(date).toISOString().split('T')[0];
  return `${dateStr.substring(8,10)}/${dateStr.substring(5,7)}/${dateStr.substring(0,4)}`;
};

export const validateDateString = (date: string): boolean => {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;
  if (!regex.test(date)) return false;

  const [day, month, year] = date.split('/').map(Number);
  const isoDate = new Date(year, month - 1, day);
  return isoDate.getFullYear() === year && isoDate.getMonth() === month - 1 && isoDate.getDate() === day;
}

export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};