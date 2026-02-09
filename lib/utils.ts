// Utility function for merging Tailwind classes
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Format numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

// Determine risk level based on threshold
export function getRiskLevel(value: number, thresholds: {
  low: number;
  medium: number;
}): 'low' | 'medium' | 'high' {
  if (value < thresholds.low) return 'low';
  if (value < thresholds.medium) return 'medium';
  return 'high';
}

// Color mapping for risk levels
export const riskColors = {
  low: 'bg-green-50 text-green-800 border-green-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-red-50 text-red-800 border-red-200',
};

// Chart colors
export const chartColors = {
  delivered: '#10b981',
  shipped: '#3b82f6',
  processing: '#f59e0b',
  canceled: '#ef4444',
  created: '#6b7280',
  invoiced: '#8b5cf6',
  approved: '#f97316',
  unavailable: '#ec4899',
};
