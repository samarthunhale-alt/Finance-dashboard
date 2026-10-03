import { ApiError } from './ApiError.js';

export const currentMonth = () => new Date().toISOString().slice(0, 7);

/** Returns the [start, end) UTC range for a "YYYY-MM" string. */
export function monthRange(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) {
    throw ApiError.badRequest('month must be in YYYY-MM format');
  }
  const [year, mon] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, mon - 1, 1)),
    end: new Date(Date.UTC(year, mon, 1)),
  };
}

/** Last n months as "YYYY-MM", oldest first, ending with the current month. */
export function lastNMonths(n) {
  const now = new Date();
  const months = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
