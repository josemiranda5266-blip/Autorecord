export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKm(mileage: number): string {
  if (isNaN(mileage) || mileage === null || mileage === undefined) return '0 km';
  return new Intl.NumberFormat('es-AR').format(mileage) + ' km';
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateLong(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getDaysDifference(targetDateString: string): number {
  if (!targetDateString) return 999;
  let target: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(targetDateString)) {
    const [y, m, d] = targetDateString.split('-').map(Number);
    target = new Date(y, m - 1, d);
  } else {
    target = new Date(targetDateString);
  }
  if (isNaN(target.getTime())) return 999;
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
