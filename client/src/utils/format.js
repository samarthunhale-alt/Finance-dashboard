const LOCALES = { INR: 'en-IN' };

export function makeMoney(currency = 'USD') {
  const fmt = new Intl.NumberFormat(LOCALES[currency] || 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  });
  return (value) => fmt.format(Number(value) || 0);
}

export function makeCompactMoney(currency = 'USD') {
  const fmt = new Intl.NumberFormat(LOCALES[currency] || 'en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return (value) => fmt.format(Number(value) || 0);
}

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : '-';

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never';

export const monthLabel = (ym) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });

export const monthLong = (ym) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const currentMonth = () => new Date().toISOString().slice(0, 7);
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const pct = (n) => `${Math.round((Number(n) || 0) * 10) / 10}%`;
