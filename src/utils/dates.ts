import { format, addDays, parseISO, isValid } from 'date-fns';

export function formatDate(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, 'MMM d, yyyy');
}

export function toDate(dateStr: string | null): Date {
  if (!dateStr) return new Date();
  const d = parseISO(dateStr);
  return isValid(d) ? d : new Date();
}

export function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function addDaysToStr(dateStr: string, days: number): string {
  return toDateStr(addDays(toDate(dateStr), days));
}

export function today(): string {
  return toDateStr(new Date());
}
