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

export const formatUrlParams = (params: object) => {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(val => {
        urlParams.append(key, String(val));
      });
      return;
    }

    if (value !== undefined && value !== null && value !== 'None' && value !== '') {
      urlParams.append(key, String(value));
    }
  });
  return urlParams;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupSum(array: any[], groupField: string, sumField: string, sumField2?: string) {
  return Object.values(
    array.reduce((acc, item) => {
      const key = item[groupField];
      if (!acc[key]) {
        if (sumField2) {
          acc[key] = { [groupField]: key, [sumField]: 0, [sumField2]: 0 };
        } else {
          acc[key] = { [groupField]: key, [sumField]: 0 };
        }
      }
      acc[key][sumField] += Number(item[sumField]) || 0;
      if (sumField2) {
        acc[key][sumField2] += Number(item[sumField2]) || 0;
      }
      return acc;
    }, {})
  );
}