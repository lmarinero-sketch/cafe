import { Order, CashRegister } from '../types';

/**
 * Default operational cutoff hour in 24h format (e.g. 5 means 05:00 AM).
 * Orders placed between 05:00 AM today and 04:59 AM tomorrow belong to today's shift.
 */
export const OPERATIONAL_CUTOFF_HOUR = 5;

/**
 * Returns the operational business date string formatted as "YYYY-MM-DD"
 * considering the overnight shift cutoff hour.
 * 
 * If the order was created at 01:30 AM on Thursday, its operational date is Wednesday.
 */
export function getOperationalDate(dateInput: Date | string = new Date(), cutoffHour: number = OPERATIONAL_CUTOFF_HOUR): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`;
  }

  // If the time is before the cutoff hour (e.g., between 00:00 and 04:59),
  // it belongs to the previous calendar day's shift
  if (d.getHours() < cutoffHour) {
    d.setDate(d.getDate() - 1);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether an order belongs to the current active shift.
 * 
 * An order is part of the current shift if:
 * 1. It is tied to the currently open Cash Register (if activeRegister is provided and order has registerId), OR
 * 2. Its operational date matches today's operational date.
 */
export function isOrderInCurrentShift(
  order: Order,
  activeRegister?: CashRegister | null,
  cutoffHour: number = OPERATIONAL_CUTOFF_HOUR
): boolean {
  if (!order || !order.createdAt) return false;

  // If an active register is open and this order is tied to it, it is part of this shift
  if (activeRegister && activeRegister.status === 'abierta' && order.registerId === activeRegister.id) {
    return true;
  }

  const currentOpDate = getOperationalDate(new Date(), cutoffHour);
  const orderOpDate = getOperationalDate(order.createdAt, cutoffHour);

  return currentOpDate === orderOpDate;
}

/**
 * Formats a friendly label for the current operational shift (e.g. "Miércoles 2 de Septiembre")
 */
export function getShiftDisplayLabel(dateInput: Date | string = new Date(), cutoffHour: number = OPERATIONAL_CUTOFF_HOUR): string {
  const opDateStr = getOperationalDate(dateInput, cutoffHour);
  const [year, month, day] = opDateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day, 12, 0, 0);

  const formatter = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatted = formatter.format(dateObj);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Filter presets for Order History
 */
export type DatePreset = 'hoy' | 'ayer' | 'ultimos_7_dias' | 'este_mes' | 'personalizado' | 'todos';

export function filterOrdersByDate(
  orders: Order[],
  preset: DatePreset,
  customFrom?: string,
  customTo?: string,
  cutoffHour: number = OPERATIONAL_CUTOFF_HOUR
): Order[] {
  const todayOpDate = getOperationalDate(new Date(), cutoffHour);

  switch (preset) {
    case 'hoy':
      return orders.filter(o => getOperationalDate(o.createdAt, cutoffHour) === todayOpDate);

    case 'ayer': {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayOpDate = getOperationalDate(yesterday, cutoffHour);
      return orders.filter(o => getOperationalDate(o.createdAt, cutoffHour) === yesterdayOpDate);
    }

    case 'ultimos_7_dias': {
      const limit = new Date();
      limit.setDate(limit.getDate() - 7);
      const limitOpDate = getOperationalDate(limit, cutoffHour);
      return orders.filter(o => {
        const opDate = getOperationalDate(o.createdAt, cutoffHour);
        return opDate >= limitOpDate && opDate <= todayOpDate;
      });
    }

    case 'este_mes': {
      const [year, month] = todayOpDate.split('-');
      const prefix = `${year}-${month}`;
      return orders.filter(o => getOperationalDate(o.createdAt, cutoffHour).startsWith(prefix));
    }

    case 'personalizado': {
      if (!customFrom && !customTo) return orders;
      return orders.filter(o => {
        const opDate = getOperationalDate(o.createdAt, cutoffHour);
        if (customFrom && customTo) {
          return opDate >= customFrom && opDate <= customTo;
        }
        if (customFrom) return opDate >= customFrom;
        if (customTo) return opDate <= customTo;
        return true;
      });
    }

    case 'todos':
    default:
      return orders;
  }
}
