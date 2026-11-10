import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// UI styling tool
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Naira formatting tool
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Date formatting tool
export function formatDateTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
