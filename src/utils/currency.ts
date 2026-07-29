/**
 * Formats a number as Argentine Currency format e.g. "$ 12.500"
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '$ 0';
  
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `$ ${formatted}`;
};

/**
 * Formats a decimal percentage e.g. 0.60 -> "60%"
 */
export const formatPercent = (value: number): string => {
  if (isNaN(value)) return '0%';
  return `${Math.round(value * 100)}%`;
};

/**
 * Formats an ISO date or timestamp into a friendly Argentine date format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};

/**
 * Formats short date e.g. "29/07/2026"
 */
export const formatShortDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};
