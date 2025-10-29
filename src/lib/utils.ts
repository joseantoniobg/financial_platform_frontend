import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string) => {
  const dateStr = new Date(date).toISOString().split('T')[0];
  return `${dateStr.substring(8,10)}/${dateStr.substring(5,7)}/${dateStr.substring(0,4)}`;
};